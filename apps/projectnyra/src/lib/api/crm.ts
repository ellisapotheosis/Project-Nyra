import { createClient } from "./base";
import { serviceConfig } from "./config";

export interface Lead {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  source?: string;
  loanPurpose?: string;
  loanAmount?: number;
  propertyState?: string;
  campaignStatus?: string;
  status?: string;
  createdAt?: string;
  [key: string]: any; // Allow for other fields from Twenty CRM
}

export interface ConversationLog {
  channel: string;
  direction: "inbound" | "outbound";
  content_preview: string;
  sent_at: string;
}

export interface PipelineStats {
  campaign_name: string;
  status: string;
  total: number;
  next_touch: string | null;
}

export interface Campaign {
  id: string;
  name: string;
  steps: any;
  loanPurpose: string;
  active: boolean;
}

/**
 * CRM API Client (REST boundary over Twenty CRM)
 */
const CRM_API_URL =
  typeof window === "undefined"
    ? serviceConfig.crmApiUrl || "http://localhost:4001"
    : "";
const CRM_API_KEY = serviceConfig.crmApiKey;

const client = createClient({
  baseUrl: CRM_API_URL,
  apiKey: CRM_API_KEY,
  apiKeyHeader: "x-crm-api-key",
});

export const crmApi = {
  /**
   * Fetch all mortgage leads.
   */
  getLeads: () => client.get<{ leads: Lead[] }>("/api/leads"),

  /**
   * Fetch a single lead by ID.
   */
  getLead: (id: string) => client.get<{ lead: Lead }>(`/api/leads/${id}`),

  /**
   * Fetch lead conversation history and timeline.
   */
  getLeadConversation: (id: string) =>
    client.get<{ logs: ConversationLog[]; timeline: any }>(
      `/api/leads/${id}/conversation`
    ),

  /**
   * Update lead/loan status.
   */
  updateLeadStatus: (id: string, status: string, notes?: string) =>
    client.patch(`/api/leads/${id}/status`, { status, notes }),

  /**
   * Pause/resume/stop campaign for a lead.
   */
  updateLeadCampaign: (id: string, status: string) =>
    client.patch(`/api/leads/${id}/campaign`, { status }),

  /**
   * Generate and send a quote for a lead.
   */
  createLeadQuote: (id: string, quoteData: any) =>
    client.post(`/api/leads/${id}/quote`, quoteData),

  /**
   * Get high-level pipeline status and campaign enrollment stats.
   */
  getPipeline: () =>
    client.get<{ pipeline: PipelineStats[] }>("/api/dashboard/pipeline"),

  /**
   * List all campaign templates.
   */
  getCampaigns: () => client.get<{ campaigns: Campaign[] }>("/api/campaigns"),

  /**
   * Fetch a single campaign template.
   */
  getCampaign: (id: string) =>
    client.get<{ campaign: Campaign }>(`/api/campaigns/${id}`),

  /**
   * Create a new campaign template.
   */
  createCampaign: (campaignData: Partial<Campaign>) =>
    client.post<Campaign>("/api/campaigns", campaignData),

  /**
   * Approve a pending quote.
   */
  approveQuote: (id: string, approvedBy: string) =>
    client.post(`/api/quotes/${id}/approve`, { approvedBy }),
};
