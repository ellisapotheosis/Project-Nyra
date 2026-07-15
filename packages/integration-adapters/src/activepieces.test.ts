import { describe, it, expect, vi, beforeEach } from "vitest";
import { ActivepiecesClient, MockActivepiecesClient } from "./activepieces";

describe("Activepieces Client & Mock Integration", () => {
  const config = {
    baseUrl: "http://localhost:5000",
    apiKey: "test-api-key",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("ActivepiecesClient (Real HTTP boundary)", () => {
    it("should successfully trigger enrollment flow via HTTP post", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });
      global.fetch = mockFetch;

      const client = new ActivepiecesClient(config);
      await client.enrollInCampaign("lead-123", "campaign-456");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:5000/v1/flows/trigger",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-api-key",
          },
          body: expect.any(String),
        }
      );

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body).toEqual({
        flowId: "campaign-message-sender",
        input: {
          leadId: "lead-123",
          campaignId: "campaign-456",
          action: "ENROLL",
          timestamp: expect.any(String),
        },
      });
    });

    it("should successfully trigger removal flow via HTTP post", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });
      global.fetch = mockFetch;

      const client = new ActivepiecesClient(config);
      await client.removeFromCampaign("lead-123", "campaign-456");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:5000/v1/flows/trigger",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-api-key",
          },
          body: expect.any(String),
        }
      );

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body).toEqual({
        flowId: "campaign-message-sender",
        input: {
          leadId: "lead-123",
          campaignId: "campaign-456",
          action: "REMOVE",
          timestamp: expect.any(String),
        },
      });
    });

    it("should return healthy status when health check passes", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
      });
      global.fetch = mockFetch;

      const client = new ActivepiecesClient(config);
      const health = await client.checkHealth();

      expect(health).toEqual({ status: "HEALTHY" });
      expect(mockFetch).toHaveBeenCalledWith("http://localhost:5000/health", {
        headers: {
          Authorization: "Bearer test-api-key",
        },
      });
    });

    it("should return down status when fetch throws", async () => {
      const mockFetch = vi
        .fn()
        .mockRejectedValue(new Error("Network connection refused"));
      global.fetch = mockFetch;

      const client = new ActivepiecesClient(config);
      const health = await client.checkHealth();

      expect(health).toEqual({
        status: "DOWN",
        message: "Network connection refused",
      });
    });
  });

  describe("MockActivepiecesClient (In-memory testing)", () => {
    it("should successfully enroll and track states in memory", async () => {
      const mockClient = new MockActivepiecesClient();
      expect(mockClient.isEnrolled("lead-999", "campaign-888")).toBe(false);

      await mockClient.enrollInCampaign("lead-999", "campaign-888");
      expect(mockClient.isEnrolled("lead-999", "campaign-888")).toBe(true);

      await mockClient.removeFromCampaign("lead-999", "campaign-888");
      expect(mockClient.isEnrolled("lead-999", "campaign-888")).toBe(false);

      const health = await mockClient.checkHealth();
      expect(health).toEqual({ status: "HEALTHY" });
    });
  });
});
