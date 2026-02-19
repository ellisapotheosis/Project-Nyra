Why Set-GitHubPAT “didn’t work” and how to make it bulletproof

Prereqs (done once):

git config --global credential.helper manager   # use Git Credential Manager
git credential-manager version                  # should print a version


Now store your PAT (with scopes you actually need — include repo, and workflow if you push .github/workflows/*):

function Set-GitHubPAT {
  param([Parameter(Mandatory)]$Token,[string]$User='ellisapotheosis')
  git config --global credential.helper manager
  $creds = @"
protocol=https
host=github.com
username=$User
password=$Token
"@
  if (Get-Command git-credential-manager -ErrorAction SilentlyContinue) {
    $creds | git-credential-manager store
  } else {
    $creds | git credential-manager store
  }
  git config --global credential.https://github.com.username $User
  Write-Host "Stored PAT for $User in Windows Credential Manager." -f Green
}
# use it:
Set-GitHubPAT -Token 'ghp_...YOURPAT...' -User 'ellisapotheosis'


What this does: writes a github.com entry into Windows Credential Manager; future git fetch/push uses it automatically. If you still get “refusing… workflow” errors, your PAT is missing the workflow scope (GitHub refuses workflow file updates without it).

“Hardcode” logins without sticking secrets in plain text

Use Windows Credential Manager. Save once:

Install-Module CredentialManager -Scope CurrentUser -Force

New-StoredCredential -Target "GITHUB_PAT"      -UserName "git" -Secret "ghp_..." -Persist LocalMachine
New-StoredCredential -Target "BW_CLIENTID"     -UserName "bw"  -Secret "<id>"    -Persist LocalMachine
New-StoredCredential -Target "BW_CLIENTSECRET" -UserName "bw"  -Secret "<secret>" -Persist LocalMachine
New-StoredCredential -Target "INFISICAL_TOKEN" -UserName "inf" -Secret "it.kn_xxx" -Persist LocalMachine
New-StoredCredential -Target "NOTION_TOKEN"    -UserName "ntn" -Secret "ntn_xxx" -Persist LocalMachine


Then in your profile (see full profile below) I load them at startup and export to env vars:

$env:GITHUB_PAT      = (Get-StoredCredential GITHUB_PAT).Secret
$env:BW_CLIENTID     = (Get-StoredCredential BW_CLIENTID).Secret
$env:BW_CLIENTSECRET = (Get-StoredCredential BW_CLIENTSECRET).Secret
$env:INFISICAL_TOKEN = (Get-StoredCredential INFISICAL_TOKEN).Secret
$env:NOTION_TOKEN    = (Get-StoredCredential NOTION_TOKEN).Secret


Quick login helpers (also in the profile):

function bwlogin { bw logout 2>$null; bw login --apikey; $env:BW_SESSION = (bw unlock --raw) }
function ilogin { infisical login --method token --token $env:INFISICAL_TOKEN }
function nlogin { Write-Host "NOTION_TOKEN present: $([bool]$env:NOTION_TOKEN)" }
function ghlogin { if ($env:GITHUB_PAT) { Set-GitHubPAT -Token $env:GITHUB_PAT -User 'ellisapotheosis' } }

One combined .mcp.json for your repo root

Save this at <repo>/.mcp.json (works on Windows; servers you’re unsure about are disabled until you install them—flip the "disabled" flag or set the env var to false):

{
  "clients": {
    "desktop-commander": {
      "command": "C:\\Program Files\\Git\\bin\\bash.exe",
      "args": ["--login", "-i"]
    }
  },
  "mcpServers": {
    "claude-flow": {
      "type": "stdio",
      "command": "npx",
      "args": ["claude-flow@alpha", "mcp", "start"]
    },
    "ruv-swarm": {
      "type": "stdio",
      "command": "npx",
      "args": ["ruv-swarm@latest", "mcp", "start"],
      "disabled": "${RUV_DISABLED:false}"
    },

    "filesystem": {
      "type": "stdio",
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem", "--root", "${WORKSPACE_ROOT:.}"]
    },
    "pulse-fs": {
      "type": "stdio",
      "command": "npx",
      "args": ["@pulsemcp/filesystem@latest", "start", "--root", "${WORKSPACE_ROOT:.}"],
      "disabled": "${PULSE_FS_DISABLED:true}"
    },

    "notion": {
      "type": "http",
      "url": "https://mcp.notion.com/mcp",
      "headers": { "Authorization": "Bearer ${NOTION_TOKEN}" }
    },

    "mcp-use": {
      "type": "stdio",
      "command": "npx",
      "args": ["mcp-use@latest", "start"],
      "disabled": "${MCP_USE_DISABLED:false}"
    },
    "tome": {
      "type": "stdio",
      "command": "npx",
      "args": ["@runebook/tome@latest", "mcp", "start"],
      "disabled": "${TOME_DISABLED:true}"
    },
    "gofastmcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["gofastmcp@latest", "start"],
      "disabled": "${GOFAST_DISABLED:true}"
    },
    "activepieces": {
      "type": "stdio",
      "command": "npx",
      "args": ["activepieces-mcp@latest", "start"],
      "disabled": "${ACTIVEPIECES_DISABLED:true}"
    },

    "archon": {
      "type": "stdio",
      "command": "python",
      "args": ["-m", "archon_mcp", "start"],
      "disabled": "${ARCHON_DISABLED:true}"
    },

    "fastmcp": {
      "type": "stdio",
      "command": "python",
      "args": ["-m", "fastmcp_app"],
      "disabled": "${FASTMCP_DISABLED:true}"
    },
    "metamcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["metamcp@latest", "start"],
      "disabled": "${METAMCP_DISABLED:true}"
    },
    "flow-nexus": {
      "type": "stdio",
      "command": "npx",
      "args": ["flow-nexus@latest", "mcp", "start"],
      "disabled": "${FLOW_NEXUS_DISABLED:true}"
    }
  }
}


After saving, run Link-MCPConfig from the repo root to mirror it into nyra-core\claude-flow\.mcp.json.

Fresh, working PowerShell profile (drop-in)

Save exactly this as your canonical profile file (the one you keep signed):
C:\Users\edane\OneDrive\Documents\DevProjects\Nyra-Do-Not-Push\ToDo\Secrets\Profile.Apoth.Fixed.ps1
Then copy it into $PROFILE.AllUsersAllHosts and make the other three profiles dot-source it:

$dst = $PROFILE.AllUsersAllHosts
New-Item -ItemType Directory -Force -Path (Split-Path $dst) | Out-Null
Copy-Item 'C:\Users\edane\OneDrive\Documents\DevProjects\Nyra-Do-Not-Push\ToDo\Secrets\Profile.Apoth.Fixed.ps1' $dst -Force
foreach ($p in @($PROFILE.AllUsersCurrentHost,$PROFILE.CurrentUserAllHosts,$PROFILE.CurrentUserCurrentHost)) {
  if ($p) { New-Item -ItemType Directory -Force -Path (Split-Path $p) | Out-Null; Set-Content -Path $p -Value '. $PROFILE.AllUsersAllHosts' -NoNewline }
}


Profile content (complete; fixes your -and parse error, OMP quirk, adds secure secret loading & logins):

# =======================
# Apotheosis Profile (AllUsersAllHosts)
# =======================
$ErrorActionPreference = 'Stop'
$PSStyle.OutputRendering = 'Ansi'

# --- PSReadLine safe defaults
if (Get-Module -ListAvailable -Name PSReadLine) {
  Import-Module PSReadLine -ErrorAction SilentlyContinue
  Set-PSReadLineOption -EditMode Windows -ErrorAction SilentlyContinue
  try { Set-PSReadLineOption -PredictionViewStyle ListView } catch {}
  try { Set-PSReadLineOption -PredictionSource History } catch {}
}

# --- Prompt (OMP -> Starship -> stock)
function Set-OhMyPosh {
  if (Get-Command oh-my-posh -ErrorAction SilentlyContinue) {
    # Use a stable built-in theme to avoid "Spacebar" bug
    $theme = Join-Path $env:POSH_THEMES_PATH 'jandedobbeleer.omp.json'
    if (-not (Test-Path $theme)) { $theme = $null }
    if ($theme) {
      oh-my-posh init pwsh --config "$theme" | Invoke-Expression
    } else {
      oh-my-posh init pwsh | Invoke-Expression
    }
    Write-Host "Prompt: Oh My Posh"
  } else { Write-Warning "oh-my-posh not installed." }
}
function Set-Starship {
  if (Get-Command starship -ErrorAction SilentlyContinue) {
    starship init powershell | Invoke-Expression
    Write-Host "Prompt: Starship"
  } else { Write-Warning "starship not installed." }
}
Set-Alias spp Set-OhMyPosh
Set-Alias sps Set-Starship
if (Get-Command oh-my-posh -ErrorAction SilentlyContinue) { Set-OhMyPosh }
elseif (Get-Command starship -ErrorAction SilentlyContinue) { Set-Starship }

# --- Banner
function azhelp {
  Write-Host "★ Apotheosis — quick keys & commands" -f Yellow
  Write-Host "Alt+←/→/↑  parent / fuzzy child / z-jump"
  Write-Host "Ctrl+t / Ctrl+r  PSFzf files / reverse history"
  Write-Host "spp / sps       switch prompt"
  Write-Host "ryeup           sync Python envs (uv)"
  Write-Host "bwlogin / ilogin / nlogin / ghlogin"
  Write-Host "Link-MCPConfig  mirror root .mcp.json into Claude Flow"
  Write-Host "Set-GitHubPAT   store PAT in Git Credential Manager"
}
Write-Host "→ Using $(
  if (Get-Command oh-my-posh -ErrorAction SilentlyContinue) {'Oh My Posh'}
  elseif (Get-Command starship -ErrorAction SilentlyContinue) {'Starship'}
  else {'stock prompt'}
)"
Write-Host "★ Apotheosis shell ready. Type 'azhelp' for tips." -f Yellow

# --- PATH: add per-user Python Scripts if present
$pyUser313 = Join-Path $env:APPDATA 'Python\Python313\Scripts'
if ( (Test-Path $pyUser313) -and ($env:PATH -notlike "*$pyUser313*") ) { $env:PATH += ";$pyUser313" }

# --- Secrets from Windows Credential Manager
if (-not (Get-Module CredentialManager -ListAvailable)) {
  try { Import-Module CredentialManager -ErrorAction Stop } catch {}
} else { Import-Module CredentialManager -ErrorAction SilentlyContinue }

function _sec($name) { try { (Get-StoredCredential -Target $name).Secret } catch { $null } }

$env:GITHUB_PAT      = _sec "GITHUB_PAT"
$env:BW_CLIENTID     = _sec "BW_CLIENTID"
$env:BW_CLIENTSECRET = _sec "BW_CLIENTSECRET"
$env:INFISICAL_TOKEN = _sec "INFISICAL_TOKEN"
$env:NOTION_TOKEN    = _sec "NOTION_TOKEN"

# --- Quick login helpers
function bwlogin { bw logout 2>$null; bw login --apikey; $env:BW_SESSION = (bw unlock --raw) }
function ilogin { if ($env:INFISICAL_TOKEN) { infisical login --method token --token $env:INFISICAL_TOKEN } else { Write-Warning "INFISICAL_TOKEN not set" } }
function nlogin { if ($env:NOTION_TOKEN) { Write-Host "NOTION_TOKEN loaded." } else { Write-Warning "NOTION_TOKEN not set" } }
function ghlogin { if ($env:GITHUB_PAT) { Set-GitHubPAT -Token $env:GITHUB_PAT -User 'ellisapotheosis' } else { Write-Warning "GITHUB_PAT not set" } }

# --- Git helpers
function Add-GitRemote { param([Parameter(Mandatory)][string]$Name,[Parameter(Mandatory)][string]$Url)
  git remote remove $Name 2>$null; git remote add $Name $Url; git remote -v
}
function Set-GitHubPAT { param([Parameter(Mandatory)]$Token,[string]$User='ellisapotheosis')
  git config --global credential.helper manager
  $creds = @"
protocol=https
host=github.com
username=$User
password=$Token
"@
  if (Get-Command git-credential-manager -ErrorAction SilentlyContinue) {
    $creds | git-credential-manager store
  } else { $creds | git credential-manager store }
  git config --global credential.https://github.com.username $User
  Write-Host "Stored PAT for $User in Windows Credential Manager." -f Green
}

# --- MCP linker
function Link-MCPConfig {
  param([string]$Root=(Get-Location).Path,[string]$ClaudeFlow="nyra-core\claude-flow")
  $src = Join-Path $Root ".mcp.json"
  $dst = Join-Path $Root $ClaudeFlow ".mcp.json"
  if (-not (Test-Path $src)) { throw ".mcp.json not found at $src" }
  New-Item -ItemType Directory -Force -Path (Split-Path $dst) | Out-Null
  if (Test-Path $dst) { Remove-Item $dst -Force }
  try { New-Item -ItemType SymbolicLink -Path $dst -Target $src -Force | Out-Null; Write-Host "Linked $dst -> $src" }
  catch { Copy-Item $src $dst -Force; Write-Warning "Symlink failed; copied instead." }
}

# --- uv / Python sync
function ryeup { if (Get-Command uv -ErrorAction SilentlyContinue) { uv sync } else { Write-Warning "Install 'uv' to use ryeup." } }

# --- Nice dir alias
Set-Alias ll Get-ChildItem


If PowerShell is set to AllSigned, re-sign after copying:

$cert = Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert | Select-Object -First 1
if (-not $cert) { $cert = New-SelfSignedCertificate -Type CodeSigningCert -Subject "CN=Apotheosis" -CertStoreLocation Cert:\CurrentUser\My }
Set-AuthenticodeSignature -FilePath $PROFILE.AllUsersAllHosts -Certificate $cert | Format-List

Quick “recopy Project-Nyra and wire MCP” checklist

Put the combined .mcp.json in repo root.

Run Link-MCPConfig from repo root.

git add .mcp.json nyra-core/claude-flow/.mcp.json → commit.

ghlogin (loads PAT into GCM) → git push origin main.

If GitHub rejects workflow files, regenerate PAT with workflow scope and re-run ghlogin.

If anything here still fights you, paste the exact error and I’ll zero in on it.