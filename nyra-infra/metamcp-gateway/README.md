# MetaMCP Gateway

This gateway exposes namespace-qualified SSE endpoints. **Namespace names are part of the URL.**

## SSE endpoints

- Always-on: `http://localhost:12008/metamcp/always_on/sse`
- Light context: `http://localhost:12008/metamcp/context_light/sse`
- Hungry context: `http://localhost:12008/metamcp/context_hungry/sse`

## Claude Desktop example

See `claude_desktop_config.json.example` in this folder. The `serverUrls` refer to the same namespace-qualified paths as above.
