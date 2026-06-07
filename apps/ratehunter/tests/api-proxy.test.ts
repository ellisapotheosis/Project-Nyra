jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) => ({
      json: async () => body,
      status: init?.status ?? 200,
    }),
  },
}));

const ORIGINAL_ENV = process.env;
const ORIGINAL_FETCH = global.fetch;
const ORIGINAL_RESPONSE = global.Response;

class MockResponse {
  body: unknown;
  headers: Headers;
  status: number;

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    this.body = body;
    this.headers = new Headers(init?.headers);
    this.status = init?.status ?? 200;
  }

  static json(body: unknown, init?: ResponseInit) {
    return {
      json: async () => body,
      status: init?.status ?? 200,
    };
  }
}

describe("RateHunter API proxies", () => {
  beforeEach(() => {
    jest.resetModules();
    global.fetch = ORIGINAL_FETCH;
    global.Response = MockResponse as typeof Response;
    process.env = {
      ...ORIGINAL_ENV,
      NODE_ENV: "production",
      NYRA_ENABLE_MOCKS: "false",
    };
    delete process.env.LEAD_INGESTION_API_URL;
    delete process.env.N8N_INGEST_WEBHOOK_URL;
    delete process.env.OPENCLAW_BORROWER_API_URL;
    delete process.env.BORROWER_CHAT_API_URL;
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
    global.fetch = ORIGINAL_FETCH;
    global.Response = ORIGINAL_RESPONSE;
  });

  it("preserves the configured n8n lead ingest webhook URL", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    global.fetch = fetchMock;
    process.env = {
      ...process.env,
      N8N_INGEST_WEBHOOK_URL:
        "https://n8n.projectnyra.com/webhook/ratehunter-leads",
    };
    const { POST } = await import("../src/app/api/leads/ingest/route");

    const response = await POST(
      requestJson({ email: "lead@example.com", source: "ratehunter" })
    );

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://n8n.projectnyra.com/webhook/ratehunter-leads",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("preserves the configured OpenClaw borrower chat URL", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: "ok",
      headers: new Headers({ "content-type": "text/event-stream" }),
    });
    global.fetch = fetchMock;
    process.env = {
      ...process.env,
      OPENCLAW_BORROWER_API_URL:
        "https://openclaw-gateway.projectnyra.com/borrower/chat",
    };
    const { POST } = await import("../src/app/api/openclaw/chat/route");

    const response = await POST(requestText('{"message":"hello"}'));

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://openclaw-gateway.projectnyra.com/borrower/chat",
      expect.objectContaining({ method: "POST" })
    );
  });
});

function requestJson(payload: unknown) {
  return {
    json: async () => payload,
  } as Request;
}

function requestText(payload: string) {
  return {
    headers: new Headers({ "content-type": "application/json" }),
    text: async () => payload,
  } as Request;
}

export {};
