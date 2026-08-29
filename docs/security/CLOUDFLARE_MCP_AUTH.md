# Project Nyra Cloudflare MCP authentication

Status: Portal/Access configuration is live and partially verified. Both public Portal hostnames now have working Access-protected MCP transport and Managed OAuth discovery. The final interactive identity-provider login and an end-to-end Portal tool invocation still require a real client session.

## Canonical paths

Human clients use Cloudflare MCP Portal Managed OAuth and the existing Access identity policy. They do not receive the Nexus credential.

Machine clients send only `CF-Access-Client-Id` and `CF-Access-Client-Secret` to the portal. The portal Access application and every linked MCP server application must each contain a Service Auth policy for the same token. Linked servers used by agents must have `on_behalf=false`, so the portal uses its stored admin/upstream credential rather than asking the agent for a human OAuth grant.

The live Portal uses the dedicated `nyra-bearer` upstream server object. Its credential is a custom-header JSON credential containing the scoped Nexus bearer and the Access service-token headers required by the protected Nexus hostname. The secret is represented in Infisical as a reference under `/hosts/shared`; the value must never enter git, client configuration, or logs. Never convert or spoof `Cf-Access-Jwt-Assertion` into a Nexus bearer token.

Identity enforcement remains Cloudflare Access. The portal credential is a service identity at Nexus. Unless a deployed Nexus build cryptographically verifies a documented end-user token, original human identity is not propagated upstream.

`mcp-gateway.projectnyra.com` is the canonical client hostname. `mcp-portal.projectnyra.com` is a separately configured Cloudflare MCP Portal and Access application that points to the same `nyra-bearer` linked server; it is retained as a compatibility alias. Both hostnames use the proxied CNAME `gateway.agents.cloudflare.com`, and both advertise the same Cloudflare Access OAuth issuer.

The live difference between the two hostnames was the Access application's dynamic-client-registration allow-list. The `mcp-portal` application had no allowed redirect URI, while the canonical gateway already allowed the ChatGPT connector callback. The callback `https://chatgpt.com/connector/oauth/ScujoiRI23cB` is now configured on both applications.

## Gateway decision

Gateway routing is opt-in. Enable it only after a harmless Streamable HTTP and SSE call succeeds through the exact portal path, then validate DLP and HTTP logging. Do not put a second MCP discovery layer in front of Nexus by default.

## Required live evidence

1. Portal server `nyra-bearer` status is `Ready`, `authentication_status` is `connected`, and `on_behalf=false` after upstream authentication. **Observed 2026-08-25.**
2. OAuth dynamic client registration and the authorization redirect to Cloudflare Access are verified for both hostnames. Completing the Managed OAuth login and callback requires a real human client identity-provider session.
3. Authorized service-token MCP `initialize` succeeds on both Portal hostnames without browser OAuth. An end-to-end Portal tool call and a negative unauthorized-token test remain separate checks.
4. Direct Nexus hostname and Tailscale-only endpoint are not reachable from the public internet.
5. Access, Portal, Gateway (if enabled), and Nexus logs contain correlated request IDs without secrets.

The current workspace has not produced complete Phase 2 evidence: both public hostnames are Access-protected, both complete MCP initialization, and the Portal bearer server is ready. The remaining Cloudflare proof is a real Portal tool call plus an interactive OAuth callback. The live Oracle inventory confirms the Grafbase Nexus container is healthy and loopback-bound from the canonical host deployment; this is no longer a hostname-ownership blocker.

References: [MCP server portals](https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/mcp-portals/), [Managed OAuth](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/managed-oauth/), [service tokens](https://developers.cloudflare.com/cloudflare-one/access-controls/service-credentials/service-tokens/), and [linked apps](https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/linked-apps/).
