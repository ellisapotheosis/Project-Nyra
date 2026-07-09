/**
 * MCP Gateway — Cloudflare Worker
 *
 * Public endpoint for mcp-gateway.projectnyra.com.
 * CF Access is NOT applied to this Worker; auth is handled here.
 *
 * Auth methods accepted:
 *   1. Static Bearer token  — Authorization: Bearer <MCP_BEARER_TOKEN>
 *   2. CF Access JWT        — Authorization: Bearer <cf-access-jwt>
 *      (issued after user logs in via the OAuth discovery flow)
 *
 * Valid requests are forwarded to nexus-router.projectnyra.com with
 * CF Access service-token headers so the protected origin accepts them.
 *
 * Required Worker secrets (set via wrangler secret put or CF dashboard):
 *   MCP_BEARER_TOKEN        — shared API key for ChatGPT / external clients
 *   CF_ACCESS_CLIENT_ID     — service token ID for nexus-router CF Access app
 *   CF_ACCESS_CLIENT_SECRET — service token secret
 *
 * Required Worker vars (wrangler.toml [vars] or CF dashboard):
 *   CF_ACCESS_TEAM_NAME     — e.g. "projectnyra" (the <team>.cloudflareaccess.com slug)
 *   NEXUS_UPSTREAM_URL      — e.g. "https://nexus-router.projectnyra.com"
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Authorization, Content-Type, x-api-key, x-request-id",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // OAuth 2.0 authorization server discovery — ChatGPT reads this to find
    // the authorization and token endpoints before starting the auth flow.
    if (url.pathname === "/.well-known/oauth-authorization-server") {
      const teamUrl = `https://${env.CF_ACCESS_TEAM_NAME}.cloudflareaccess.com`;
      return Response.json(
        {
          issuer: "https://mcp-gateway.projectnyra.com",
          authorization_endpoint: `${teamUrl}/oauth/authorize`,
          token_endpoint: `${teamUrl}/oauth/token`,
          jwks_uri: `${teamUrl}/cdn-cgi/access/certs`,
          scopes_supported: ["openid", "email"],
          response_types_supported: ["code"],
          grant_types_supported: ["authorization_code"],
          code_challenge_methods_supported: ["S256"],
          token_endpoint_auth_methods_supported: ["client_secret_post"],
        },
        { headers: { ...CORS_HEADERS, "Cache-Control": "max-age=3600" } }
      );
    }

    // All other paths require a valid Bearer token
    const authHeader = request.headers.get("Authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        {
          status: 401,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json",
            "WWW-Authenticate": 'Bearer realm="MCP Gateway"',
          },
        }
      );
    }

    // Auth path 1: static shared API key
    const isApiKey = env.MCP_BEARER_TOKEN && token === env.MCP_BEARER_TOKEN;

    // Auth path 2: CF Access JWT (issued after the OAuth flow completes)
    let isCfJwt = false;
    if (!isApiKey) {
      try {
        const identityResp = await fetch(
          `https://${env.CF_ACCESS_TEAM_NAME}.cloudflareaccess.com/cdn-cgi/access/get-identity`,
          { headers: { "cf-access-jwt-assertion": token } }
        );
        isCfJwt = identityResp.ok;
      } catch {
        // JWT validation network failure — treat as invalid
      }
    }

    if (!isApiKey && !isCfJwt) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        {
          status: 403,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    // Forward to protected Nexus Router with CF Access service-token headers
    const upstreamUrl = new URL(
      url.pathname + url.search,
      env.NEXUS_UPSTREAM_URL
    );

    const upstreamHeaders = new Headers();
    // Forward safe request headers
    for (const [k, v] of request.headers.entries()) {
      const lower = k.toLowerCase();
      if (
        lower === "content-type" ||
        lower === "accept" ||
        lower === "x-request-id"
      ) {
        upstreamHeaders.set(k, v);
      }
    }
    // Inject CF Access service token so the protected origin accepts the request
    upstreamHeaders.set("CF-Access-Client-Id", env.CF_ACCESS_CLIENT_ID);
    upstreamHeaders.set("CF-Access-Client-Secret", env.CF_ACCESS_CLIENT_SECRET);

    const upstreamResp = await fetch(upstreamUrl.toString(), {
      method: request.method,
      headers: upstreamHeaders,
      body:
        request.method !== "GET" && request.method !== "HEAD"
          ? request.body
          : undefined,
    });

    // Pass response back with CORS headers added
    const respHeaders = new Headers(upstreamResp.headers);
    for (const [k, v] of Object.entries(CORS_HEADERS)) {
      respHeaders.set(k, v);
    }

    return new Response(upstreamResp.body, {
      status: upstreamResp.status,
      headers: respHeaders,
    });
  },
};
