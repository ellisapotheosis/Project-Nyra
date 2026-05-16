import { IActivepiecesClient, IntegrationHealth } from "./index";
import axios from "axios";

export class ActivepiecesIntegrationAdapter implements IActivepiecesClient {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  async enrollInCampaign(leadId: string, campaignId: string): Promise<void> {
    await axios.post(
      `${this.apiUrl}/webhooks/enroll`,
      {
        leadId,
        campaignId,
      },
      {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      }
    );
  }

  async removeFromCampaign(leadId: string, campaignId: string): Promise<void> {
    await axios.post(
      `${this.apiUrl}/webhooks/remove`,
      {
        leadId,
        campaignId,
      },
      {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      }
    );
  }

  async checkHealth(): Promise<IntegrationHealth> {
    try {
      await axios.get(`${this.apiUrl}/health`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      return { status: "HEALTHY" };
    } catch (e) {
      return { status: "DEGRADED", message: (e as Error).message };
    }
  }
}
