import { Campaign, CampaignAnalytics } from "@/types";
import { api } from "./client";

export const campaignService = {
  list: () => api.get<Campaign[]>("/api/campaigns"),

  get: (id: string) => api.get<Campaign>(`/api/campaigns/${id}`),

  create: (data: Partial<Campaign>) => api.post<Campaign>("/api/campaigns", data),

  update: (id: string, data: Partial<Campaign>) =>
    api.put<Campaign>(`/api/campaigns/${id}`, data),

  delete: (id: string) => api.delete(`/api/campaigns/${id}`),

  analytics: (id: string) =>
    api.get<CampaignAnalytics>(`/api/campaigns/${id}/analytics`),
};
