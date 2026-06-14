jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) => ({
      json: async () => body,
      status: init?.status ?? 200,
    }),
  },
}));

const ORIGINAL_ENV = process.env;
const ORIGINAL_RESPONSE = global.Response;
const ORIGINAL_FETCH = global.fetch;

describe("production API mutation fallbacks", () => {
  beforeEach(() => {
    jest.resetModules();
    global.Response = {
      json: (body: unknown, init?: ResponseInit) => ({
        json: async () => body,
        status: init?.status ?? 200,
      }),
    } as typeof Response;
    process.env = {
      ...ORIGINAL_ENV,
      NODE_ENV: "production",
      NYRA_ENABLE_MOCKS: "false",
    };
    delete process.env.CRM_API_URL;
    delete process.env.LEAD_INGESTION_API_URL;
    delete process.env.QUOTE_API_URL;
    delete process.env.CAMPAIGN_ENGINE_URL;
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
    global.Response = ORIGINAL_RESPONSE;
    global.fetch = ORIGINAL_FETCH;
  });

  it("fails closed for production lead writes without CRM or ingestion service config", async () => {
    const { POST } = await import("../src/app/api/leads/route");

    const response = await POST(
      requestJson({
        email: "lead@example.com",
        firstName: "Test",
        lastName: "Lead",
      })
    );
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error).toBe("Lead ingestion is unavailable");
    expect(body.mocksEnabled).toBe(false);
  });

  it("does not post raw lead writes to the CRM API fallback", async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock;
    process.env = {
      ...process.env,
      CRM_API_URL: "https://crm.example.test",
    };
    jest.resetModules();
    const { POST } = await import("../src/app/api/leads/route");

    const response = await POST(
      requestJson({
        email: "lead@example.com",
        firstName: "Test",
        lastName: "Lead",
      })
    );
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(body.detail).toContain(
      "LEAD_INGESTION_API_URL must be configured for production lead writes"
    );
  });

  it("keeps local development lead write mocks available", async () => {
    process.env = {
      ...process.env,
      NODE_ENV: "development",
    };
    jest.resetModules();
    const { POST } = await import("../src/app/api/leads/route");

    const response = await POST(
      requestJson({ email: "dev@example.com", name: "Dev Lead" })
    );
    const body = await response.json();

    expect(response.status).toBe(202);
    expect(body.source).toBe("mock");
  });

  it("fails closed for production quote generation without quote-service config", async () => {
    const { POST } = await import("../src/app/api/quotes/generate/route");

    const response = await POST(
      requestJson({ leadId: "lead_123", loanAmount: 400000 })
    );
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error).toBe("Quote service is unavailable");
    expect(body.mocksEnabled).toBe(false);
  });

  it("fails closed for production campaign writes without campaign-service config", async () => {
    const { POST } = await import("../src/app/api/campaigns/route");

    const response = await POST(
      requestJson({
        name: "Purchase nurture",
        steps: [{ channel: "sms", day: 1 }],
      })
    );
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error).toBe("Campaign service is unavailable");
    expect(body.mocksEnabled).toBe(false);
  });

  it("fails closed for production campaign updates without campaign-service config", async () => {
    const { PUT } = await import("../src/app/api/campaigns/[id]/route");

    const response = await PUT(
      requestJson({ name: "Updated campaign", steps: [] }),
      { params: Promise.resolve({ id: "campaign-123" }) }
    );
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error).toBe("Campaign service is unavailable");
    expect(body.mocksEnabled).toBe(false);
  });
});

function requestJson(payload: unknown) {
  return {
    json: async () => payload,
  } as Request;
}

export {};
