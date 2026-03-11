$cfg = "$env:USERPROFILE\.gemini\settings.json"
# Read the file as a single string, trying to detect encoding
$content = Get-Content $cfg -Raw -Encoding Default

# Trim leading whitespace and BOM
$content = $content.TrimStart()

# Find the index of the first '{'
$firstBrace = $content.IndexOf('{')
if ($firstBrace -ge 0) {
    # Get the substring starting from the first '{'
    $jsonContent = $content.Substring($firstBrace)

    try {
        # Convert from JSON
        $jsonObject = $jsonContent | ConvertFrom-Json
        # Convert back to JSON
        $jsonOutput = $jsonObject | ConvertTo-Json -Depth 50
        
        # Write back with UTF8 without BOM using .NET
        $utf8WithoutBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllLines($cfg, $jsonOutput, $utf8WithoutBom)
        
        Write-Host "✅ Repaired and formatted MCPs in $cfg"
    } catch {
        Write-Host "❌ Error processing JSON in $cfg"
        $_.Exception.Message
    }
} else {
    Write-Host "❌ Could not find JSON content in $cfg"
}