# Worker Tunnel Decision Report

Updated: 2026-05-08

Decision:

- Do not create worker-specific Cloudflare tunnels right now.
- Keep worker vLLM and Ollama private over Tailscale.
- Do not publish raw worker inference endpoints.

Rationale:

- The current need is app/service/MCP subdomains, not direct worker model serving.
- Nexus/LiteLLM should be the controlled model/tool entrypoint.
- Worker tunnels increase attack surface and operational drift.

Allowed future exception:

- If a worker hosts a human UI that must be reachable from arbitrary browsers, create a dedicated Access-gated hostname and never expose raw `vLLM`, `Ollama`, Redis, database, or exporter ports.
