import { Lead } from "@/types";
import { api } from "./client";

export const leadService = {
  list: (params?: { campaignId?: string; status?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return api.get<Lead[]>(`/api/leads${query ? `?${query}` : ""}`);
  },

  get: (id: string) => api.get<Lead>(`/api/leads/${id}`),

  create: (data: Partial<Lead>) => api.post<Lead>("/api/leads", data),

  update: (id: string, data: Partial<Lead>) =>
    api.put<Lead>(`/api/leads/${id}`, data),

  delete: (id: string) => api.delete(`/api/leads/${id}`),

  assignCampaign: (leadId: string, campaignId: string) =>
    api.post(`/api/leads/${leadId}/campaign`, { campaignId }),
};
