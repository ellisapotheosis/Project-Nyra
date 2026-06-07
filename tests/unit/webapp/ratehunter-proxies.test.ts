import { describe, expect, it, vi, beforeEach, afterAll } from "vitest";

vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) => Response.json(body, init),
  },
}));

const ORIGINAL_ENV = process.env;

describe("RateHunter production proxy gates", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...ORIGINAL_ENV,
      NODE_ENV: "production",
      NYRA_ENABLE_MOCKS: "false",
    };
    delete process.env.N8N_INGEST_WEBHOOK_URL;
    delete process.env.OPENCLAW_BORROWER_API_URL;
    delete process.env.BORROWER_CHAT_API_URL;
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("fails closed for production lead ingest when no webhook is configured", async () => {
    const { POST } =
      await import("../../../apps/ratehunter/src/app/api/leads/ingest/route.ts");

    const response = await POST(requestJson({ email: "lead@example.com" }));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toEqual(
      expect.objectContaining({
        success: false,
        error: "Lead ingest is unavailable",
      })
    );
  });

  it("keeps explicit local/mock RateHunter ingest available outside production", async () => {
    process.env.NODE_ENV = "development";
    vi.resetModules();
    const { POST } =
      await import("../../../apps/ratehunter/src/app/api/leads/ingest/route.ts");

    const response = await POST(requestJson({ email: "lead@example.com" }));
    const body = await response.json();

    expect(response.status).toBe(202);
    expect(body.source).toBe("mock");
  });

  it("redacts lead PII from ingest proxy error logs", async () => {
    process.env.N8N_INGEST_WEBHOOK_URL =
      "https://n8n.example.test/webhook?token=super-secret";
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("bad", { status: 500 }));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.resetModules();

    const { POST } =
      await import("../../../apps/ratehunter/src/app/api/leads/ingest/route.ts");

    const response = await POST(
      requestJson({
        email: "lead@example.com",
        phone: "555-123-4567",
      })
    );

    const logged = errorSpy.mock.calls.flat().map(String).join(" ");
    expect(response.status).toBe(500);
    expect(logged).not.toContain("lead@example.com");
    expect(logged).not.toContain("555-123-4567");
    expect(logged).not.toContain("super-secret");

    fetchMock.mockRestore();
    errorSpy.mockRestore();
  });

  it("fails closed for production borrower chat when OpenClaw is not configured", async () => {
    const { POST } =
      await import("../../../apps/ratehunter/src/app/api/openclaw/chat/route.ts");

    const response = await POST(new Request("https://ratehunter.net/api/chat"));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.reply).toContain("OPENCLAW_BORROWER_API_URL");
  });
});

function requestJson(payload: unknown) {
  return {
    json: async () => payload,
  } as Request;
}
