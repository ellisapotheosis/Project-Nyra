import { createClient } from "./base";

export interface CampaignTemplate {
  id: string;
  name: string;
  description?: string;
  steps: any[];
  loanPurpose?: string;
  active: boolean;
  createdAt: string;
}

export interface CampaignStats {
  id: string;
  enrolled: number;
  active: number;
  completed: number;
  stopped: number;
  replyRate: number;
}

export interface ExecutionStatus {
  id: string;
  campaignId: string;
  leadId: string;
  status: "active" | "paused" | "stopped" | "completed" | "failed";
  currentStep: number;
  nextTouchAt: string | null;
}

/**
 * Campaign Engine API Client
 */
const CAMPAIGN_ENGINE_URL =
  process.env.CAMPAIGN_ENGINE_URL || "http://localhost:8020";

const client = createClient({
  baseUrl: CAMPAIGN_ENGINE_URL,
});

export const campaignApi = {
  /**
   * List all campaign templates.
   */
  getCampaigns: () =>
    client.get<{ campaigns: CampaignTemplate[] }>("/api/campaigns"),

  /**
   * Fetch a single campaign template.
   */
  getCampaign: (id: string) =>
    client.get<CampaignTemplate>(`/api/campaigns/${id}`),

  /**
   * Create a new campaign template.
   */
  createCampaign: (data: Partial<CampaignTemplate>) =>
    client.post<CampaignTemplate>("/api/campaigns", data),

  /**
   * Update an existing campaign template.
   */
  updateCampaign: (id: string, data: Partial<CampaignTemplate>) =>
    client.put<CampaignTemplate>(`/api/campaigns/${id}`, data),

  /**
   * Delete a campaign template.
   */
  deleteCampaign: (id: string) => client.delete(`/api/campaigns/${id}`),

  /**
   * Get real-time stats for a campaign.
   */
  getCampaignStats: (id: string) =>
    client.get<CampaignStats>(`/api/campaigns/${id}/stats`),

  /**
   * Enroll a lead in a campaign and start execution.
   */
  executeCampaign: (id: string, leadId: string) =>
    client.post<ExecutionStatus>(`/api/campaigns/${id}/execute`, { leadId }),

  /**
   * List all active campaign executions.
   */
  getExecutions: () => client.get<ExecutionStatus[]>("/api/executions"),

  /**
   * Get status of a specific execution.
   */
  getExecution: (id: string) =>
    client.get<ExecutionStatus>(`/api/executions/${id}`),

  /**
   * Pause an active execution.
   */
  pauseExecution: (id: string) => client.post(`/api/executions/${id}/pause`),

  /**
   * Resume a paused execution.
   */
  resumeExecution: (id: string) => client.post(`/api/executions/${id}/resume`),

  /**
   * Stop an execution permanently.
   */
  stopExecution: (id: string) => client.post(`/api/executions/${id}/stop`),
};
