# /infra (Project Nyra)

## Quickstart

### 0) Create env
```bash
cp infra/env/nyra.env.example infra/env/nyra.env
# edit infra/env/nyra.env and fill REQUIRED values
```

### 1) Bootstrap everything (core + apps)
```bash
bash infra/scripts/bootstrap.sh
```

### 2) Verify endpoints
- TwentyCRM: http://localhost:3000
- n8n: http://localhost:5678
- Activepieces: http://localhost:8080
- LiteLLM: http://localhost:4000
- Nexus Router (MCP): http://localhost:8000/mcp
- Grafana: http://localhost:3001
