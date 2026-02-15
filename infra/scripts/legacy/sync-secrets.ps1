# ===== sync-secrets.ps1 =====
param(
  [string]$Env = "dev"
)

# helper: list keys in a folder (quick parse)
function Get-InfisicalKeys {
  param([string]$Path, [string]$Env)
  $out = infisical export --env=$Env --path=$Path 2>$null
  if (-not $out) { return @() }
  $lines = $out -split "`n" | Where-Object { $_ -match '^[A-Z0-9_]+=' }
  return $lines | ForEach-Object { ($_ -split '=',2)[0].Trim() }
}

# helper: set keys only if missing
function Set-IfMissing {
  param([string]$Path, [string]$Env, [hashtable]$Pairs)
  $existing = Get-InfisicalKeys -Path $Path -Env $Env
  foreach ($k in $Pairs.Keys) {
    if ($existing -contains $k) {
      Write-Host "⏭  $Env $Path::$k exists — skipping" -ForegroundColor Yellow
    } else {
      $v = $Pairs[$k]
      Write-Host "➕  $Env $Path::$k ← creating" -ForegroundColor Cyan
      infisical secrets set "$k=$v" --env=$Env --path=$Path | Out-Null
    }
  }
}

# ensure folders (idempotent)
$Folders = "/shared","/project-nyra","/vertexai","/gemini-flow","/nyra-ingestion","/mcp","/bitwarden-mcp","/github-mcp"
foreach ($f in $Folders) { infisical secrets folders create --path="/" --name=($f.TrimStart('/')) 2>$null }

# --- defaults (TEMP values; rotate later) ---
$shared = @{
  APP_URL            = "http://localhost:12008"
  API_ACCESS_TOKEN   = "sk_mt_DEV_TEMP_$(Get-Random)"
  METAMCP_API_KEY    = "sk_mt_DEV_TEMP_COMPAT"    # compatibility alias
  GIT_AUTHOR_NAME    = "Ellis Apotheosis"
  GIT_AUTHOR_EMAIL   = "ellis@example.local"
}
$projectNyra = @{
  PGUSER             = "nyra"
  PGPASSWORD         = "nyra_pass"
  PGDATABASE         = "nyra_db"
  METAMCP_POSTGRES_PASSWORD = "supersecret"
}
$vertexai = @{
  GOOGLE_CLOUD_PROJECT         = "my-project-1754211294421"
  GOOGLE_PROJECT_NUMBER        = "102481761961890276171"
  GOOGLE_CLOUD_LOCATION        = "us-west2"
  GOOGLE_APPLICATION_CREDENTIALS = "C:\Dev\Tools\my-project-1754211294421-2ac074ec95ef.json"
  GOOGLE_GENAI_USE_VERTEXAI    = "true"
}
$geminiFlow = @{
  GOOGLE_API_KEY = "AIzaSy_DEMO_aiStudio_Key"
}
$nyraIngest = @{
  INGESTION_API_PORT = "5055"
  INGESTION_PROFILE  = "default"
  QDRANT_URL         = "http://qdrant:6333"
  POSTGRES_URL       = "postgres://nyra:nyra@postgres:5432/nyra"
  GDRIVE_CREDENTIALS_JSON_PATH = ""
  GITHUB_TOKEN       = "ghp_dummy_for_bootstrap"
  S3_ENDPOINT        = "http://localhost:9000"
  S3_ACCESS_KEY_ID   = "MINIO_DEMO_KEY"
  S3_SECRET_ACCESS_KEY = "MINIO_DEMO_SECRET"
  S3_BUCKET          = "nyra-ingest"
  NYRA_INGEST_MOUNTS = "./data"
}
$mcp = @{
  INFISICAL_ENVIRONMENT              = "dev"
  INFISICAL_PROJECT_ID               = "YOUR_INFISICAL_PROJECT_ID"
  INFISICAL_UNIVERSAL_AUTH_CLIENT_ID = "client_id_here"
  INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET = "client_secret_here"
  LOG_LEVEL                          = "debug"
  MCP_PORT                           = "3001"
}
$bitwarden = @{
  BW_CLIENT_ID     = "bw_client_id"
  BW_CLIENT_SECRET = "bw_client_secret"
  BW_SESSION       = ""
  BW_MCP_PORT      = "3002"
}
$githubMcp = @{
  GITHUB_TOKEN = "ghp_dummy_for_bootstrap"
}

# write them (skip if present)
Set-IfMissing "/shared"        $Env $shared
Set-IfMissing "/project-nyra"  $Env $projectNyra
Set-IfMissing "/vertexai"      $Env $vertexai
Set-IfMissing "/gemini-flow"   $Env $geminiFlow
Set-IfMissing "/nyra-ingestion"$Env $nyraIngest
Set-IfMissing "/mcp"           $Env $mcp
Set-IfMissing "/bitwarden-mcp" $Env $bitwarden
Set-IfMissing "/github-mcp"    $Env $githubMcp

Write-Host "✅ sync complete. In Infisical UI, ensure /project-nyra, /vertexai, /gemini-flow, /nyra-ingestion, /mcp, /bitwarden-mcp IMPORT /shared in each environment." -ForegroundColor Green
