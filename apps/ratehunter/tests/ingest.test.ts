import { POST } from "@/app/api/leads/ingest/route";

global.fetch = jest.fn();

describe("lead capture ingest api route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("successfully forwards lead data to lead capture api", async () => {
    const mockLeadData = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+11234567890",
      source: "RATEHUNTER_LANDING",
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, leadId: "mock-id" }),
    });

    const request = {
      json: async () => mockLeadData,
    } as any;

    const response = await POST(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain("capture.projectnyra.com");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://capture.projectnyra.com/api/leads",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...mockLeadData, consent: true }),
      })
    );
  });

  it("handles failure when lead capture api fails", async () => {
    const mockLeadData = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "+11234567890",
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => "Invalid consent",
    });

    const request = {
      json: async () => mockLeadData,
    } as any;

    const response = await POST(request);
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain("Lead Capture API responded with 400");
  });
});
