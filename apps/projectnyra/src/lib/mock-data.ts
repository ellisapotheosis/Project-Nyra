export const mockLeads = [
  {
    id: "lead-001",
    crmRecordId: "crm-lead-001",
    firstName: "Sarah",
    lastName: "Johnson",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 555-0123",
    source: "WEBSITE_FORM",
    stage: "CONTACTED",
    status: "ACTIVE",
    campaignId: "campaign-001",
    campaignStatus: "ACTIVE",
    ownerId: "broker-001",
    leadScore: 85,
    leadGrade: "A",
    loanPurpose: "PURCHASE",
    loanAmount: 3500000,
    propertyValue: 450000,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "lead-002",
    crmRecordId: "crm-lead-002",
    firstName: "Michael",
    lastName: "Chen",
    name: "Michael Chen",
    email: "michael.chen@email.com",
    phone: "+1 555-0124",
    source: "REFERRAL",
    stage: "APPLICATION_STARTED",
    status: "PAUSED",
    campaignId: "campaign-001",
    campaignStatus: "PAUSED",
    ownerId: "broker-001",
    leadScore: 92,
    leadGrade: "A",
    loanPurpose: "REFINANCE",
    loanAmount: 5500000,
    propertyValue: 650000,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockCampaigns = [
  {
    id: "campaign-001",
    name: "New Internet Lead 30-Day Nurture",
    version: 3,
    status: "ACTIVE",
    enrolled: 142,
    loanPurpose: "PURCHASE",
    createdBy: "broker-001",
    publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockQuotes = [
  {
    id: "quote-001",
    leadId: "lead-001",
    options: [
      { name: "Lowest Payment", rate: 6.125, monthlyPayment: 2087 },
      { name: "Balanced", rate: 5.875, monthlyPayment: 2041 },
      { name: "Lowest Cost", rate: 5.625, monthlyPayment: 1994 },
    ],
    status: "SENT",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockApplications = [
  {
    id: "app-001",
    leadId: "lead-001",
    borrower: "Sarah Johnson",
    product: "30Y Fixed Conventional",
    amount: 350000,
    loanPurpose: "PURCHASE",
    status: "PROCESSING",
    milestone: "Initial underwriting",
    loanOfficer: "Ellis Andersen",
    updatedAt: new Date().toISOString(),
  },
];

export const mockWorkers = [
  {
    id: "w1",
    name: "RTX 5090",
    gpu: "NVIDIA RTX 5090",
    vram: 48,
    vramUsed: 42,
    memoryUsage: 88,
    role: "Reasoning",
    status: "online",
    utilization: 85,
  },
  {
    id: "w2",
    name: "RTX 3090 Ti",
    gpu: "NVIDIA RTX 3090 Ti",
    vram: 24,
    vramUsed: 18,
    memoryUsage: 75,
    role: "Operations",
    status: "online",
    utilization: 72,
  },
  {
    id: "w3",
    name: "RTX 3060",
    gpu: "NVIDIA RTX 3060",
    vram: 12,
    vramUsed: 5,
    memoryUsage: 42,
    role: "Lightweight",
    status: "online",
    utilization: 45,
  },
];

export const mockDashboardMetrics = {
  leadsToday: 7,
  repliesReceived: 14,
  stopRequests: 1,
  quotesGenerated: 3,
  appointmentsBooked: 2,
  estimatedPipelineValue: 2850000,
  pipelineValue: 2850000,
  monthlyRevenue: 1250000,
  activeAgents: 10,
  activeLeads: 145,
  conversionRate: 0.42,
  campaignConversionRate: 0.32,
  activeAgentSessions: 3,
  pendingApprovals: 5,
};

export const crmOverview = {
  totalLeads: 145,
  activeCampaigns: 4,
  pendingQuotes: 12,
  pipelineValue: "$2.9M",
  activeLeads: 145,
  activeApplications: 1,
  conversionRate: "42%",
  averageCycle: "14 Days",
};

export type LeadRecord = {
  id: string;
  crmRecordId?: string;
  firstName: string;
  lastName: string;
  name?: string;
  email: string;
  phone: string;
  source: string;
  stage: string;
  status?: string;
  campaignStatus: string;
  ownerId?: string;
  leadScore?: number;
  leadGrade?: string;
  loanPurpose: string;
  loanAmount: number;
  propertyValue?: number;
  campaignId?: string;
  lastTouch?: string;
  nextTouch?: string;
  location?: string;
  creditBand?: string;
  createdAt?: string;
  updatedAt: string;
};

export type ApplicationRecord = {
  id: string;
  leadId?: string;
  borrower: string;
  product: string;
  amount: number;
  loanPurpose?: string;
  status: string;
  milestone: string;
  loanOfficer: string;
  updatedAt: string;
};

// Compatibility aliases
export const leads = mockLeads;
export const campaigns = mockCampaigns;
export const applications = mockApplications;
