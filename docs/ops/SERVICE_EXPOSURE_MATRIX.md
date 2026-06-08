# Service Exposure Matrix

Public ingress is limited to Cloudflare Tunnel and Access-gated surfaces.

Never publicly expose:

- Postgres, Redis, Qdrant, FalkorDB
- raw vLLM/Ollama endpoints
- raw MCP internals
- internal worker dashboards without Access/Tailscale

Admin/operator surfaces should use Cloudflare Access. Internal service-to-service traffic should prefer Tailscale/MagicDNS names.
