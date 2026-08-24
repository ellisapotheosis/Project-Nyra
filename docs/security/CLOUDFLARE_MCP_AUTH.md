# Project Nyra Cloudflare MCP authentication

Status: Portal/Access configuration is live and partially verified. The dedicated bearer server is synchronized; end-to-end Portal tool execution and one interactive human login remain open.

## Canonical paths

Human clients use Cloudflare MCP Portal Managed OAuth and the existing Access identity policy. They do not receive the Nexus credential.

Machine clients send only `CF-Access-Client-Id` and `CF-Access-Client-Secret` to the portal. The portal Access application and every linked MCP server application must each contain a Service Auth policy for the same token. Linked servers used by agents must have `on_behalf=false`, so the portal uses its stored admin/upstream credential rather than asking the agent for a human OAuth grant.

The live Portal uses the dedicated `nyra-bearer` upstream server object. Its credential is a custom-header JSON credential containing the scoped Nexus bearer and the Access service-token headers required by the protected Nexus hostname. The secret is represented in Infisical as a reference under `/hosts/shared`; the value must never enter git, client configuration, or logs. Never convert or spoof `Cf-Access-Jwt-Assertion` into a Nexus bearer token.

Identity enforcement remains Cloudflare Access. The portal credential is a service identity at Nexus. Unless a deployed Nexus build cryptographically verifies a documented end-user token, original human identity is not propagated upstream.

## Gateway decision

Gateway routing is opt-in. Enable it only after a harmless Streamable HTTP and SSE call succeeds through the exact portal path, then validate DLP and HTTP logging. Do not put a second MCP discovery layer in front of Nexus by default.

## Required live evidence

1. Portal server `nyra-bearer` status is `Ready` and `authentication_status` is `connected` after upstream authentication. **Observed 2026-08-24.**
2. Human client completes Managed OAuth, lists a harmless test tool, and receives its response.
3. Authorized service token reaches and initializes both direct Nexus and the Portal without a browser; an unauthorized token receives 401/403. **Direct Nexus and Portal initialize observed; Portal upstream tool call remains open.**
4. Direct Nexus hostname and Tailscale-only endpoint are not reachable from the public internet.
5. Access, Portal, Gateway (if enabled), and Nexus logs contain correlated request IDs without secrets.

The current workspace has not produced complete evidence: the public hostname is Access-protected and the Portal bearer server is ready, but the service-token Portal session reports no connected upstream server and the human path needs an interactive login. The live Oracle inventory now confirms the Grafbase Nexus container is healthy and loopback-bound from the canonical host deployment; this remains a Portal data-plane and human-proof blocker, not an origin-placement blocker.

References: [MCP server portals](https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/mcp-portals/), [Managed OAuth](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/managed-oauth/), [service tokens](https://developers.cloudflare.com/cloudflare-one/access-controls/service-credentials/service-tokens/), and [linked apps](https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/linked-apps/).
