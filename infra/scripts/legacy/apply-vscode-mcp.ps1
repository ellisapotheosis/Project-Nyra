# Writes MCP server endpoints into VS Code settings for Claude Code
# Default install path: %APPDATA%\Code\User\settings.json

$settingsPath = Join-Path $env:APPDATA 'Code\User\settings.json'
$newSettings = @{
  "claudeCode.mcpServers" = @{
    "metamcp-sse" = @{
      "command" = "sse";
      "args" = @([System.Uri]::EscapeUriString("http://localhost:9090/sse"))
    }
  }
} | ConvertTo-Json -Depth 10

if (Test-Path $settingsPath) {
  $existing = Get-Content $settingsPath -Raw | ConvertFrom-Json -AsHashtable
} else {
  $existing = @{}
}

# merge shallowly without destroying other settings
$existing['claudeCode.mcpServers'] = (ConvertFrom-Json $newSettings)['claudeCode.mcpServers']
($existing | ConvertTo-Json -Depth 100) | Set-Content -Path $settingsPath -Encoding UTF8
Write-Host "Updated VS Code settings at $settingsPath"
