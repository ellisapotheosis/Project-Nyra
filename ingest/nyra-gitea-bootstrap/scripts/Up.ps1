param(
  [string]$EnvFile = ".env.gitea",
  [switch]$AI,
  [switch]$Actions,
  [switch]$Public
)

$profiles = @()
if ($AI) { $profiles += "--profile"; $profiles += "ai" }
if ($Actions) { $profiles += "--profile"; $profiles += "actions" }
if ($Public) { $profiles += "--profile"; $profiles += "public" }

docker compose -f docker-compose.yml --env-file $EnvFile @profiles up -d
