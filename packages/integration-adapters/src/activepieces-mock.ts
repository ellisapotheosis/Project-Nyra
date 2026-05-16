import { IActivepiecesClient, IntegrationHealth } from './index';

export class MockActivepiecesClient implements IActivepiecesClient {
  async enrollInCampaign(leadId: string, campaignId: string): Promise<void> {
    console.log(`[MockActivepieces] Enrolling lead ${leadId} into campaign ${campaignId}`);
    console.log(`[AUDIT] CAMPAIGN_ENROLLMENT: ${leadId} in ${campaignId}`);
  }

  async removeFromCampaign(leadId: string, campaignId: string): Promise<void> {
    console.log(`[MockActivepieces] Removing lead ${leadId} from campaign ${campaignId}`);
    console.log(`[AUDIT] CAMPAIGN_REMOVAL: ${leadId}`);
  }

  async checkHealth(): Promise<IntegrationHealth> {
    return { status: 'HEALTHY' };
  }
}
