# Mode switcher: sets provider strategy via env-only flags

function Set-NyraMode {
  param(
    [ValidateSet("cheap-gemini","balanced","anthropic-heavy","local-only")]
    [string]$Mode = "cheap-gemini"
  )
  # Reset flags
  Remove-Item Env:NYRA_MODE, Env:NYRA_PROVIDER_PRIMARY, Env:NYRA_PROVIDER_SECONDARY, Env:NYRA_OPENAI_TIER -ErrorAction SilentlyContinue

  switch ($Mode) {
    "cheap-gemini" {
      # Primary = Gemini (Vertex / API); Anthropic for claude-code; OpenAI allowed for niche tools
      $env:NYRA_MODE              = "cheap-gemini"
      $env:NYRA_PROVIDER_PRIMARY  = "gemini"
      $env:NYRA_PROVIDER_SECONDARY= "anthropic"
      $env:NYRA_OPENAI_TIER       = "limited"
    }
    "balanced" {
      $env:NYRA_MODE              = "balanced"
      $env:NYRA_PROVIDER_PRIMARY  = "anthropic"
      $env:NYRA_PROVIDER_SECONDARY= "gemini"
      $env:NYRA_OPENAI_TIER       = "standard"
    }
    "anthropic-heavy" {
      $env:NYRA_MODE              = "anthropic-heavy"
      $env:NYRA_PROVIDER_PRIMARY  = "anthropic"
      $env:NYRA_PROVIDER_SECONDARY= "openai"
      $env:NYRA_OPENAI_TIER       = "full"
    }
    "local-only" {
      $env:NYRA_MODE              = "local-only"
      $env:NYRA_PROVIDER_PRIMARY  = "onnx"
    }
  }

  Write-Host "NYRA mode set => $($env:NYRA_MODE)  (primary=$($env:NYRA_PROVIDER_PRIMARY) secondary=$($env:NYRA_PROVIDER_SECONDARY))"
}

# Convenience: choose default mode each new shell
if (-not $env:NYRA_MODE) { Set-NyraMode -Mode "cheap-gemini" }
