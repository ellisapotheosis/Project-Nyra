# create-nyra-scaffolds.ps1
# One-shot builder for:
#  1) Root-level LLM provider config scaffold (dotfolders)
#  2) Full monorepo scaffold with submodule/subtree/vendor patterns, overlays, MCP registry, scripts
# Tested on Windows PowerShell 5+ and PowerShell 7+.

param(
  [string]$RepoRoot = "C:\Dev\DevProjects\Personal-Projects\Project-Nyra",
  [string]$KitsDir  = "$env:TEMP\NyraKits"
)

# Helpers
function Write-File($Path, $Content) {
  $dir = Split-Path -Parent $Path
  if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
  $enc = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $enc)
}

function Zip-Folder($Source, $ZipPath) {
  if (Test-Path $ZipPath) { Remove-Item $ZipPath -Force }
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  [System.IO.Compression.ZipFile]::CreateFromDirectory($Source, $ZipPath)
}

# Ensure base paths
New-Item -ItemType Directory -Path $RepoRoot -Force | Out-Null
New-Item -ItemType Directory -Path $KitsDir -Force | Out-Null

# ------------------------------------------------------------------------------------
# 1) Provider config scaffold (root dotfolders)
# ------------------------------------------------------------------------------------
$aiRoot = Join-Path $KitsDir "nyra-ai-config"
Remove-Item $aiRoot -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $aiRoot -Force | Out-Null

# .claude
Write-File (Join-Path $aiRoot ".claude\config.json") (@"
{
  "provider": "anthropic",
  "api_key_env": "NYRA_ANTHROPIC_API_KEY",
  "model_env": "NYRA_ANTHROPIC_MODEL",
  "default_model": "claude-3-5-sonnet-2024-06",
  "prompt_search_paths": ["./.claude/prompts"],
  "workflow_paths": ["./.claude/workflows"]
}
"@)

Write-File (Join-Path $aiRoot ".claude\prompts\system.md") (@"
You are Nyra's Claude persona.
Be concise, deterministic, and tool-aware.
"@)

Write-File (Join-Path $aiRoot ".claude\workflows\nyra.orchestration.yaml") (@"
version: 0.1
name: nyra-orchestration
model: \${NYRA_ANTHROPIC_MODEL:-claude-3-5-sonnet-2024-06}
entry:
  system_prompt: "./.claude/prompts/system.md"
  steps:
    - id: boot
      type: message
      content: "Nyra Orchestration online."
"@)

# .gemini
Write-File (Join-Path $aiRoot ".gemini\config.yaml") (@"
provider: google
api_key_env: NYRA_GEMINI_API_KEY
model_env: NYRA_GEMINI_MODEL
default_model: gemini-1.5-pro
prompt_search_paths:
  - ./.gemini/prompts
"@)

Write-File (Join-Path $aiRoot ".gemini\prompts\system.md") "You are Nyra's Gemini persona.`n"

# .codanna
Write-File (Join-Path $aiRoot ".codanna\config.yaml") (@"
provider: codanna
api_key_env: NYRA_CODANNA_API_KEY
model_env: NYRA_CODANNA_MODEL
default_model: codanna-pro
"@)

Write-File (Join-Path $aiRoot ".codanna\scripts\sample.py") "print('Codanna integration stub')`n"

# tools
Write-File (Join-Path $aiRoot "tools\set-env.ps1") (@"
# Session-scoped defaults; replace with your keys.
\$Env:NYRA_ANTHROPIC_API_KEY = \$Env:NYRA_ANTHROPIC_API_KEY -ne \$null ? \$Env:NYRA_ANTHROPIC_API_KEY : "REPLACE_WITH_YOUR_ANTHROPIC_KEY"
\$Env:NYRA_GEMINI_API_KEY    = \$Env:NYRA_GEMINI_API_KEY    -ne \$null ? \$Env:NYRA_GEMINI_API_KEY    : "REPLACE_WITH_YOUR_GEMINI_KEY"
\$Env:NYRA_CODANNA_API_KEY   = \$Env:NYRA_CODANNA_API_KEY   -ne \$null ? \$Env:NYRA_CODANNA_API_KEY   : "REPLACE_WITH_YOUR_CODANNA_KEY"

\$Env:NYRA_ANTHROPIC_MODEL = \$Env:NYRA_ANTHROPIC_MODEL -ne \$null ? \$Env:NYRA_ANTHROPIC_MODEL : "claude-3-5-sonnet-2024-06"
\$Env:NYRA_GEMINI_MODEL    = \$Env:NYRA_GEMINI_MODEL    -ne \$null ? \$Env:NYRA_GEMINI_MODEL    : "gemini-1.5-pro"
\$Env:NYRA_CODANNA_MODEL   = \$Env:NYRA_CODANNA_MODEL   -ne \$null ? \$Env:NYRA_CODANNA_MODEL   : "codanna-pro"

Write-Host "NYRA env vars configured for this session."
"@)

Write-File (Join-Path $aiRoot "README.md") (@"
# Nyra Provider Config Scaffold
Place the `.claude`, `.gemini`, and `.codanna` folders at the **repo root** so every subproject (e.g., `nyra-orchestration`) reads the same prompts, workflows, and model settings.
"@)

$aiZip = Join-Path $KitsDir "nyra-ai-config-scaffold.zip"
if (Test-Path $aiZip) { Remove-Item $aiZip -Force }
Zip-Folder -Source $aiRoot -ZipPath $aiZip

# ------------------------------------------------------------------------------------
# 2) Monorepo scaffold (submodules, subtrees, vendor, overlays, MCP, scripts)
# ------------------------------------------------------------------------------------
$monoRoot = Join-Path $KitsDir "nyra-monorepo"
Remove-Item $monoRoot -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $monoRoot -Force | Out-Null

# Core dirs
@(
  ".claude",".gemini",".codanna",
  "third_party/submodules","third_party/subtrees","vendor",
  "integrations/claude-flow+archon-mcp/overlay/config",
  "integrations/claude-flow+archon-mcp/overlay/ui/panels",
  "integrations/open-webui/nyra-extension",
  "mcp/servers","scripts","tools","docs"
) | ForEach-Object { New-Item -ItemType Directory -Path (Join-Path $monoRoot $_) -Force | Out-Null }

# Root readme
Write-File (Join-Path $monoRoot "README.md") (@"
# Project-Nyra Monorepo Scaffold

- **Submodules** (`third_party/submodules/`): clean upstream tracking; minimal edits; use a fork if you need patches.
- **Subtrees** (`third_party/subtrees/`): editable with history; pull upstream via subtree.
- **Vendor** (`vendor/`): hard fork; you own divergence.
- **Overlays** (`integrations/*/overlay/`): your glue code on top of upstream without editing their trees.
- **MCP** (`mcp/servers/registry.json`): declarative MCP server list used by flows/UIs.
"@)

# Provider minimal configs here too
Write-File (Join-Path $monoRoot ".claude\config.json") (@"
{ "provider":"anthropic", "api_key_env":"NYRA_ANTHROPIC_API_KEY", "model_env":"NYRA_ANTHROPIC_MODEL", "default_model":"claude-3-5-sonnet-2024-06" }
"@)
Write-File (Join-Path $monoRoot ".gemini\config.yaml") "provider: google`napi_key_env: NYRA_GEMINI_API_KEY`nmodel_env: NYRA_GEMINI_MODEL`ndefault_model: gemini-1.5-pro`n"
Write-File (Join-Path $monoRoot ".codanna\config.yaml") "provider: codanna`napi_key_env: NYRA_CODANNA_API_KEY`nmodel_env: NYRA_CODANNA_MODEL`ndefault_model: codanna-pro`n"

# MCP registry + example config
Write-File (Join-Path $monoRoot "mcp\servers\registry.json") (@"
{
  "version": "1.0",
  "servers": [
    {
      "name": "archon-mcp",
      "command": "python",
      "args": ["-m", "archon_mcp.server"],
      "env": { "ARCHON_CONFIG": "mcp/servers/archon.config.json" },
      "status": "optional"
    }
  ]
}
"@)
Write-File (Join-Path $monoRoot "mcp\servers\archon.config.json") (@"
{
  "profiles": ["default"],
  "tools": []
}
"@)

# Overlay sample: stitch Claude Flow with Archon MCP
Write-File (Join-Path $monoRoot "integrations\claude-flow+archon-mcp\overlay\config\claude-flow.pipeline.yaml") (@"
version: 0.1
name: nyra-archon-integration
providers:
  anthropic:
    model: \${NYRA_ANTHROPIC_MODEL:-claude-3-5-sonnet-2024-06}
mcp:
  servers:
    - name: archon-mcp
      from_registry: archon-mcp
flows:
  - id: archon-enabled
    steps:
      - type: tool
        server: archon-mcp
        tool: list_capabilities
      - type: llm
        provider: anthropic
        prompt: "Summarize Archon MCP capabilities for the user."
"@)

Write-File (Join-Path $monoRoot "integrations\claude-flow+archon-mcp\overlay\ui\panels\archon-status.tsx") "export default function ArchonStatus(){return <div>Archon MCP status: connected</div>;}`n"

# Open WebUI extension stub
Write-File (Join-Path $monoRoot "integrations\open-webui\nyra-extension\package.json") (@"
{
  "name": "nyra-openwebui-extension",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "build": "node ./scripts/build.js || exit 0",
    "dev": "node ./scripts/dev.js || exit 0"
  }
}
"@)

# Scripts
Write-File (Join-Path $monoRoot "scripts\submodules-init.ps1") (@"
# Edit URLs to upstream or your forks
git submodule add https://github.com/anthropic/claude-code.git third_party/submodules/claude-code
git submodule add https://github.com/anthropic/anthropic-agents-sdk.git third_party/submodules/agents-sdk
git submodule add https://github.com/google/gemini-mcp-assistant.git third_party/submodules/gemini-mcp-assistant
git submodule update --init --recursive
"@)

Write-File (Join-Path $monoRoot "scripts\submodules-update.ps1") "git submodule sync --recursive`ngit submodule update --init --recursive --remote`n"

Write-File (Join-Path $monoRoot "scripts\subtree-add.ps1") (@"
param(
  [Parameter(Mandatory=$true)][string]$Name,
  [Parameter(Mandatory=$true)][string]$Remote,
  [Parameter(Mandatory=$true)][string]$Prefix
)
git subtree add --prefix $Prefix $Remote main --squash
"@)

Write-File (Join-Path $monoRoot "scripts\subtree-pull.ps1") (@"
param(
  [Parameter(Mandatory=$true)][string]$Name,
  [Parameter(Mandatory=$true)][string]$Remote,
  [Parameter(Mandatory=$true)][string]$Prefix,
  [string]$Branch="main"
)
git subtree pull --prefix $Prefix $Remote $Branch --squash
"@)

Write-File (Join-Path $monoRoot "scripts\apply-overlays.ps1") (@"
param([string]$Root = (Resolve-Path ".").Path)
Write-Host "Applying overlays..."
robocopy "$Root\integrations\claude-flow+archon-mcp\overlay" "$Root" /E /NFL /NDL /NJH /NJS /NC | Out-Null
Write-Host "Done."
"@)

# Tools
Write-File (Join-Path $monoRoot "tools\set-env.ps1") (@"
# Session-scoped defaults; replace with your keys.
\$Env:NYRA_ANTHROPIC_API_KEY = \$Env:NYRA_ANTHROPIC_API_KEY -ne \$null ? \$Env:NYRA_ANTHROPIC_API_KEY : "REPLACE_WITH_YOUR_ANTHROPIC_KEY"
\$Env:NYRA_GEMINI_API_KEY    = \$Env:NYRA_GEMINI_API_KEY    -ne \$null ? \$Env:NYRA_GEMINI_API_KEY    : "REPLACE_WITH_YOUR_GEMINI_KEY"
\$Env:NYRA_CODANNA_API_KEY   = \$Env:NYRA_CODANNA_API_KEY   -ne \$null ? \$Env:NYRA_CODANNA_API_KEY   : "REPLACE_WITH_YOUR_CODANNA_KEY"

\$Env:NYRA_ANTHROPIC_MODEL = \$Env:NYRA_ANTHROPIC_MODEL -ne \$null ? \$Env:NYRA_ANTHROPIC_MODEL : "claude-3-5-sonnet-2024-06"
\$Env:NYRA_GEMINI_MODEL    = \$Env:NYRA_GEMINI_MODEL    -ne \$null ? \$Env:NYRA_GEMINI_MODEL    : "gemini-1.5-pro"
\$Env:NYRA_CODANNA_MODEL   = \$Env:NYRA_CODANNA_MODEL   -ne \$null ? \$Env:NYRA_CODANNA_MODEL   : "codanna-pro"
"@)

# Zip monorepo scaffold
$monoZip = Join-Path $KitsDir "nyra-monorepo-scaffold.zip"
if (Test-Path $monoZip) { Remove-Item $monoZip -Force }
Zip-Folder -Source $monoRoot -ZipPath $monoZip

# ------------------------------------------------------------------------------------
# Copy into your repo root (idempotent)
# ------------------------------------------------------------------------------------
# Provider dotfolders into RepoRoot
@(".claude",".gemini",".codanna") | ForEach-Object {
  $src = Join-Path $aiRoot $_
  $dst = Join-Path $RepoRoot $_
  New-Item -ItemType Directory -Path $dst -Force | Out-Null
  Copy-Item -Path (Join-Path $src "*") -Destination $dst -Recurse -Force -ErrorAction SilentlyContinue
}

# Monorepo structure (without overwriting provider configs again)
@(
  "third_party\submodules","third_party\subtrees","vendor",
  "integrations\claude-flow+archon-mcp\overlay\config",
  "integrations\claude-flow+archon-mcp\overlay\ui\panels",
  "integrations\open-webui\nyra-extension",
  "mcp\servers","scripts","tools","docs"
) | ForEach-Object {
  $src = Join-Path $monoRoot $_
  $dst = Join-Path $RepoRoot $_
  New-Item -ItemType Directory -Path $dst -Force | Out-Null
  Copy-Item -Path (Join-Path $src "*") -Destination $dst -Recurse -Force -ErrorAction SilentlyContinue
}

# Output pointers
Write-Host ""
Write-Host "=== Nyra scaffolds created ==="
Write-Host "Repo root: $RepoRoot"
Write-Host "Kits (zips): $KitsDir"
Write-Host " - $aiZip"
Write-Host " - $monoZip"
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1) cd '$RepoRoot'"
Write-Host "  2) .\tools\set-env.ps1"
Write-Host "  3) (Optional) .\scripts\submodules-init.ps1  # add upstreams or your forks"
Write-Host "  4) (Optional) .\scripts\subtree-add.ps1 -Name claude-flow -Remote https://github.com/owner/claude-flow.git -Prefix third_party/subtrees/claude-flow"
Write-Host "  5) .\scripts\apply-overlays.ps1            # apply your integration overlay"
Write-Host ""
Write-Host "Provider configs live at repo root (.claude/.gemini/.codanna)."
Write-Host "Overlays glue Claude-Flow to Archon MCP without contaminating upstream checkouts."
