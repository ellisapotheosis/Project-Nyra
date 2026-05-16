import type { Lead } from "@nyra/domain-models";
import { IActivepiecesClient } from "./index";

export class CampaignManager {
  private workflowClient: IActivepiecesClient;

  constructor(client: IActivepiecesClient) {
    this.workflowClient = client;
  }

  /**
   * Map Lead Stage to specific Activepieces Campaign
   */
  async syncLeadToCampaign(lead: Lead): Promise<void> {
    const stage = lead.stage;

    switch (stage) {
      case "NEW":
        await this.workflowClient.enrollInCampaign(
          lead.id!,
          "new-internet-lead"
        );
        break;
      case "NURTURING":
        await this.workflowClient.enrollInCampaign(
          lead.id!,
          "purchase-pre-approval"
        );
        break;
      case "DO_NOT_CONTACT":
      case "LOST":
        await this.workflowClient.removeFromCampaign(lead.id!, "*"); // Remove from all
        break;
      default:
        console.log(`[CampaignManager] No specific action for stage: ${stage}`);
    }
  }
}
