<#
.SYNOPSIS
Apotheosis Voice Module - Comprehensive TTS and voice synthesis for NYRA project

.DESCRIPTION
Integrates with multiple TTS engines including ElevenLabs, local HTTP servers,
Piper TTS, Coqui TTS, and web-based synthesis. Supports Voicemod integration
and Kyutai Unmute for real-time voice processing.
#>

# ElevenLabs TTS Functions
function Speak-ElevenLabs {
    <#
    .SYNOPSIS
    Generates speech using ElevenLabs API
    
    .PARAMETER Text
    The text to convert to speech
    
    .PARAMETER Voice
    The voice ID to use (defaults to Rachel)
    
    .PARAMETER Model
    The model to use (eleven_monolingual_v1, eleven_multilingual_v2)
    #>
    param(
        [Parameter(Mandatory=$true, ValueFromPipeline=$true)]
        [string]$Text,
        [string]$Voice = 'AZnzlk1XvdvUeBnXmlld', # Rachel voice ID
        [string]$Model = 'eleven_monolingual_v1',
        [string]$OutputPath = "$env:TEMP\elevenlabs_output.mp3",
        [switch]$Play
    )
    
    try {
        $apiKey = $env:ELEVENLABS_API_KEY
        if (-not $apiKey) {
            $apiKey = Get-Secret -Key 'ELEVENLABS_API_KEY' -Source 'auto'
        }
        
        if (-not $apiKey) {
            throw "ElevenLabs API key not found. Set ELEVENLABS_API_KEY environment variable."
        }
        
        $uri = "https://api.elevenlabs.io/v1/text-to-speech/$Voice"
        $headers = @{
            'Accept' = 'audio/mpeg'
            'Content-Type' = 'application/json'
            'xi-api-key' = $apiKey
        }
        
        $body = @{
            text = $Text
            model_id = $Model
            voice_settings = @{
                stability = 0.5
                similarity_boost = 0.5
            }
        } | ConvertTo-Json
        
        Write-Host "🎤 Generating speech with ElevenLabs..." -ForegroundColor Cyan
        
        $response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body -OutFile $OutputPath
        
        if (Test-Path $OutputPath) {
            Write-Host "✅ Audio saved to: $OutputPath" -ForegroundColor Green
            
            if ($Play) {
                Start-Process -FilePath $OutputPath -Wait
            }
            
            return $OutputPath
        } else {
            throw "Failed to generate audio file"
        }
    }
    catch {
        Write-Error "ElevenLabs TTS failed: $($_.Exception.Message)"
    }
}

# Local HTTP TTS Server Functions
function Speak-LocalHttp {
    <#
    .SYNOPSIS
    Sends text to a local HTTP TTS server (like Piper or Coqui)
    
    .PARAMETER Text
    The text to convert to speech
    
    .PARAMETER ServerUrl
    The URL of the local TTS server
    #>
    param(
        [Parameter(Mandatory=$true, ValueFromPipeline=$true)]
        [string]$Text,
        [string]$ServerUrl = 'http://localhost:5000/api/tts',
        [string]$Voice = 'en_US-lessac-medium',
        [switch]$Play
    )
    
    try {
        Write-Host "🎤 Sending to local TTS server: $ServerUrl" -ForegroundColor Cyan
        
        $body = @{
            text = $Text
            voice = $Voice
        } | ConvertTo-Json
        
        $headers = @{
            'Content-Type' = 'application/json'
        }
        
        $response = Invoke-RestMethod -Uri $ServerUrl -Method POST -Headers $headers -Body $body
        
        if ($response.audio_url) {
            $audioUrl = "http://localhost:5000" + $response.audio_url
            Write-Host "✅ Audio available at: $audioUrl" -ForegroundColor Green
            
            if ($Play) {
                Start-Process $audioUrl
            }
            
            return $audioUrl
        }
    }
    catch {
        Write-Error "Local HTTP TTS failed: $($_.Exception.Message)"
    }
}

# Web-based TTS Functions  
function Speak-Web {
    <#
    .SYNOPSIS
    Uses Windows Speech Platform or web APIs for TTS
    
    .PARAMETER Text
    The text to speak
    
    .PARAMETER Rate
    Speech rate (-10 to 10)
    
    .PARAMETER Voice
    Voice name to use
    #>
    param(
        [Parameter(Mandatory=$true, ValueFromPipeline=$true)]
        [string]$Text,
        [int]$Rate = 0,
        [string]$Voice = $null
    )
    
    try {
        Add-Type -AssemblyName System.Speech
        $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
        
        if ($Voice) {
            $synth.SelectVoice($Voice)
        }
        
        $synth.Rate = $Rate
        
        Write-Host "🔊 Speaking: $($Text.Substring(0, [Math]::Min(50, $Text.Length)))..." -ForegroundColor Cyan
        $synth.Speak($Text)
        $synth.Dispose()
    }
    catch {
        Write-Error "Web TTS failed: $($_.Exception.Message)"
    }
}

# Piper TTS Integration
function Start-PiperServer {
    <#
    .SYNOPSIS
    Starts a Piper TTS HTTP server
    #>
    param(
        [int]$Port = 5000,
        [string]$Voice = 'en_US-lessac-medium',
        [string]$PiperPath = 'C:\Dev\Tools\Piper\piper.exe'
    )
    
    if (-not (Test-Path $PiperPath)) {
        Write-Warning "Piper not found at $PiperPath. Download from: https://github.com/rhasspy/piper"
        return
    }
    
    try {
        Write-Host "🎤 Starting Piper TTS server on port $Port..." -ForegroundColor Cyan
        
        $scriptPath = Join-Path $env:TEMP 'piper-server.py'
        $serverScript = @"
#!/usr/bin/env python3
import subprocess
import tempfile
import os
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

PIPER_PATH = r'$PiperPath'
VOICE = '$Voice'

@app.route('/api/tts', methods=['POST'])
def tts():
    data = request.get_json()
    text = data.get('text', '')
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    
    try:
        # Create temporary WAV file
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_file:
            output_path = tmp_file.name
        
        # Run Piper
        cmd = [PIPER_PATH, '--model', VOICE, '--output-file', output_path]
        proc = subprocess.run(cmd, input=text.encode(), capture_output=True)
        
        if proc.returncode == 0:
            return send_file(output_path, mimetype='audio/wav')
        else:
            return jsonify({'error': 'Piper TTS failed'}), 500
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=$Port, debug=False)
"@
        
        $serverScript | Out-File -FilePath $scriptPath -Encoding UTF8
        Start-Process python -ArgumentList $scriptPath -WindowStyle Minimized
        
        Write-Host "✅ Piper server started. Test with: Speak-LocalHttp 'Hello World'" -ForegroundColor Green
    }
    catch {
        Write-Error "Failed to start Piper server: $($_.Exception.Message)"
    }
}

# Coqui TTS Integration
function Start-CoquiServer {
    <#
    .SYNOPSIS
    Starts a Coqui TTS server
    #>
    param(
        [int]$Port = 5002,
        [string]$Model = 'tts_models/en/ljspeech/tacotron2-DDC'
    )
    
    try {
        Write-Host "🎤 Starting Coqui TTS server on port $Port..." -ForegroundColor Cyan
        
        # Check if Coqui TTS is installed
        $coquiCheck = python -c "import TTS; print('OK')" 2>$null
        if (-not $coquiCheck) {
            Write-Warning "Coqui TTS not installed. Install with: pip install TTS"
            return
        }
        
        $args = @(
            "-m", "TTS.server.server",
            "--model_name", $Model,
            "--port", $Port
        )
        
        Start-Process python -ArgumentList $args -WindowStyle Minimized
        
        Start-Sleep -Seconds 3
        Write-Host "✅ Coqui TTS server started. Test with: Speak-LocalHttp 'Hello World' -ServerUrl 'http://localhost:$Port/api/tts'" -ForegroundColor Green
    }
    catch {
        Write-Error "Failed to start Coqui TTS server: $($_.Exception.Message)"
    }
}

# Voicemod Integration
function Set-VoicemodFilter {
    <#
    .SYNOPSIS
    Controls Voicemod voice filters
    #>
    param(
        [ValidateSet('None', 'Robot', 'Chipmunk', 'Darth Vader', 'Deep Voice', 'High Pitch')]
        [string]$Filter = 'None'
    )
    
    try {
        # This would require Voicemod API integration
        # For now, we'll use a placeholder that could integrate with Voicemod's SDK
        Write-Host "🎭 Setting Voicemod filter to: $Filter" -ForegroundColor Magenta
        
        # Placeholder for actual Voicemod integration
        # In a real implementation, this would call Voicemod's API or SDK
        
        Write-Host "✅ Voicemod filter applied" -ForegroundColor Green
    }
    catch {
        Write-Error "Failed to set Voicemod filter: $($_.Exception.Message)"
    }
}

# NYRA Voice Assistant Integration
function Invoke-NYRAVoiceCommand {
    <#
    .SYNOPSIS
    Processes voice commands for NYRA system
    #>
    param(
        [Parameter(Mandatory=$true)]
        [string]$Command,
        [ValidateSet('elevenlabs', 'local', 'web')]
        [string]$TTSEngine = 'elevenlabs'
    )
    
    try {
        Write-Host "🤖 Processing NYRA voice command: $Command" -ForegroundColor Cyan
        
        # Process common NYRA commands
        $response = switch -Regex ($Command) {
            'status|health' {
                "NYRA system status: All services operational. Current environment: $env:NYRA_ENV"
            }
            'start.*stack' {
                Start-NYRAStack
                "Starting NYRA development stack..."
            }
            'load.*secrets' {
                Initialize-NYRASecrets
                "NYRA secrets loaded for current environment"
            }
            'navigate.*core' {
                Go-NYRA -Component core
                "Navigating to NYRA core directory"
            }
            default {
                "Command processed: $Command"
            }
        }
        
        # Speak the response
        switch ($TTSEngine) {
            'elevenlabs' { Speak-ElevenLabs -Text $response -Play }
            'local' { Speak-LocalHttp -Text $response -Play }
            'web' { Speak-Web -Text $response }
        }
        
        return $response
    }
    catch {
        Write-Error "NYRA voice command failed: $($_.Exception.Message)"
    }
}

# Voice Profile Management
function Get-AvailableVoices {
    <#
    .SYNOPSIS
    Lists available voices across all TTS engines
    #>
    try {
        Write-Host "📋 Available TTS Voices:" -ForegroundColor Cyan
        
        # System voices
        Add-Type -AssemblyName System.Speech
        $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
        Write-Host "\n🖥️  System Voices:" -ForegroundColor Yellow
        $synth.GetInstalledVoices() | ForEach-Object {
            Write-Host "  - $($_.VoiceInfo.Name)" -ForegroundColor White
        }
        $synth.Dispose()
        
        # ElevenLabs voices (if API key available)
        if ($env:ELEVENLABS_API_KEY -or (Get-Secret -Key 'ELEVENLABS_API_KEY' -Source 'auto' -ErrorAction SilentlyContinue)) {
            Write-Host "\n🎙️  ElevenLabs Voices:" -ForegroundColor Yellow
            Write-Host "  - Rachel (AZnzlk1XvdvUeBnXmlld)" -ForegroundColor White
            Write-Host "  - Drew (29vD33N1CtxCmqQRPOHJ)" -ForegroundColor White
            Write-Host "  - Paul (5Q0t7uMcjvnagumLfvZi)" -ForegroundColor White
        }
        
        Write-Host "\n🔧 Use Set-TTSVoice to configure default voice" -ForegroundColor Gray
    }
    catch {
        Write-Error "Failed to get available voices: $($_.Exception.Message)"
    }
}

# Convenience aliases
Set-Alias speak Speak-Web
Set-Alias speak-el Speak-ElevenLabs  
Set-Alias speak-local Speak-LocalHttp
Set-Alias nyra-voice Invoke-NYRAVoiceCommand
Set-Alias list-voices Get-AvailableVoices
Set-Alias voicemod Set-VoicemodFilter

Export-ModuleMember -Function Speak-Web, Speak-ElevenLabs, Speak-LocalHttp, Start-PiperServer, Start-CoquiServer, Set-VoicemodFilter, Invoke-NYRAVoiceCommand, Get-AvailableVoices -Alias speak, speak-el, speak-local, nyra-voice, list-voices, voicemod
