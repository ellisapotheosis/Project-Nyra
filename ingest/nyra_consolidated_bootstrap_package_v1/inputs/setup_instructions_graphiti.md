# Setup Instructions for Graphiti with FalkorDB and RuVector

This document provides step‑by‑step instructions for running the Graphiti server with FalkorDB (Redis module) and RuVector using Docker Compose.  It also explains the necessary environment variables and manual setup.

## Prerequisites

- Docker and Docker Compose installed on the orchestrator PC.
- Ports 6379, 7474, 8000, 5432, and 6380 available or mapped appropriately.
- Tailscale/Cloudflared configured if exposing services externally.

## Steps

1. **Clone your repository** (if not done already) outside the Project‑Nyra monorepo to keep infrastructure separate:
   ```bash
   git clone https://github.com/ellisapotheosis/Project-Nyra.git ~/Project-Nyra
   cd ~/Project-Nyra
   ```

2. **Create an `.env` file** based on the provided `env_example.txt` and adjust values:
   ```bash
   cp env_example.txt .env
   # Edit .env to set NEXUS_ROUTER_URL, API keys, DB URLs, etc.
   nano .env
   ```

3. **Start services** using the provided `docker-compose.graphiti.yml`:
   ```bash
   docker compose -f docker-compose.graphiti.yml --env-file .env up -d
   ```
   This will launch the following containers:
   - `falkordb`: Redis with FalkorDB module loaded, storing graphs in `/data`.
   - `graphiti`: HTTP API for graph queries (listening on port 7474).
   - `ruvector`: Vector memory service storing embeddings in Postgres.
   - `postgres`: Postgres database for RuVector and optionally AgentDB.
   - `redis`: Redis instance for caching/brokering (optional but recommended).

4. **Initialize databases** (optional):
   - RuVector automatically creates its tables upon first use.  To pre‑seed patterns, call its `/add` endpoint via HTTP.
   - For AgentDB or TwentyCRM, create separate schemas or databases inside Postgres and run migrations via their respective CLI tools.

5. **Verify Graphiti connection**:
   - Ensure `graphiti` logs show that it connected to `falkordb`.  You should see messages like `connected to FalkorDB at redis://falkordb:6379`.
   - Open `http://localhost:7474` (or the mapped port) in your browser; you should see Graphiti’s API interface.
   - Use `curl` or Postman to send a sample Cypher query:
     ```bash
     curl -X POST http://localhost:7474/query -H "Content-Type: application/json" \
       -d '{"query": "CREATE (:Test {name: \"Hello\"})"}'
     ```
     The response should indicate success.

6. **Integrate with Nexus Router**:
   - In your orchestrator’s Nexus configuration, add routes pointing to Graphiti and RuVector:
     ```yaml
     services:
       graphiti:
         url: http://graphiti:7474
       ruvector:
         url: http://ruvector:8000
     ```
   - The Proxy layer in your apps (landing page, Clawdbot UI, admin portal) should call these services via the Nexus Router to avoid exposing internal container addresses.

7. **Deploy to Production**:
   - Use a reverse proxy (e.g., Nginx or Caddy) to expose `graphiti` and `ruvector` behind HTTPS.  In production you may prefer to run FalkorDB and Graphiti on dedicated machines; adjust the `docker-compose` file accordingly.
   - Configure persistent volumes and backup strategies for Redis and Postgres.

## Manual DB Setup Notes

- **FalkorDB** runs as a Redis module, so no separate service (like Neo4j) is required.  Graphiti communicates via the Redis protocol.  Ensure that your `redis.conf` or environment variables enable loading modules and persistence (AOF) if you need to save graphs to disk.
- **RuVector** stores vector embeddings in Postgres using `pgvector`.  The `ruvector` container automatically handles schema creation.  For large datasets, allocate sufficient CPU/RAM and tune Postgres accordingly.
- **AgentDB vs. RuVector**:  RuVector persists only vector memory.  AgentDB (optionally used by TwentyCRM) may use a separate database or schema; adjust `AGENTDB_DATABASE_URL` in `.env` and create the schema manually.

## Next Steps

- Populate FalkorDB with your mortgage and borrower graph using Graphiti’s API (e.g., create nodes for leads, loans, campaigns).  Use RuVector’s API to store embeddings of successful patterns and past interactions.
- Integrate Graphiti queries into your multi‑agent prompts (e.g., to retrieve relationships between leads and campaigns).  See the `Project‑Nyra` prompts for examples.
- Combine this setup with Moltbot or Claude‑Flow by pointing their memory configuration to `ruvector` and their graph memory to `graphiti`.
