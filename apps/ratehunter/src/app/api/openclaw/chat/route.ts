const DEFAULT_UPSTREAM_PATH = "/api/chat/stream";
const FALLBACK_REPLY =
  "Borrower chat is not configured yet. Add OPENCLAW_BORROWER_API_URL to enable the OpenClaw relay.";

function buildUpstreamUrl() {
  const configuredBorrowerUrl = process.env.OPENCLAW_BORROWER_API_URL?.trim();

  if (configuredBorrowerUrl) {
    return configuredBorrowerUrl;
  }

  const configuredBase = process.env.BORROWER_CHAT_API_URL?.trim() || "";

  if (!configuredBase) {
    return null;
  }

  if (configuredBase.includes("/api/chat/stream")) {
    return configuredBase;
  }

  return `${configuredBase.replace(/\/$/, "")}${DEFAULT_UPSTREAM_PATH}`;
}

function buildForwardHeaders(request: Request) {
  const headers = new Headers({
    "content-type": request.headers.get("content-type") || "application/json",
    "x-chat-channel": "borrower-web",
    "x-chat-persona": "borrower",
  });

  const tenantId = request.headers.get("x-tenant-id");
  if (tenantId) {
    headers.set("x-tenant-id", tenantId);
  }

  const apiKey = process.env.OPENCLAW_BORROWER_API_KEY?.trim();
  if (apiKey) {
    headers.set("authorization", `Bearer ${apiKey}`);
  }

  return headers;
}

function buildResponseHeaders(sourceHeaders: Headers) {
  const headers = new Headers();
  const contentType = sourceHeaders.get("content-type");
  const cacheControl = sourceHeaders.get("cache-control");

  headers.set("content-type", contentType || "text/event-stream");
  if (cacheControl) {
    headers.set("cache-control", cacheControl);
  } else {
    headers.set("cache-control", "no-store");
  }

  return headers;
}

function canUseLocalFallback() {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.NYRA_ENABLE_MOCKS === "true"
  );
}

export async function POST(request: Request) {
  const upstreamUrl = buildUpstreamUrl();
  if (!upstreamUrl) {
    if (!canUseLocalFallback()) {
      return Response.json(
        {
          reply:
            "Borrower chat is unavailable because OPENCLAW_BORROWER_API_URL is not configured.",
        },
        { status: 503 }
      );
    }

    return Response.json({ reply: FALLBACK_REPLY });
  }

  try {
    const requestBody = await request.text();
    const upstreamResponse = await fetch(upstreamUrl, {
      method: "POST",
      headers: buildForwardHeaders(request),
      body: requestBody,
    });

    if (!upstreamResponse.ok) {
      const reply = `Borrower chat upstream returned ${upstreamResponse.status}. Please try again shortly.`;
      return Response.json({ reply }, { status: upstreamResponse.status });
    }

    if (!upstreamResponse.body) {
      return Response.json({
        reply:
          "Borrower chat responded without a body. Please verify the upstream streaming endpoint.",
      });
    }

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: buildResponseHeaders(upstreamResponse.headers),
    });
  } catch {
    return Response.json(
      {
        reply:
          "I could not reach the borrower chat service right now. Please try again shortly.",
      },
      { status: 502 }
    );
  }
}
