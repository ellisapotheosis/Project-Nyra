param(
  [string]$Service = "gitea",
  [string]$EnvFile = ".env.gitea"
)
docker compose -f docker-compose.yml --env-file $EnvFile logs -f --tail 200 $Service
