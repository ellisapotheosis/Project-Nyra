import { Quote } from "@/types";
import { api } from "./client";

export const quoteService = {
  list: (leadId?: string) => {
    const query = leadId ? `?leadId=${leadId}` : "";
    return api.get<Quote[]>(`/api/quotes${query}`);
  },

  get: (id: string) => api.get<Quote>(`/api/quotes/${id}`),

  create: (data: Partial<Quote>) => api.post<Quote>("/api/quotes", data),

  update: (id: string, data: Partial<Quote>) =>
    api.put<Quote>(`/api/quotes/${id}`, data),

  delete: (id: string) => api.delete(`/api/quotes/${id}`),
};
