param(
  [string]$RepoRoot = (Resolve-Path ".").Path
)

$cfg = Join-Path $RepoRoot "ops\config"
$sw  = Join-Path $RepoRoot "ops\Switch-NyraEnv.ps1"
New-Item -ItemType Directory -Force -Path $cfg | Out-Null

# — .env templates —
$env_common = @"
# Common across modes
NYRA_PROJECT_NAME=project-nyra
# Optional: global toggles used by compose or scripts
NYRA_MODE=
"@

$env_gemini = @"
# CHEAP GEMINI MODE
NYRA_MODE=cheap-gemini
# Vertex A: (Project/Location must match your GCP setup)
GEMINI_VERTEX_PROJECT_ID=<<PROJECT_ID_A>>
GEMINI_VERTEX_LOCATION=us-central1
GOOGLE_API_KEY=<<WEB_API_KEY_OPTIONAL>>
# Secondary (Anthropic) for claude-code-ish tasks
ANTHROPIC_API_KEY=<<ANTHROPIC_KEY>>
"@

$env_balanced = @"
# BALANCED MODE
NYRA_MODE=balanced
ANTHROPIC_API_KEY=<<ANTHROPIC_KEY>>
GEMINI_VERTEX_PROJECT_ID=<<PROJECT_ID_A>>
GEMINI_VERTEX_LOCATION=us-central1
OPENAI_API_KEY=<<OPENAI_KEY>>
"@

$env_anthropic = @"
# ANTHROPIC-HEAVY MODE
NYRA_MODE=anthropic-heavy
ANTHROPIC_API_KEY=<<ANTHROPIC_KEY>>
OPENAI_API_KEY=<<OPENAI_KEY>>
# Gemini optional for vision/bulk
GEMINI_VERTEX_PROJECT_ID=<<PROJECT_ID_A>>
GEMINI_VERTEX_LOCATION=us-central1
"@

$env_local = @"
# LOCAL-ONLY MODE (ONNX / local runtimes)
NYRA_MODE=local-only
"@

Set-Content -Encoding UTF8 (Join-Path $cfg ".env.common")         $env_common
Set-Content -Encoding UTF8 (Join-Path $cfg ".env.cheap-gemini")   $env_gemini
Set-Content -Encoding UTF8 (Join-Path $cfg ".env.balanced")       $env_balanced
Set-Content -Encoding UTF8 (Join-Path $cfg ".env.anthropic")      $env_anthropic
Set-Content -Encoding UTF8 (Join-Path $cfg ".env.local")          $env_local

# — switcher script —
$switcher = @"
param(
  [ValidateSet('cheap-gemini','balanced','anthropic','local')]
  [string]$Mode = 'cheap-gemini'
)
\$here = Split-Path -Parent \$PSCommandPath
\$cfg  = Join-Path \$here 'config'
\$common = Join-Path \$cfg '.env.common'
\$map = @{
  'cheap-gemini' = '.env.cheap-gemini'
  'balanced'     = '.env.balanced'
  'anthropic'    = '.env.anthropic'
  'local'        = '.env.local'
}
\$sel = Join-Path \$cfg \$map[\$Mode]
if (-not (Test-Path \$sel)) { Write-Error "Missing env file \$sel"; exit 1 }
Copy-Item \$common (Join-Path \$cfg '.env') -Force
Add-Content (Join-Path \$cfg '.env') (`n + (Get-Content \$sel -Raw))
Write-Host "Wrote combined env -> `$(Join-Path \$cfg '.env')"
"@
Set-Content -Encoding UTF8 $sw $switcher

Write-Host "Wrote env templates to $cfg and switcher to $sw"
Write-Host "Use:  pwsh ops\Switch-NyraEnv.ps1 -Mode cheap-gemini"
