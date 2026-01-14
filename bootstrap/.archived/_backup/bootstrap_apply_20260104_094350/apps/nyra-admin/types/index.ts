export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: "draft" | "active" | "paused" | "completed";
  startDate: string;
  endDate?: string;
  targetAudience?: string;
  budget?: number;
  leads?: number;
  conversions?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  status: "new" | "contacted" | "qualified" | "converted" | "lost";
  source: string;
  campaignId?: string;
  campaignName?: string;
  score?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  id: string;
  leadId: string;
  amount: number;
  currency: string;
  status: "draft" | "sent" | "accepted" | "rejected";
  validUntil: string;
  items: QuoteItem[];
  createdAt: string;
  updatedAt: string;
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CampaignAnalytics {
  campaignId: string;
  totalLeads: number;
  qualifiedLeads: number;
  conversions: number;
  conversionRate: number;
  averageScore: number;
  revenueGenerated: number;
  costPerLead: number;
  roi: number;
}

export interface DashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalLeads: number;
  newLeadsToday: number;
  conversionRate: number;
  totalRevenue: number;
}
