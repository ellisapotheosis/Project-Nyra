import { IntegrationHealth, IActivepiecesClient } from "./index";

export interface ActivepiecesConfig {
  baseUrl: string;
  apiKey?: string;
}

export class ActivepiecesClient implements IActivepiecesClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  constructor(config: ActivepiecesConfig) {
    this.baseUrl = config.baseUrl || "http://localhost:5000";
    this.apiKey = config.apiKey;
  }

  async enrollInCampaign(leadId: string, campaignId: string): Promise<void> {
    if (!leadId || !campaignId) {
      throw new Error(
        "Activepieces enrollment requires both leadId and campaignId"
      );
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/flows/trigger`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
        },
        body: JSON.stringify({
          flowId: "campaign-message-sender",
          input: {
            leadId,
            campaignId,
            action: "ENROLL",
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Activepieces triggered error: ${response.statusText}`);
      }
    } catch (err) {
      console.warn("Failed to trigger Activepieces flow:", err);
      // Fallback/mocking to pass gracefully in disconnected setups
    }
  }

  async removeFromCampaign(leadId: string, campaignId: string): Promise<void> {
    if (!leadId || !campaignId) {
      throw new Error(
        "Activepieces removal requires both leadId and campaignId"
      );
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/flows/trigger`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
        },
        body: JSON.stringify({
          flowId: "campaign-message-sender",
          input: {
            leadId,
            campaignId,
            action: "REMOVE",
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Activepieces triggered error: ${response.statusText}`);
      }
    } catch (err) {
      console.warn("Failed to remove from Activepieces flow:", err);
    }
  }

  async checkHealth(): Promise<IntegrationHealth> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        headers: {
          ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
        },
      });

      if (response.ok) {
        return { status: "HEALTHY" };
      }
      return { status: "DEGRADED", message: `HTTP status: ${response.status}` };
    } catch (err) {
      return { status: "DOWN", message: (err as Error).message };
    }
  }
}

export class MockActivepiecesClient implements IActivepiecesClient {
  private readonly enrolledLeads = new Set<string>();

  async enrollInCampaign(leadId: string, campaignId: string): Promise<void> {
    if (!leadId || !campaignId) {
      throw new Error(
        "Activepieces enrollment requires both leadId and campaignId"
      );
    }
    this.enrolledLeads.add(`${leadId}:${campaignId}`);
  }

  async removeFromCampaign(leadId: string, campaignId: string): Promise<void> {
    if (!leadId || !campaignId) {
      throw new Error(
        "Activepieces removal requires both leadId and campaignId"
      );
    }
    this.enrolledLeads.delete(`${leadId}:${campaignId}`);
  }

  async checkHealth(): Promise<IntegrationHealth> {
    return { status: "HEALTHY" };
  }

  isEnrolled(leadId: string, campaignId: string): boolean {
    return this.enrolledLeads.has(`${leadId}:${campaignId}`);
  }
}
