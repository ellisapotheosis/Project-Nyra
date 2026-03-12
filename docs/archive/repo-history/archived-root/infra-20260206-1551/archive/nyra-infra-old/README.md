\# Export secrets (dev) → .env

infisical export --env=dev --path="/shared" --format=dotenv --output-file ".env"



\# Start MetaMCP only

docker compose -f compose/compose.mcp.yml --env-file .env up -d metamcp



\# Start UIs (pointing at MetaMCP)

docker compose -f compose/compose.ui.yml --env-file .env up -d



