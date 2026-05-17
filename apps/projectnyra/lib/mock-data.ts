export type LeadRecord = {
  id: string;
  name?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  campaignStatus: string;
  loanPurpose: string;
  loanAmount: number;
  campaignId: string;
  lastTouch: string;
  nextTouch: string;
  location: string;
  creditBand: string;
  source: string;
  stage: string;
};

export type ApplicationRecord = {
  id: string;
  borrower: string;
  product: string;
  amount: number;
  status: string;
  milestone: string;
  loanOfficer: string;
  updatedAt: string;
};

export type CrmOverview = {
  pipelineValue: string;
  activeLeads: number;
  activeApplications: number;
  conversionRate: string;
  averageCycle: string;
};

export const leads: LeadRecord[] = [
  {
    id: "1",
    name: "John Doe",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "(555) 010-0111",
    campaignStatus: "ACTIVE",
    loanPurpose: "Refinance",
    loanAmount: 45000000,
    campaignId: "refinance-blitz",
    lastTouch: "Today, 9:15 AM",
    nextTouch: "Today, 1:00 PM",
    location: "Boise, ID",
    creditBand: "720+",
    source: "RateHunter",
    stage: "Qualified",
  },
  {
    id: "2",
    name: "Jane Smith",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane@example.com",
    phone: "(555) 010-0222",
    campaignStatus: "PAUSED",
    loanPurpose: "Purchase",
    loanAmount: 32000000,
    campaignId: "purchase-power",
    lastTouch: "Yesterday",
    nextTouch: "Broker review required",
    location: "Spokane, WA",
    creditBand: "680-719",
    source: "Partner Agent",
    stage: "Application",
  },
  {
    id: "3",
    name: "Robert Brown",
    firstName: "Robert",
    lastName: "Brown",
    email: "robert@example.com",
    phone: "(555) 010-0333",
    campaignStatus: "ACTIVE",
    loanPurpose: "HELOC",
    loanAmount: 51000000,
    campaignId: "home-equity-pro",
    lastTouch: "May 10, 2026",
    nextTouch: "May 12, 2026",
    location: "Reno, NV",
    creditBand: "740+",
    source: "Website",
    stage: "New",
  },
];

export const campaigns = [
  { id: "1", name: "Purchase Follow-up", status: "Running", enrolled: 12 },
  { id: "2", name: "Refinance Alerts", status: "Paused", enrolled: 8 },
  { id: "3", name: "HELOC Outreach", status: "Running", enrolled: 5 },
];

export const applications: ApplicationRecord[] = [
  {
    id: "1",
    borrower: "Alice Johnson",
    product: "Conventional",
    amount: 425000,
    status: "Underwriting",
    milestone: "Conditions review",
    loanOfficer: "Ellis Andersen",
    updatedAt: "2026-05-10T15:30:00.000Z",
  },
  {
    id: "2",
    borrower: "Bob Wilson",
    product: "FHA",
    amount: 318000,
    status: "Application",
    milestone: "Document collection",
    loanOfficer: "Ellis Andersen",
    updatedAt: "2026-05-09T18:45:00.000Z",
  },
];

export const crmOverview: CrmOverview = {
  pipelineValue: "$1.28M",
  activeLeads: 25,
  activeApplications: applications.length,
  conversionRate: "34%",
  averageCycle: "18 Days",
};
