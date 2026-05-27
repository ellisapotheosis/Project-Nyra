import type { Campaign } from "./api/campaigns";
import type { ConversationLog, Lead } from "./api/crm";

export const leads: Lead[] = [
  {
    id: "lead-001",
    firstName: "Avery",
    lastName: "Stone",
    email: "avery.stone@example.com",
    phone: "+1-555-0101",
    city: "Austin",
    state: "TX",
    location: "Austin, TX",
    creditBand: "740+ prime",
    stage: "Qualified",
    score: 92,
    loanPurpose: "Purchase",
    loanAmount: 520000,
    propertyValue: 650000,
    creditScore: 742,
    annualIncome: 185000,
    campaignStatus: "ACTIVE",
    hasConsent: true,
    onDncList: false,
    source: "RateHunter",
    sourceCampaign: "Spring purchase leads",
    capturedAt: "2026-05-01T15:00:00.000Z",
    tags: ["purchase", "high-intent", "sms-ok"],
    quietHours: { start: "20:00", end: "08:00", timezone: "America/Chicago" },
  },
  {
    id: "lead-002",
    firstName: "Jordan",
    lastName: "Lee",
    email: "jordan.lee@example.com",
    phone: "+1-555-0102",
    city: "Phoenix",
    state: "AZ",
    location: "Phoenix, AZ",
    creditBand: "700+ qualified",
    stage: "New",
    score: 78,
    loanPurpose: "Refinance",
    loanAmount: 410000,
    propertyValue: 590000,
    creditScore: 705,
    annualIncome: 148000,
    campaignStatus: "PAUSED",
    hasConsent: true,
    onDncList: false,
    source: "Referral",
    sourceCampaign: "Realtor partner",
    capturedAt: "2026-05-04T18:30:00.000Z",
    tags: ["refi", "call-back"],
  },
];

export const campaigns: Campaign[] = [
  {
    id: "campaign-purchase-drip",
    name: "Mortgage Lead Drip Campaign",
    loanPurpose: "Purchase",
    active: true,
    status: "Running",
    steps: [
      { id: "step-0", day: 0, channel: "email", templateId: "welcome-quote" },
      { id: "step-1", day: 1, channel: "sms", templateId: "schedule-call" },
      { id: "step-5", day: 5, channel: "email", templateId: "rate-watch" },
    ],
  },
];

export const applications = [
  {
    id: "app-001",
    leadId: "lead-001",
    borrower: "Avery Stone",
    borrowerName: "Avery Stone",
    product: "30-year conventional purchase",
    milestone: "Conditions review",
    stage: "Processing",
    status: "active",
    amount: 520000,
    propertyAddress: "1200 Congress Ave, Austin, TX",
    closeDate: "2026-06-20",
    updatedAt: "2026-05-12T15:30:00.000Z",
  },
  {
    id: "app-002",
    leadId: "lead-002",
    borrower: "Jordan Lee",
    borrowerName: "Jordan Lee",
    product: "Rate-and-term refinance",
    milestone: "Pre-approval package",
    stage: "Pre-approval",
    status: "pending",
    amount: 410000,
    propertyAddress: "Pending property",
    closeDate: "2026-07-15",
    updatedAt: "2026-05-11T19:45:00.000Z",
  },
];

export const crmOverview = {
  pipelineValue: "$930K",
  conversionRate: "31%",
  averageCycle: "18 days",
};

export const recentActivity: ConversationLog[] = [
  {
    id: "log-001",
    channel: "email",
    direction: "outbound",
    content_preview:
      "Subject: Your mortgage options\nAvery, your quote package is ready for review.",
    sent_at: "2026-05-10T16:15:00.000Z",
    status: "delivered",
  },
  {
    id: "log-002",
    channel: "sms",
    direction: "inbound",
    content_preview: "Can we talk tomorrow morning?",
    sent_at: "2026-05-10T16:45:00.000Z",
    status: "received",
  },
];

export const conversations: Record<string, ConversationLog[]> = {
  "lead-001": recentActivity,
  "lead-002": [
    {
      id: "log-003",
      channel: "call",
      direction: "outbound",
      content_preview: "Left voicemail about refinance savings review.",
      sent_at: "2026-05-09T20:00:00.000Z",
      status: "completed",
    },
  ],
};
