import { requestJson } from "./base";

export type Lead = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city?: string;
  state?: string;
  location?: string;
  creditBand?: string;
  stage?: string;
  score?: number;
  loanPurpose?: string;
  loanAmount: number;
  propertyValue?: number;
  creditScore?: number;
  annualIncome?: number;
  campaignStatus?: string;
  hasConsent?: boolean;
  onDncList?: boolean;
  doNotContact?: boolean;
  source?: string;
  sourceCampaign?: string;
  capturedAt?: string;
  tags?: string[];
  quietHours?: { start: string; end: string; timezone: string };
};

export type ConversationLog = {
  id: string;
  channel: "email" | "sms" | "voice" | "call" | "voicemail" | "note";
  direction: "inbound" | "outbound";
  content_preview: string;
  sent_at: string;
  status?: string;
};

export type LeadsResponse = {
  leads: Lead[];
  source?: string;
};

export type LeadResponse = {
  lead: Lead;
  source?: string;
};

export type ConversationResponse = {
  logs: ConversationLog[];
};

export const crmApi = {
  getLeads() {
    return requestJson<LeadsResponse>("/api/leads");
  },

  getLead(id: string) {
    return requestJson<LeadResponse>(`/api/leads/${id}`);
  },

  getLeadConversation(id: string) {
    return requestJson<ConversationResponse>(`/api/leads/${id}/conversation`);
  },

  updateLeadStatus(id: string, status: string) {
    return requestJson<LeadResponse>(`/api/leads/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  updateLeadCampaign(id: string, campaignStatus: string) {
    return requestJson<LeadResponse>(`/api/leads/${id}/campaign`, {
      method: "PATCH",
      body: JSON.stringify({ campaignStatus }),
    });
  },

  getPipeline() {
    return requestJson("/api/dashboard/pipeline");
  },

  approveQuote(quoteId: string, approvedBy: string) {
    return Promise.resolve({ success: true, quoteId, approvedBy });
  },
};
