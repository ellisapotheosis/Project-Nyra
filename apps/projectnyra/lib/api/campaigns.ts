import { requestJson } from "./base";

export type CampaignStep = {
  id: string;
  day: number;
  channel: "email" | "sms" | "voice" | "missed_call_ping";
  templateId: string;
};

export type Campaign = {
  id: string;
  name: string;
  loanPurpose?: string;
  active?: boolean;
  status?: string;
  steps: CampaignStep[];
};

export const campaignApi = {
  async getCampaigns() {
    return requestJson<{ campaigns: Campaign[]; source?: string }>(
      "/api/campaigns"
    );
  },

  async getCampaign(id: string) {
    return requestJson<Campaign>(`/api/campaigns/${id}`);
  },

  async createCampaign(payload: Omit<Campaign, "id">) {
    const response = await requestJson<{ campaign: Campaign }>(
      "/api/campaigns",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    return response.campaign;
  },

  async updateCampaign(id: string, payload: Partial<Campaign>) {
    return requestJson<Campaign>(`/api/campaigns/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async deleteCampaign(id: string) {
    return requestJson<{ success: boolean }>(`/api/campaigns/${id}`, {
      method: "DELETE",
    });
  },

  async executeCampaign(id: string) {
    return Promise.resolve({ success: true, executionId: `execution-${id}` });
  },

  async stopExecution(executionId: string) {
    return Promise.resolve({ success: true, executionId });
  },
};
