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
    global.fetch = ORIGINAL_FETCH;
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

  it("fails closed for production lead reads without CRM config", async () => {
    const { GET } = await import("../src/app/api/leads/route");

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error).toBe("CRM API is unavailable");
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

  it("fails closed for production quote reads without quote-service config", async () => {
    const { GET } = await import("../src/app/api/quote/loan-types/route");

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error).toBe("Quote service is unavailable");
    expect(body.mocksEnabled).toBe(false);
  });

  it("routes production quote generation to the quote service contract", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ summary: { periodic_payment_pi: 2528.27 } }),
    });
    global.fetch = fetchMock;
    process.env = {
      ...process.env,
      QUOTE_API_URL: "https://quote.example.test",
    };
    jest.resetModules();
    const { POST } = await import("../src/app/api/quotes/generate/route");

    const response = await POST(
      requestJson({
        leadId: "lead_123",
        loanScenario: {
          loanAmount: { amountCents: 42500000 },
          termYears: 30,
        },
        interestRate: 6.5,
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.summary.periodic_payment_pi).toBe(2528.27);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://quote.example.test/quote",
      expect.objectContaining({
        method: "POST",
      })
    );
    const forwardedBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(forwardedBody).toEqual(
      expect.objectContaining({
        loan_amount: 425000,
        annual_interest_rate: 0.065,
        term_years: 30,
      })
    );
  });

  it("normalizes production quote comparisons to the deployed loan-type contract", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        comparison: {
          conventional: { available: true, monthly_payment: 2528.27 },
        },
      }),
    });
    global.fetch = fetchMock;
    process.env = {
      ...process.env,
      QUOTE_API_URL: "https://quote.example.test",
    };
    jest.resetModules();
    const { POST } = await import(
      "../src/app/api/quote/compare-loan-types/route"
    );

    const response = await POST(
      requestJson({
        property_value: 500000,
        loan_amount: 400000,
        credit_score: 740,
        annual_interest_rate: 6.5,
        term_years: 30,
        annual_property_tax: 6000,
        annual_home_insurance: 1200,
        monthly_hoa: 100,
        start_date: "2026-07-01",
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.comparison.conventional.monthly_payment).toBe(2528.27);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://quote.example.test/quote/compare-loan-types",
      expect.objectContaining({
        method: "POST",
      })
    );
    const forwardedBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(forwardedBody).toEqual(
      expect.objectContaining({
        loan_amount: 400000,
        property_value: 500000,
        annual_interest_rate: 0.065,
        term_years: 30,
        loan_type: "conventional",
        credit_score: 740,
        down_payment: 100000,
        annual_property_tax: 6000,
        annual_home_insurance: 1200,
        monthly_hoa: 100,
        start_date: "2026-07-01",
        include_schedule: false,
      })
    );
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

  it("fails closed for production campaign reads without campaign-service config", async () => {
    const { GET } = await import("../src/app/api/campaigns/route");

    const response = await GET();
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

  it("does not proxy production campaign deletes to unsupported service routes", async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock;
    process.env = {
      ...process.env,
      CAMPAIGN_ENGINE_URL: "https://campaign.example.test",
    };
    jest.resetModules();
    const { DELETE } = await import("../src/app/api/campaigns/[id]/route");

    const response = await DELETE(requestJson({}), {
      params: Promise.resolve({ id: "campaign-123" }),
    });
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(body.error).toBe("Campaign service is unavailable");
    expect(body.detail).toContain("Campaign deletes are not supported");
  });
});

function requestJson(payload: unknown) {
  return {
    json: async () => payload,
  } as Request;
}

export {};
