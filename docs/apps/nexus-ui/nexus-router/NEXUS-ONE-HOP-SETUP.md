# Integrating the One‑Hop Nexus Router with the Frontend Apps

This guide explains how to configure each of the front‑end applications under the `apps/` folder to
talk to the **one‑hop Nexus router** introduced in the `infra/` folder. The one‑hop router
provides a unified API endpoint and WebSocket endpoint for both LLM model routing and MCP tool
invocation. Using a single gateway reduces latency (no double hops through an LLM proxy such as
LiteLLM/OpenRouter) and centralises configuration, observability and caching.

## Why change your `NEXT_PUBLIC_API_URL`

Previously each application pointed to various back‑end services exposed on ports such as
`3600`, `3100` or to multiple WebSocket ports. After adding the one‑hop router (running on
`6000` in development), you can simplify your environment to a single host and port. All REST
requests, WebSocket connections and authentication will be proxied through the router and routed
to the appropriate service or model provider.

## Recommended environment variables

Create or update each app's `.env.local` file with the following keys. Adjust the hostname and
port if you have deployed the router elsewhere (e.g., `http://nexus.yourdomain.com`).

```env
# Unified API endpoint (HTTP)
NEXT_PUBLIC_API_URL=http://localhost:6000

# Unified WebSocket endpoint
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:6000
NEXT_PUBLIC_WS_URL=ws://localhost:6000

# Unified authentication endpoint (if using NextAuth or a custom auth API)
NEXT_PUBLIC_AUTH_URL=http://localhost:6010/auth

# Optional: explicit MCP endpoint
NEXT_PUBLIC_MCP_URL=http://localhost:6000/mcp

# Example Auth config (update secrets for your environment)
NEXTAUTH_SECRET=your-super-secret
NEXTAUTH_URL=http://localhost:3000

# Feature flags remain as before
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG=false

# External services remain unchanged (Sentry, GA, etc.)
```

### Special note on WebSockets

Many apps (e.g. `ratehunter`) currently specify `NEXT_PUBLIC_WEBSOCKET_URL` as `ws://localhost:4500`.
After switching to the one‑hop router you should change these to `ws://localhost:6010`. The router
will automatically upgrade HTTP requests to WebSocket where necessary and route them to the
appropriate service.

## Configuring local GPU workers

If you have enabled local GPU workers or additional MCP servers as described in
`infra/docs/NEXUS-ONE-HOP-INTEGRATION.md`, you can add more environment variables to map custom
model or tool routes. For example:

```env
# Route local GPU models before cloud models
NEXT_PUBLIC_LLM_PROVIDER_PRIORITIES=worker,gpt,anthropic

# Enable result caching (requires Redis configuration in nexus.toml)
NEXT_PUBLIC_ENABLE_LLM_CACHE=true
```

Refer to the **Cost Tiers and Routing** section in `infra/configs/nexus/llm-tiers.toml` for how to
select models by alias (`economy`, `standard`, `premium`). With the updated `nexus.toml` the
economy tier corresponds to `claude-fast` and `gemini-cheap`, the standard tier maps to
`claude-sonnet` and `gemini-pro`, and the premium tier points to `claude-opus`. Your
applications should continue to specify only the **model** field in their API calls; the router
will handle the mapping.

## Updating the apps

To adopt these changes:

1. Copy the `.env.local` template above into each application directory under `apps/`.
2. Start the one‑hop router using `docker compose -f docker-compose.base.yml -f infra/docker-compose.nexus-one-hop.yml up -d nexus_onehop` (see the integration guide). The router now
   listens on port `6000`, and exports Prometheus metrics on port `6011`.
3. Start your apps (`pnpm dev` or via the root `pnpm dev`). They will now communicate exclusively through the one‑hop router.
4. Monitor router metrics at `http://localhost:6011/metrics` and tune routing priorities via the `nexus.toml` file if desired.

## Additional resources

- `infra/docs/NEXUS-ONE-HOP-INTEGRATION.md` – full explanation of the one‑hop router setup and available features (caching, Prometheus, cost tiers).
- `infra/configs/nexus/llm-tiers.toml` – defines model aliases (economy/standard/premium) for Anthropic and Google providers.
- [Backend Services Documentation](../services/README.md) – details on the underlying REST and WebSocket services.

If you encounter issues, check the router logs (`docker logs nexus_onehop`) and ensure that the target services are reachable from within the router container.
