# Nyra Mem0 Bridge

Bootstrap-safe memory service:
- If `MEM0_API_KEY` is set, it proxies to Mem0.
- If not, it uses a local SQLite store so the stack still runs.

Endpoints:
- `GET /health`
- `POST /memories/add`
- `POST /memories/search`
