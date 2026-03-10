param(
  [string]$EnvFile = ".env.gitea"
)
docker compose -f docker-compose.yml --env-file $EnvFile ps
