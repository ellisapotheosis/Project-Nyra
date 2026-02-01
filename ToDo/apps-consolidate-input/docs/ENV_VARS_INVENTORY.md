# Environment Variables Inventory (Master List)

This file is a **master inventory** of environment variables likely used across Project Nyra.

> NOTE: This list is intentionally broad. Use `scripts/env/find_env_vars.*` later to scan code and update this list.

## Providers
- ANTHROPIC_API_KEY
- OPENROUTER_API_KEY
- OPENAI_API_KEY (optional)
- GOOGLE_API_KEY / GEMINI_API_KEY

## Secrets managers
- INFISICAL_TOKEN / machine identity vars (INFISICAL_CLIENT_ID, INFISICAL_CLIENT_SECRET, INFISICAL_PROJECT_ID)
- BW_SESSION / BW_CLIENTID / BW_CLIENTSECRET (Bitwarden, optional)

## Core services
- POSTGRES_URL / DATABASE_URL
- REDIS_URL
- FALKORDB_URL
- QDRANT_URL
- LETTA_URL
- MEM0_URL
- GRAPHITI_URL

## App config
- NEXT_PUBLIC_* (frontend)
- JWT_SECRET
- SESSION_SECRET

## Observability
- PROMETHEUS_* 
- GRAFANA_ADMIN_PASSWORD
- LOKI_* 
