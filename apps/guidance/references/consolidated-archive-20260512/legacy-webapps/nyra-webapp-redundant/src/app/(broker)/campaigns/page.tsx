'use client';

import { useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Archive,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Edit,
  Filter,
  Layers,
  MousePointerClick,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Shield,
  Target,
  TrendingUp,
  Users,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';

// ─── Types ────────────────────────────────────────────────────────────────────

type TimeRange = '1h' | '6h' | '24h' | 'all';
type CampaignStatus = 'active' | 'paused' | 'completed' | 'scheduled';
type CampaignType = 'email' | 'sms' | 'direct-mail' | 'digital' | 'multi-channel';
type AudienceSegment = 'first-time-buyers' | 'refinance' | 'jumbo' | 'va-fha' | 'high-value' | 'all';
type ComplianceStatus = 'compliant' | 'review-required' | 'non-compliant';
type AbTestStatus = 'running' | 'concluded' | 'pending';

interface SparkPoint {
  value: number;
}

interface ComplianceIndicators {
  tila: ComplianceStatus;
  respa: ComplianceStatus;
  trid: ComplianceStatus;
  lastAudit: string;
  notes: string;
}

interface AbVariant {
  id: string;
  label: string;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cvr: number;
  isWinner: boolean | null;
}

interface AbTest {
  id: string;
  name: string;
  status: AbTestStatus;
  startDate: string;
  endDate: string | null;
  metric: string;
  variants: AbVariant[];
  confidence: number;
  winner: string | null;
}

interface CreativeAsset {
  id: string;
  name: string;
  type: 'banner' | 'email-template' | 'landing-page' | 'sms-copy' | 'direct-mail';
  lastUpdated: string;
  status: 'approved' | 'pending' | 'rejected';
}

interface BudgetAllocation {
  channel: string;
  allocated: number;
  spent: number;
  color: string;
}

interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  type: CampaignType;
  audienceSegment: AudienceSegment;
  startDate: string;
  endDate: string | null;
  reach: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cvr: number;
  roi: number;
  budgetAllocated: number;
  budgetSpent: number;
  sparkline: SparkPoint[];
  compliance: ComplianceIndicators;
  abTests: AbTest[];
  creativeAssets: CreativeAsset[];
  budgetAllocation: BudgetAllocation[];
  targetAudience: {
    ageRange: string;
    incomeRange: string;
    creditScore: string;
    geography: string;
    loanType: string;
  };
  schedule: {
    frequency: string;
    sendDays: string[];
    sendTime: string;
    timezone: string;
  };
  description: string;
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const METRICS_BY_RANGE: Record<TimeRange, {
  activeCampaigns: number;
  totalReach: number;
  ctrPct: number;
  conversionRatePct: number;
}> = {
  '1h':   { activeCampaigns: 8, totalReach: 12_400,   ctrPct: 4.2,  conversionRatePct: 1.8  },
  '6h':   { activeCampaigns: 8, totalReach: 74_200,   ctrPct: 4.0,  conversionRatePct: 1.7  },
  '24h':  { activeCampaigns: 8, totalReach: 284_000,  ctrPct: 3.9,  conversionRatePct: 1.6  },
  'all':  { activeCampaigns: 8, totalReach: 1_840_000, ctrPct: 3.7,  conversionRatePct: 1.5  },
};

const CAMPAIGNS: Campaign[] = [
  {
    id: 'c-001',
    name: 'Spring Refinance Blitz',
    status: 'active',
    type: 'multi-channel',
    audienceSegment: 'refinance',
    startDate: '2026-04-01',
    endDate: '2026-06-30',
    reach: 48_200,
    impressions: 184_000,
    clicks: 7_820,
    conversions: 312,
    ctr: 4.25,
    cvr: 3.99,
    roi: 284,
    budgetAllocated: 24_000,
    budgetSpent: 14_880,
    sparkline: [
      { value: 42 }, { value: 58 }, { value: 74 }, { value: 68 }, { value: 82 },
      { value: 91 }, { value: 88 }, { value: 95 }, { value: 102 }, { value: 110 },
      { value: 98 }, { value: 118 },
    ],
    compliance: {
      tila: 'compliant',
      respa: 'compliant',
      trid: 'compliant',
      lastAudit: '2026-04-28',
      notes: 'All APR disclosures current. Fee estimates within TRID tolerance bands.',
    },
    abTests: [
      {
        id: 'ab-001',
        name: 'Subject line test — urgency vs. value',
        status: 'running',
        startDate: '2026-05-05',
        endDate: null,
        metric: 'Open Rate',
        confidence: 84,
        winner: null,
        variants: [
          { id: 'v-a', label: 'Control: "Your rate could be lower"',        impressions: 12400, clicks: 496, conversions: 19, ctr: 4.0, cvr: 3.83, isWinner: null },
          { id: 'v-b', label: 'Variant: "Rates drop Friday — lock yours"', impressions: 12200, clicks: 549, conversions: 24, ctr: 4.5, cvr: 4.37, isWinner: null },
        ],
      },
    ],
    creativeAssets: [
      { id: 'ca-001', name: 'Refinance Email Banner v3',    type: 'banner',         lastUpdated: '2026-04-12', status: 'approved' },
      { id: 'ca-002', name: 'Refinance Landing Page',       type: 'landing-page',   lastUpdated: '2026-04-08', status: 'approved' },
      { id: 'ca-003', name: 'SMS Blast Copy — Rate Alert',  type: 'sms-copy',       lastUpdated: '2026-04-15', status: 'approved' },
      { id: 'ca-004', name: 'Direct Mail Postcard Q2',      type: 'direct-mail',    lastUpdated: '2026-03-28', status: 'approved' },
    ],
    budgetAllocation: [
      { channel: 'Email',        allocated: 8000,  spent: 4940,  color: 'bg-purple-400' },
      { channel: 'SMS',          allocated: 4000,  spent: 2890,  color: 'bg-cyan-400'   },
      { channel: 'Digital Ads',  allocated: 8000,  spent: 5120,  color: 'bg-pink-400'   },
      { channel: 'Direct Mail',  allocated: 4000,  spent: 1930,  color: 'bg-amber-400'  },
    ],
    targetAudience: {
      ageRange: '35–65',
      incomeRange: '$75K–$250K',
      creditScore: '680+',
      geography: 'CA, TX, FL, NY',
      loanType: 'Conventional Refinance',
    },
    schedule: {
      frequency: 'Twice weekly',
      sendDays: ['Tuesday', 'Thursday'],
      sendTime: '10:00 AM',
      timezone: 'America/Los_Angeles',
    },
    description: 'Multi-channel spring push targeting existing homeowners who may benefit from current rate conditions. Combines email sequences, SMS alerts, digital retargeting, and direct mail postcards.',
  },
  {
    id: 'c-002',
    name: 'First-Time Buyer Education Series',
    status: 'active',
    type: 'email',
    audienceSegment: 'first-time-buyers',
    startDate: '2026-03-15',
    endDate: '2026-07-31',
    reach: 22_800,
    impressions: 91_400,
    clicks: 3_280,
    conversions: 148,
    ctr: 3.59,
    cvr: 4.51,
    roi: 192,
    budgetAllocated: 12_000,
    budgetSpent: 7_200,
    sparkline: [
      { value: 20 }, { value: 28 }, { value: 35 }, { value: 42 }, { value: 38 },
      { value: 51 }, { value: 58 }, { value: 62 }, { value: 70 }, { value: 68 },
      { value: 74 }, { value: 80 },
    ],
    compliance: {
      tila: 'compliant',
      respa: 'compliant',
      trid: 'review-required',
      lastAudit: '2026-04-14',
      notes: 'TRID: Loan Estimate template updated Mar 2026 — pending final legal sign-off on revised fee section.',
    },
    abTests: [
      {
        id: 'ab-002',
        name: 'Email sequence length — 5 vs. 8 touchpoints',
        status: 'concluded',
        startDate: '2026-03-15',
        endDate: '2026-04-12',
        metric: 'Conversion Rate',
        confidence: 96,
        winner: 'v-b',
        variants: [
          { id: 'v-a', label: '5-email drip sequence',  impressions: 5800, clicks: 186, conversions: 28, ctr: 3.21, cvr: 15.05, isWinner: false },
          { id: 'v-b', label: '8-email drip sequence',  impressions: 5800, clicks: 210, conversions: 41, ctr: 3.62, cvr: 19.52, isWinner: true  },
        ],
      },
    ],
    creativeAssets: [
      { id: 'ca-010', name: 'FTB Email Template — Module 1',  type: 'email-template', lastUpdated: '2026-03-10', status: 'approved' },
      { id: 'ca-011', name: 'FTB Email Template — Module 2',  type: 'email-template', lastUpdated: '2026-03-10', status: 'approved' },
      { id: 'ca-012', name: 'FTB Landing Page — Calculator',  type: 'landing-page',   lastUpdated: '2026-03-18', status: 'pending'  },
    ],
    budgetAllocation: [
      { channel: 'Email',        allocated: 8000,  spent: 5100,  color: 'bg-purple-400' },
      { channel: 'Content Ads',  allocated: 4000,  spent: 2100,  color: 'bg-cyan-400'   },
    ],
    targetAudience: {
      ageRange: '25–40',
      incomeRange: '$50K–$120K',
      creditScore: '620+',
      geography: 'National',
      loanType: 'FHA / Conventional Purchase',
    },
    schedule: {
      frequency: 'Weekly',
      sendDays: ['Wednesday'],
      sendTime: '9:00 AM',
      timezone: 'America/New_York',
    },
    description: 'Long-form educational email drip series walking first-time buyers through pre-approval, loan types, rate lock strategy, and closing cost preparation. Designed to nurture leads over 60–90 day decision windows.',
  },
  {
    id: 'c-003',
    name: 'Jumbo Wealth Segment Outreach',
    status: 'active',
    type: 'multi-channel',
    audienceSegment: 'jumbo',
    startDate: '2026-04-20',
    endDate: '2026-09-30',
    reach: 4_100,
    impressions: 18_400,
    clicks: 982,
    conversions: 58,
    ctr: 5.34,
    cvr: 5.91,
    roi: 412,
    budgetAllocated: 18_000,
    budgetSpent: 6_840,
    sparkline: [
      { value: 8 }, { value: 14 }, { value: 12 }, { value: 18 }, { value: 22 },
      { value: 28 }, { value: 24 }, { value: 32 }, { value: 38 }, { value: 42 },
      { value: 40 }, { value: 48 },
    ],
    compliance: {
      tila: 'compliant',
      respa: 'compliant',
      trid: 'compliant',
      lastAudit: '2026-04-22',
      notes: 'Jumbo-specific APR disclosures reviewed. Rate sheet qualified under ATR rule.',
    },
    abTests: [],
    creativeAssets: [
      { id: 'ca-020', name: 'Wealth Segment Email — Hero',    type: 'email-template', lastUpdated: '2026-04-18', status: 'approved' },
      { id: 'ca-021', name: 'Concierge Landing Page',         type: 'landing-page',   lastUpdated: '2026-04-19', status: 'approved' },
      { id: 'ca-022', name: 'Private Client Mailer',          type: 'direct-mail',    lastUpdated: '2026-04-10', status: 'approved' },
    ],
    budgetAllocation: [
      { channel: 'Direct Mail',      allocated: 8000,  spent: 3200,  color: 'bg-amber-400'  },
      { channel: 'LinkedIn Ads',     allocated: 6000,  spent: 2180,  color: 'bg-blue-400'   },
      { channel: 'Email',            allocated: 4000,  spent: 1460,  color: 'bg-purple-400' },
    ],
    targetAudience: {
      ageRange: '40–70',
      incomeRange: '$500K+',
      creditScore: '740+',
      geography: 'CA, NY, CT, MA',
      loanType: 'Jumbo / Super Jumbo',
    },
    schedule: {
      frequency: 'Bi-weekly',
      sendDays: ['Monday'],
      sendTime: '7:30 AM',
      timezone: 'America/New_York',
    },
    description: 'Concierge-positioned outreach to high-net-worth borrowers for jumbo and portfolio loan products. White-glove messaging via premium direct mail, curated LinkedIn targeting, and personalized email sequences.',
  },
  {
    id: 'c-004',
    name: 'VA / FHA Government Loan Drive',
    status: 'active',
    type: 'digital',
    audienceSegment: 'va-fha',
    startDate: '2026-05-01',
    endDate: '2026-08-31',
    reach: 31_400,
    impressions: 128_000,
    clicks: 4_608,
    conversions: 176,
    ctr: 3.60,
    cvr: 3.82,
    roi: 218,
    budgetAllocated: 16_000,
    budgetSpent: 5_120,
    sparkline: [
      { value: 30 }, { value: 40 }, { value: 55 }, { value: 48 }, { value: 60 },
      { value: 72 }, { value: 68 }, { value: 80 }, { value: 88 }, { value: 92 },
      { value: 86 }, { value: 98 },
    ],
    compliance: {
      tila: 'compliant',
      respa: 'compliant',
      trid: 'compliant',
      lastAudit: '2026-05-02',
      notes: 'VA Funding Fee disclosures current. FHA MIP calculations audited against HUD guidelines.',
    },
    abTests: [
      {
        id: 'ab-003',
        name: 'Ad creative — photo vs. illustration',
        status: 'running',
        startDate: '2026-05-03',
        endDate: null,
        metric: 'Click-Through Rate',
        confidence: 72,
        winner: null,
        variants: [
          { id: 'v-a', label: 'Photo — veteran home lifestyle',    impressions: 28400, clicks: 994, conversions: 38, ctr: 3.50, cvr: 3.82, isWinner: null },
          { id: 'v-b', label: 'Illustration — rate chart graphic', impressions: 28200, clicks: 1014, conversions: 42, ctr: 3.60, cvr: 4.14, isWinner: null },
        ],
      },
    ],
    creativeAssets: [
      { id: 'ca-030', name: 'VA Banner Ad Set (300x250, 728x90)', type: 'banner',       lastUpdated: '2026-04-29', status: 'approved' },
      { id: 'ca-031', name: 'FHA Benefits Landing Page',          type: 'landing-page', lastUpdated: '2026-04-30', status: 'approved' },
    ],
    budgetAllocation: [
      { channel: 'Google Ads',   allocated: 8000,  spent: 2640,  color: 'bg-green-400'  },
      { channel: 'Facebook Ads', allocated: 5000,  spent: 1580,  color: 'bg-blue-400'   },
      { channel: 'Display Ads',  allocated: 3000,  spent: 900,   color: 'bg-pink-400'   },
    ],
    targetAudience: {
      ageRange: '22–55',
      incomeRange: '$40K–$100K',
      creditScore: '580+',
      geography: 'National (Military Bases Priority)',
      loanType: 'VA / FHA',
    },
    schedule: {
      frequency: 'Always-on',
      sendDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      sendTime: 'Continuous',
      timezone: 'Multiple',
    },
    description: 'Digital-first awareness campaign for VA and FHA loan products targeting military personnel, veterans, and first-generation buyers. Google Ads + Facebook retargeting with geo-fenced military installation targeting.',
  },
  {
    id: 'c-005',
    name: 'Q1 Rate Drop Capture — Archived',
    status: 'completed',
    type: 'sms',
    audienceSegment: 'refinance',
    startDate: '2026-01-15',
    endDate: '2026-03-31',
    reach: 18_200,
    impressions: 18_200,
    clicks: 1_438,
    conversions: 94,
    ctr: 7.90,
    cvr: 6.54,
    roi: 338,
    budgetAllocated: 6_000,
    budgetSpent: 5_940,
    sparkline: [
      { value: 60 }, { value: 82 }, { value: 95 }, { value: 110 }, { value: 102 },
      { value: 88 }, { value: 74 }, { value: 62 }, { value: 48 }, { value: 34 },
      { value: 22 }, { value: 10 },
    ],
    compliance: {
      tila: 'compliant',
      respa: 'compliant',
      trid: 'compliant',
      lastAudit: '2026-04-02',
      notes: 'Post-campaign compliance audit passed. TCPA opt-out processing verified for all SMS sends.',
    },
    abTests: [
      {
        id: 'ab-004',
        name: 'SMS copy tone — urgent vs. informational',
        status: 'concluded',
        startDate: '2026-01-15',
        endDate: '2026-02-15',
        metric: 'Reply Rate',
        confidence: 99,
        winner: 'v-a',
        variants: [
          { id: 'v-a', label: 'Urgent: "Rates hit 2yr low — reply RATE"',     impressions: 4200, clicks: 378, conversions: 24, ctr: 9.0, cvr: 6.35, isWinner: true  },
          { id: 'v-b', label: 'Informational: "Current rates update for you"', impressions: 4200, clicks: 294, conversions: 16, ctr: 7.0, cvr: 5.44, isWinner: false },
        ],
      },
    ],
    creativeAssets: [
      { id: 'ca-040', name: 'SMS Copy Library — Q1 2026',   type: 'sms-copy',       lastUpdated: '2026-01-12', status: 'approved' },
    ],
    budgetAllocation: [
      { channel: 'SMS',          allocated: 6000,  spent: 5940,  color: 'bg-cyan-400' },
    ],
    targetAudience: {
      ageRange: '30–65',
      incomeRange: '$60K+',
      creditScore: '660+',
      geography: 'CA, TX, AZ',
      loanType: 'Conventional Refinance',
    },
    schedule: {
      frequency: 'Campaign-burst',
      sendDays: ['Monday', 'Thursday'],
      sendTime: '11:00 AM',
      timezone: 'America/Los_Angeles',
    },
    description: 'Short-burst SMS alert campaign launched to capture refinance demand during the Q1 rate dip. Deployed to opted-in existing-borrower list. Campaign concluded with strong ROI; assets archived for reuse.',
  },
  {
    id: 'c-006',
    name: 'High-Value Pipeline Nurture',
    status: 'paused',
    type: 'email',
    audienceSegment: 'high-value',
    startDate: '2026-04-10',
    endDate: '2026-12-31',
    reach: 3_800,
    impressions: 22_400,
    clicks: 1_120,
    conversions: 62,
    ctr: 5.00,
    cvr: 5.54,
    roi: 0,
    budgetAllocated: 9_600,
    budgetSpent: 2_880,
    sparkline: [
      { value: 18 }, { value: 24 }, { value: 31 }, { value: 28 }, { value: 35 },
      { value: 40 }, { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 },
      { value: 0 }, { value: 0 },
    ],
    compliance: {
      tila: 'compliant',
      respa: 'review-required',
      trid: 'compliant',
      lastAudit: '2026-04-09',
      notes: 'RESPA: Affiliate compensation disclosure template under review by legal. Campaign paused pending clearance.',
    },
    abTests: [],
    creativeAssets: [
      { id: 'ca-050', name: 'VIP Email Template — Relationship',    type: 'email-template', lastUpdated: '2026-04-08', status: 'approved' },
      { id: 'ca-051', name: 'VIP Landing Page — Private Consult',   type: 'landing-page',   lastUpdated: '2026-04-07', status: 'approved' },
    ],
    budgetAllocation: [
      { channel: 'Email',        allocated: 6000,  spent: 1800,  color: 'bg-purple-400' },
      { channel: 'CRM Outreach', allocated: 3600,  spent: 1080,  color: 'bg-cyan-400'   },
    ],
    targetAudience: {
      ageRange: '38–60',
      incomeRange: '$200K+',
      creditScore: '720+',
      geography: 'CA, NY, MA',
      loanType: 'Jumbo / Portfolio',
    },
    schedule: {
      frequency: 'Monthly',
      sendDays: ['First Monday of month'],
      sendTime: '8:00 AM',
      timezone: 'America/New_York',
    },
    description: 'Personalized nurture sequence for high-value pipeline leads (loan amounts >$1M). Paused pending legal review of RESPA affiliate disclosure language update.',
  },
  {
    id: 'c-007',
    name: 'Q3 Purchase Season Launch',
    status: 'scheduled',
    type: 'multi-channel',
    audienceSegment: 'first-time-buyers',
    startDate: '2026-07-01',
    endDate: '2026-09-30',
    reach: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    ctr: 0,
    cvr: 0,
    roi: 0,
    budgetAllocated: 32_000,
    budgetSpent: 0,
    sparkline: [
      { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 },
      { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 },
      { value: 0 }, { value: 0 },
    ],
    compliance: {
      tila: 'compliant',
      respa: 'compliant',
      trid: 'compliant',
      lastAudit: '2026-05-10',
      notes: 'Pre-launch compliance review completed. Rate sheet templates approved for Q3 product lineup.',
    },
    abTests: [],
    creativeAssets: [
      { id: 'ca-060', name: 'Q3 Creative Brief — In Review',    type: 'email-template', lastUpdated: '2026-05-08', status: 'pending' },
      { id: 'ca-061', name: 'Q3 Landing Page — Draft',          type: 'landing-page',   lastUpdated: '2026-05-09', status: 'pending' },
    ],
    budgetAllocation: [
      { channel: 'Email',        allocated: 10000, spent: 0,     color: 'bg-purple-400' },
      { channel: 'SMS',          allocated: 6000,  spent: 0,     color: 'bg-cyan-400'   },
      { channel: 'Digital Ads',  allocated: 12000, spent: 0,     color: 'bg-pink-400'   },
      { channel: 'Direct Mail',  allocated: 4000,  spent: 0,     color: 'bg-amber-400'  },
    ],
    targetAudience: {
      ageRange: '25–45',
      incomeRange: '$55K–$150K',
      creditScore: '640+',
      geography: 'Top 30 MSAs',
      loanType: 'Conventional / FHA Purchase',
    },
    schedule: {
      frequency: 'Weekly',
      sendDays: ['Tuesday', 'Thursday'],
      sendTime: '10:00 AM',
      timezone: 'America/Chicago',
    },
    description: 'Planned Q3 purchase season campaign aligned with peak homebuying months. Full multi-channel deployment targeting prospective purchase borrowers in the 30 largest metropolitan areas.',
  },
  {
    id: 'c-008',
    name: 'ARM-to-Fixed Conversion Push',
    status: 'active',
    type: 'email',
    audienceSegment: 'refinance',
    startDate: '2026-05-05',
    endDate: '2026-07-31',
    reach: 8_400,
    impressions: 42_000,
    clicks: 1_890,
    conversions: 84,
    ctr: 4.50,
    cvr: 4.44,
    roi: 198,
    budgetAllocated: 8_000,
    budgetSpent: 2_640,
    sparkline: [
      { value: 0 }, { value: 12 }, { value: 28 }, { value: 42 }, { value: 58 },
      { value: 52 }, { value: 68 }, { value: 75 }, { value: 82 }, { value: 88 },
      { value: 84 }, { value: 94 },
    ],
    compliance: {
      tila: 'compliant',
      respa: 'compliant',
      trid: 'compliant',
      lastAudit: '2026-05-06',
      notes: 'ARM disclosure requirements satisfied. Rate adjustment notification templates comply with Regulation Z.',
    },
    abTests: [],
    creativeAssets: [
      { id: 'ca-070', name: 'ARM-to-Fixed Email — Sequence A',  type: 'email-template', lastUpdated: '2026-05-03', status: 'approved' },
      { id: 'ca-071', name: 'Rate Comparison Landing Page',     type: 'landing-page',   lastUpdated: '2026-05-04', status: 'approved' },
    ],
    budgetAllocation: [
      { channel: 'Email',   allocated: 8000, spent: 2640, color: 'bg-purple-400' },
    ],
    targetAudience: {
      ageRange: '30–60',
      incomeRange: '$80K+',
      creditScore: '680+',
      geography: 'CA, FL, TX, CO',
      loanType: 'ARM Refinance → Fixed',
    },
    schedule: {
      frequency: 'Weekly',
      sendDays: ['Tuesday'],
      sendTime: '9:00 AM',
      timezone: 'America/Los_Angeles',
    },
    description: 'Targeted email sequence to existing ARM borrowers approaching rate adjustment windows, positioning conversion to fixed-rate products. Personalized rate comparison data in each send.',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
}

function getCampaignStatusColors(status: CampaignStatus) {
  switch (status) {
    case 'active':    return { badge: 'bg-green-500/10 text-green-400 border-green-500/30',   dot: 'bg-green-400 animate-pulse',  text: 'text-green-400'  };
    case 'paused':    return { badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-400',               text: 'text-yellow-400' };
    case 'completed': return { badge: 'bg-slate-500/10 text-slate-400 border-slate-500/30',    dot: 'bg-slate-500',                text: 'text-slate-400'  };
    case 'scheduled': return { badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30',       dot: 'bg-blue-400',                 text: 'text-blue-400'   };
  }
}

function getCampaignStatusIcon(status: CampaignStatus) {
  switch (status) {
    case 'active':    return <Activity size={13} className="text-green-400" />;
    case 'paused':    return <Pause    size={13} className="text-yellow-400" />;
    case 'completed': return <CheckCircle2 size={13} className="text-slate-400" />;
    case 'scheduled': return <Clock    size={13} className="text-blue-400" />;
  }
}

function getComplianceColors(status: ComplianceStatus) {
  switch (status) {
    case 'compliant':       return { badge: 'bg-green-500/10 text-green-400 border-green-500/30',   dot: 'bg-green-400',   icon: <CheckCircle2 size={11} className="text-green-400" /> };
    case 'review-required': return { badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-400 animate-pulse', icon: <AlertTriangle size={11} className="text-yellow-400" /> };
    case 'non-compliant':   return { badge: 'bg-red-500/10 text-red-400 border-red-500/30',          dot: 'bg-red-400 animate-pulse',    icon: <XCircle size={11} className="text-red-400" /> };
  }
}

function getTypeColors(type: CampaignType): string {
  switch (type) {
    case 'email':         return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    case 'sms':           return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    case 'direct-mail':   return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'digital':       return 'bg-pink-500/10 text-pink-400 border-pink-500/30';
    case 'multi-channel': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
  }
}

function getAbTestStatusColors(status: AbTestStatus) {
  switch (status) {
    case 'running':   return 'bg-green-500/10 text-green-400 border-green-500/30';
    case 'concluded': return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    case 'pending':   return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
  }
}

function getAssetStatusColors(status: CreativeAsset['status']): string {
  switch (status) {
    case 'approved': return 'bg-green-500/10 text-green-400 border-green-500/30';
    case 'pending':  return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/30';
  }
}

function hasComplianceIssue(c: ComplianceIndicators): boolean {
  return c.tila !== 'compliant' || c.respa !== 'compliant' || c.trid !== 'compliant';
}

// SVG sparkline (line chart)
function Sparkline({ points, color = '#a855f7' }: { points: SparkPoint[]; color?: string }) {
  if (points.length < 2) return <div className="h-10 w-full bg-slate-800/40 rounded" />;
  const values = points.map((p) => p.value);
  const max = Math.max(...values, 1);
  const w = 100;
  const h = 40;
  const pad = 2;
  const coords = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = h - pad - (v / max) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const areaCoords = [
    `${pad},${h - pad}`,
    ...coords,
    `${(w - pad).toFixed(1)},${h - pad}`,
  ].join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-10" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={areaCoords}
        fill={`url(#sg-${color.replace('#', '')})`}
      />
      <polyline
        points={coords.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function CampaignsPage() {
  const [timeRange, setTimeRange]           = useState<TimeRange>('24h');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [filterStatus, setFilterStatus]     = useState<CampaignStatus | 'all'>('all');
  const [filterType, setFilterType]         = useState<CampaignType | 'all'>('all');
  const [filterSegment, setFilterSegment]   = useState<AudienceSegment | 'all'>('all');
  const [showFilters, setShowFilters]       = useState(false);
  // Simulate action state per campaign: record of campaignId → status override
  const [actionStates, setActionStates]     = useState<Record<string, CampaignStatus>>({});

  const metrics = METRICS_BY_RANGE[timeRange];

  // Apply action overrides
  const effectiveCampaigns = CAMPAIGNS.map((c) =>
    actionStates[c.id] ? { ...c, status: actionStates[c.id] } : c
  );

  // Status breakdown counts
  const activeCt    = effectiveCampaigns.filter((c) => c.status === 'active').length;
  const pausedCt    = effectiveCampaigns.filter((c) => c.status === 'paused').length;
  const completedCt = effectiveCampaigns.filter((c) => c.status === 'completed').length;
  const scheduledCt = effectiveCampaigns.filter((c) => c.status === 'scheduled').length;

  // Filter
  const filteredCampaigns = effectiveCampaigns.filter((c) => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (filterType !== 'all' && c.type !== filterType) return false;
    if (filterSegment !== 'all' && c.audienceSegment !== filterSegment) return false;
    return true;
  });

  // Campaign actions
  function handleAction(id: string, action: 'launch' | 'pause' | 'archive' | 'duplicate') {
    if (action === 'duplicate') return; // no-op visual only
    setActionStates((prev) => {
      let next: CampaignStatus = effectiveCampaigns.find((c) => c.id === id)?.status ?? 'paused';
      if (action === 'launch')  next = 'active';
      if (action === 'pause')   next = 'paused';
      if (action === 'archive') next = 'completed';
      return { ...prev, [id]: next };
    });
  }

  const effectiveSelected = selectedCampaign
    ? effectiveCampaigns.find((c) => c.id === selectedCampaign.id) ?? selectedCampaign
    : null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Campaigns"
        subtitle="Campaign Analytics & Management — Reach, Performance, Compliance & A/B Testing"
      />

      {/* ── Time Range + Actions ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          {(['1h', '6h', '24h', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded text-sm font-medium transition ${
                timeRange === range
                  ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                  : 'bg-gray-500/10 text-gray-400 border border-gray-500/20 hover:border-gray-500/30'
              }`}
            >
              {range === 'all' ? 'ALL TIME' : range.toUpperCase()}
            </button>
          ))}
        </div>
        <button
          className="flex items-center gap-1.5 px-3 py-2 rounded border border-green-500/40 bg-green-500/10 text-green-400 text-sm font-medium hover:border-green-500/60 hover:bg-green-500/20 transition"
        >
          <Plus size={14} /> New Campaign
        </button>
      </div>

      {/* ── Metrics Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <Activity size={14} /> Active Campaigns
            </p>
            <p className="text-2xl font-bold text-green-400">{metrics.activeCampaigns}</p>
            <p className="text-xs text-slate-400 mt-1">{pausedCt} paused · {scheduledCt} scheduled</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <Users size={14} /> Total Reach
            </p>
            <p className="text-2xl font-bold text-cyan-400">{formatNumber(metrics.totalReach)}</p>
            <p className="text-xs text-slate-400 mt-1">unique recipients in {timeRange === 'all' ? 'all time' : `last ${timeRange}`}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <MousePointerClick size={14} /> Click-Through Rate
            </p>
            <p className="text-2xl font-bold text-purple-400">{metrics.ctrPct}%</p>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-400 h-1.5 rounded-full"
                style={{ width: `${Math.min(metrics.ctrPct * 10, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <TrendingUp size={14} /> Conversion Rate
            </p>
            <p className="text-2xl font-bold text-pink-400">{metrics.conversionRatePct}%</p>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
              <div
                className="bg-gradient-to-r from-pink-500 to-rose-400 h-1.5 rounded-full"
                style={{ width: `${Math.min(metrics.conversionRatePct * 20, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Status Breakdown ─────────────────────────────────────────────────── */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              <BarChart3 size={16} className="text-purple-400" /> Campaign Status Breakdown
            </p>
            <div className="flex items-center gap-6 flex-wrap">
              {(
                [
                  { label: 'Active',    count: activeCt,    color: 'text-green-400',  dot: 'bg-green-400'  },
                  { label: 'Paused',    count: pausedCt,    color: 'text-yellow-400', dot: 'bg-yellow-400' },
                  { label: 'Completed', count: completedCt, color: 'text-slate-400',  dot: 'bg-slate-500'  },
                  { label: 'Scheduled', count: scheduledCt, color: 'text-blue-400',   dot: 'bg-blue-400'   },
                ] as const
              ).map(({ label, count, color, dot }) => (
                <div key={label} className="flex items-center gap-2 text-sm">
                  <span className={`h-2 w-2 rounded-full ${dot}`} />
                  <span className="text-slate-400">{label}:</span>
                  <span className={`font-bold ${color}`}>{count}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Activity size={11} className="text-purple-400 animate-pulse" />
                Live
              </div>
            </div>
          </div>

          {/* Status progress bar */}
          <div className="mt-4 h-2 rounded-full overflow-hidden flex">
            {activeCt > 0    && <div className="bg-green-500  transition-all" style={{ width: `${(activeCt    / CAMPAIGNS.length) * 100}%` }} />}
            {pausedCt > 0    && <div className="bg-yellow-500 transition-all" style={{ width: `${(pausedCt    / CAMPAIGNS.length) * 100}%` }} />}
            {completedCt > 0 && <div className="bg-slate-600  transition-all" style={{ width: `${(completedCt / CAMPAIGNS.length) * 100}%` }} />}
            {scheduledCt > 0 && <div className="bg-blue-500   transition-all" style={{ width: `${(scheduledCt / CAMPAIGNS.length) * 100}%` }} />}
          </div>
        </CardContent>
      </Card>

      {/* ── Filters ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setShowFilters((p) => !p)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded border text-sm font-medium transition ${
            showFilters
              ? 'border-purple-500/50 bg-purple-500/10 text-purple-300'
              : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600'
          }`}
        >
          <Filter size={14} /> Filters
          <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {/* Active filter chips */}
        {filterStatus !== 'all' && (
          <span className="flex items-center gap-1 px-2 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-xs text-purple-300">
            Status: {filterStatus}
            <button onClick={() => setFilterStatus('all')} className="ml-1 hover:text-red-400 transition"><X size={10} /></button>
          </span>
        )}
        {filterType !== 'all' && (
          <span className="flex items-center gap-1 px-2 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-xs text-purple-300">
            Type: {filterType}
            <button onClick={() => setFilterType('all')} className="ml-1 hover:text-red-400 transition"><X size={10} /></button>
          </span>
        )}
        {filterSegment !== 'all' && (
          <span className="flex items-center gap-1 px-2 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-xs text-purple-300">
            Segment: {filterSegment}
            <button onClick={() => setFilterSegment('all')} className="ml-1 hover:text-red-400 transition"><X size={10} /></button>
          </span>
        )}

        <span className="text-xs text-slate-500">{filteredCampaigns.length} of {CAMPAIGNS.length} campaigns</span>
      </div>

      {showFilters && (
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Status filter */}
              <div>
                <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">By Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {(['all', 'active', 'paused', 'completed', 'scheduled'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`px-2.5 py-1 rounded text-xs font-medium border transition capitalize ${
                        filterStatus === s
                          ? 'border-purple-500/50 bg-purple-500/20 text-purple-300'
                          : 'border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {s === 'all' ? 'All' : s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type filter */}
              <div>
                <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">By Type</p>
                <div className="flex flex-wrap gap-1.5">
                  {(['all', 'email', 'sms', 'digital', 'direct-mail', 'multi-channel'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={`px-2.5 py-1 rounded text-xs font-medium border transition capitalize ${
                        filterType === t
                          ? 'border-purple-500/50 bg-purple-500/20 text-purple-300'
                          : 'border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {t === 'all' ? 'All' : t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Segment filter */}
              <div>
                <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">By Audience</p>
                <div className="flex flex-wrap gap-1.5">
                  {(['all', 'first-time-buyers', 'refinance', 'jumbo', 'va-fha', 'high-value'] as const).map((seg) => (
                    <button
                      key={seg}
                      onClick={() => setFilterSegment(seg)}
                      className={`px-2.5 py-1 rounded text-xs font-medium border transition capitalize ${
                        filterSegment === seg
                          ? 'border-purple-500/50 bg-purple-500/20 text-purple-300'
                          : 'border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {seg === 'all' ? 'All' : seg.replace(/-/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Campaign List ─────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2 uppercase tracking-wide">
          <Layers size={14} /> Campaigns
        </h2>
        <div className="space-y-3">
          {filteredCampaigns.map((campaign) => {
            const sc = getCampaignStatusColors(campaign.status);
            const budgetPct = campaign.budgetAllocated > 0
              ? Math.round((campaign.budgetSpent / campaign.budgetAllocated) * 100)
              : 0;
            const complianceIssue = hasComplianceIssue(campaign.compliance);
            const sparkColor =
              campaign.status === 'active'    ? '#a855f7' :
              campaign.status === 'paused'    ? '#eab308' :
              campaign.status === 'completed' ? '#64748b' : '#3b82f6';

            return (
              <button
                key={campaign.id}
                onClick={() => setSelectedCampaign(campaign)}
                className="w-full text-left p-5 rounded border border-slate-800 hover:border-purple-500/40 hover:bg-purple-500/5 transition group bg-card/30 backdrop-blur-sm"
              >
                <div className="flex items-start gap-4 flex-wrap">
                  {/* Left: name + badges */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full flex-shrink-0 ${sc.dot}`} />
                        <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition">{campaign.name}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded border font-medium capitalize ${sc.badge}`}>
                        {campaign.status}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded border font-medium capitalize ${getTypeColors(campaign.type)}`}>
                        {campaign.type.replace(/-/g, ' ')}
                      </span>
                      {complianceIssue && (
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded border font-medium bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                          <AlertTriangle size={10} /> Compliance Review
                        </span>
                      )}
                    </div>

                    {/* Dates + segment */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock size={10} /> {campaign.startDate}
                        {campaign.endDate ? ` → ${campaign.endDate}` : ' → ongoing'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target size={10} /> {campaign.audienceSegment.replace(/-/g, ' ')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={10} /> {formatNumber(campaign.reach)} reach
                      </span>
                    </div>

                    {/* Performance metrics row */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-3">
                      {[
                        { label: 'Impressions', value: formatNumber(campaign.impressions), color: 'text-slate-300' },
                        { label: 'Clicks',      value: formatNumber(campaign.clicks),      color: 'text-cyan-400'  },
                        { label: 'Conversions', value: formatNumber(campaign.conversions), color: 'text-green-400' },
                        { label: 'CTR',         value: campaign.status === 'scheduled' ? '—' : `${campaign.ctr}%`, color: 'text-purple-400' },
                        { label: 'CVR',         value: campaign.status === 'scheduled' ? '—' : `${campaign.cvr}%`, color: 'text-pink-400'   },
                        { label: 'ROI',         value: campaign.status === 'scheduled' ? '—' : `${campaign.roi}%`, color: campaign.roi >= 200 ? 'text-green-400' : campaign.roi >= 100 ? 'text-yellow-400' : 'text-slate-400' },
                      ].map(({ label, value, color }) => (
                        <div key={label}>
                          <p className="text-xs text-slate-500">{label}</p>
                          <p className={`text-sm font-bold ${color}`}>{value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Budget bar */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-500">Budget</span>
                        <span className="text-slate-300">
                          {formatCurrency(campaign.budgetSpent)} / {formatCurrency(campaign.budgetAllocated)}
                          <span className="text-slate-500 ml-1">({budgetPct}%)</span>
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r transition-all ${
                            budgetPct >= 90 ? 'from-red-500 to-rose-400' :
                            budgetPct >= 75 ? 'from-orange-500 to-amber-400' :
                            'from-purple-500 to-pink-400'
                          }`}
                          style={{ width: `${budgetPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right: sparkline + compliance + actions */}
                  <div className="flex flex-col gap-3 flex-shrink-0 w-48">
                    {/* Sparkline */}
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Performance trend</p>
                      <Sparkline points={campaign.sparkline} color={sparkColor} />
                    </div>

                    {/* Compliance indicators */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(['tila', 'respa', 'trid'] as const).map((reg) => {
                        const cc = getComplianceColors(campaign.compliance[reg]);
                        return (
                          <span
                            key={reg}
                            className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border font-mono font-semibold uppercase ${cc.badge}`}
                          >
                            {cc.icon} {reg}
                          </span>
                        );
                      })}
                    </div>

                    {/* Quick actions */}
                    <div className="flex items-center gap-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
                      {(campaign.status === 'paused' || campaign.status === 'scheduled') && (
                        <button
                          onClick={() => handleAction(campaign.id, 'launch')}
                          className="flex items-center gap-1 px-2 py-1 rounded border border-green-500/40 bg-green-500/10 text-green-400 text-xs hover:bg-green-500/20 transition"
                        >
                          <Play size={10} /> Launch
                        </button>
                      )}
                      {campaign.status === 'active' && (
                        <button
                          onClick={() => handleAction(campaign.id, 'pause')}
                          className="flex items-center gap-1 px-2 py-1 rounded border border-yellow-500/40 bg-yellow-500/10 text-yellow-400 text-xs hover:bg-yellow-500/20 transition"
                        >
                          <Pause size={10} /> Pause
                        </button>
                      )}
                      <button
                        onClick={() => handleAction(campaign.id, 'duplicate')}
                        className="flex items-center gap-1 px-2 py-1 rounded border border-slate-700 bg-slate-800/40 text-slate-400 text-xs hover:border-slate-600 transition"
                      >
                        <Copy size={10} /> Dupe
                      </button>
                      {campaign.status !== 'completed' && (
                        <button
                          onClick={() => handleAction(campaign.id, 'archive')}
                          className="flex items-center gap-1 px-2 py-1 rounded border border-slate-700 bg-slate-800/40 text-slate-400 text-xs hover:border-red-500/40 hover:text-red-400 transition"
                        >
                          <Archive size={10} /> Archive
                        </button>
                      )}
                      <ChevronRight size={12} className="text-slate-600 group-hover:text-cyan-400 transition ml-auto" />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}

          {filteredCampaigns.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Filter size={28} className="text-slate-600 mb-3" />
              <p className="text-sm text-slate-400 font-semibold">No campaigns match current filters</p>
              <p className="text-xs text-slate-500 mt-1">Adjust status, type, or audience filters above</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Campaign Detail Modal ─────────────────────────────────────────────── */}
      {effectiveSelected && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCampaign(null)}
        >
          <div
            className="bg-black border border-purple-500/30 rounded-lg max-w-3xl w-full max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 flex items-start justify-between p-6 border-b border-purple-500/20 bg-black/90 backdrop-blur z-10">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2 rounded border flex-shrink-0 ${getCampaignStatusColors(effectiveSelected.status).badge}`}>
                  {getCampaignStatusIcon(effectiveSelected.status)}
                </div>
                <div className="min-w-0">
                  <h2 className="text-white font-bold text-base truncate">{effectiveSelected.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <p className="text-xs text-slate-500">{effectiveSelected.id}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded border font-medium capitalize ${getTypeColors(effectiveSelected.type)}`}>
                      {effectiveSelected.type.replace(/-/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                {/* Modal-level actions */}
                {effectiveSelected.status !== 'active' && effectiveSelected.status !== 'completed' && (
                  <button
                    onClick={() => handleAction(effectiveSelected.id, 'launch')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-green-500/40 bg-green-500/10 text-green-400 text-xs font-medium hover:bg-green-500/20 transition"
                  >
                    <Play size={12} /> Launch
                  </button>
                )}
                {effectiveSelected.status === 'active' && (
                  <button
                    onClick={() => handleAction(effectiveSelected.id, 'pause')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-yellow-500/40 bg-yellow-500/10 text-yellow-400 text-xs font-medium hover:bg-yellow-500/20 transition"
                  >
                    <Pause size={12} /> Pause
                  </button>
                )}
                <button
                  onClick={() => handleAction(effectiveSelected.id, 'duplicate')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-700 bg-slate-800/40 text-slate-400 text-xs font-medium hover:border-slate-600 transition"
                >
                  <Copy size={12} /> Duplicate
                </button>
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 text-xs font-medium hover:bg-cyan-500/20 transition"
                >
                  <Edit size={12} /> Edit
                </button>
                <button
                  onClick={() => setSelectedCampaign(null)}
                  className="p-1.5 hover:bg-red-500/20 rounded transition"
                >
                  <X size={18} className="text-red-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-7">

              {/* ── Description ── */}
              <div>
                <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Description</p>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 border border-slate-800 rounded p-3">
                  {effectiveSelected.description}
                </p>
              </div>

              {/* ── Performance Analytics ── */}
              <div>
                <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 size={12} /> Performance Analytics
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Impressions',  value: formatNumber(effectiveSelected.impressions), color: 'text-slate-300'  },
                    { label: 'Clicks',       value: formatNumber(effectiveSelected.clicks),      color: 'text-cyan-400'   },
                    { label: 'Conversions',  value: formatNumber(effectiveSelected.conversions), color: 'text-green-400'  },
                    { label: 'Reach',        value: formatNumber(effectiveSelected.reach),       color: 'text-blue-400'   },
                    { label: 'CTR',          value: effectiveSelected.status === 'scheduled' ? '—' : `${effectiveSelected.ctr}%`,  color: 'text-purple-400' },
                    { label: 'CVR',          value: effectiveSelected.status === 'scheduled' ? '—' : `${effectiveSelected.cvr}%`,  color: 'text-pink-400'   },
                    { label: 'ROI',          value: effectiveSelected.status === 'scheduled' ? '—' : `${effectiveSelected.roi}%`,  color: effectiveSelected.roi >= 200 ? 'text-green-400' : effectiveSelected.roi >= 100 ? 'text-yellow-400' : 'text-slate-400' },
                    { label: 'Budget Spent', value: formatCurrency(effectiveSelected.budgetSpent), color: 'text-orange-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="p-3 rounded border border-slate-800 text-center">
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className={`text-lg font-bold ${color} mt-0.5`}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Sparkline in modal */}
                <div className="p-4 rounded border border-slate-800">
                  <p className="text-xs text-slate-500 mb-2">Click volume trend</p>
                  <Sparkline
                    points={effectiveSelected.sparkline}
                    color={
                      effectiveSelected.status === 'active'    ? '#a855f7' :
                      effectiveSelected.status === 'paused'    ? '#eab308' :
                      effectiveSelected.status === 'completed' ? '#64748b' : '#3b82f6'
                    }
                  />
                </div>
              </div>

              {/* ── Audience Targeting ── */}
              <div>
                <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                  <Target size={12} /> Audience Targeting
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(effectiveSelected.targetAudience).map(([key, value]) => (
                    <div key={key} className="p-3 rounded border border-slate-800">
                      <p className="text-xs text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                      <p className="text-sm font-semibold text-white mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Schedule ── */}
              <div>
                <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={12} /> Schedule
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded border border-slate-800">
                    <p className="text-xs text-slate-500">Frequency</p>
                    <p className="text-sm font-semibold text-white mt-0.5">{effectiveSelected.schedule.frequency}</p>
                  </div>
                  <div className="p-3 rounded border border-slate-800">
                    <p className="text-xs text-slate-500">Send Days</p>
                    <p className="text-sm font-semibold text-white mt-0.5">{effectiveSelected.schedule.sendDays.join(', ')}</p>
                  </div>
                  <div className="p-3 rounded border border-slate-800">
                    <p className="text-xs text-slate-500">Send Time</p>
                    <p className="text-sm font-semibold text-white mt-0.5">{effectiveSelected.schedule.sendTime}</p>
                  </div>
                  <div className="p-3 rounded border border-slate-800">
                    <p className="text-xs text-slate-500">Timezone</p>
                    <p className="text-sm font-semibold text-white mt-0.5">{effectiveSelected.schedule.timezone}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                  <span>Start: <span className="text-slate-300">{effectiveSelected.startDate}</span></span>
                  <span>End: <span className="text-slate-300">{effectiveSelected.endDate ?? 'Ongoing'}</span></span>
                </div>
              </div>

              {/* ── Budget Allocation ── */}
              <div>
                <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap size={12} /> Budget Allocation
                </p>
                <div className="space-y-3">
                  {effectiveSelected.budgetAllocation.map((ba) => {
                    const pct = ba.allocated > 0 ? Math.round((ba.spent / ba.allocated) * 100) : 0;
                    return (
                      <div key={ba.channel}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${ba.color}`} />
                            <span className="text-slate-300">{ba.channel}</span>
                          </span>
                          <span className="text-slate-400">
                            {formatCurrency(ba.spent)} / {formatCurrency(ba.allocated)}
                            <span className="text-slate-600 ml-1">({pct}%)</span>
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${
                              pct >= 90 ? 'from-red-500 to-rose-400' :
                              pct >= 75 ? 'from-orange-500 to-amber-400' :
                              'from-purple-500 to-pink-400'
                            } transition-all`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {/* Total */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-sm">
                    <span className="text-slate-400 font-medium">Total</span>
                    <span className="font-bold text-white">
                      {formatCurrency(effectiveSelected.budgetSpent)} / {formatCurrency(effectiveSelected.budgetAllocated)}
                      <span className="text-slate-500 text-xs ml-2">
                        ({effectiveSelected.budgetAllocated > 0 ? Math.round((effectiveSelected.budgetSpent / effectiveSelected.budgetAllocated) * 100) : 0}%)
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Compliance Indicators ── */}
              <div>
                <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield size={12} /> Compliance Indicators
                </p>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {(['tila', 'respa', 'trid'] as const).map((reg) => {
                    const cc = getComplianceColors(effectiveSelected.compliance[reg]);
                    return (
                      <div key={reg} className={`p-3 rounded border text-center ${cc.badge}`}>
                        <p className="text-xs font-mono font-bold uppercase mb-1">{reg}</p>
                        <div className="flex items-center justify-center gap-1.5">
                          {cc.icon}
                          <span className="text-xs capitalize">{effectiveSelected.compliance[reg].replace(/-/g, ' ')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="p-3 rounded border border-slate-800 bg-slate-900/30">
                  <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                    <p className="text-xs text-slate-500">Compliance Notes</p>
                    <p className="text-xs text-slate-600">Last audit: {effectiveSelected.compliance.lastAudit}</p>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{effectiveSelected.compliance.notes}</p>
                </div>
              </div>

              {/* ── Creative Assets ── */}
              <div>
                <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers size={12} /> Creative Assets
                </p>
                {effectiveSelected.creativeAssets.length === 0 ? (
                  <div className="p-4 rounded border border-slate-800 text-slate-500 text-sm italic text-center">No creative assets</div>
                ) : (
                  <div className="space-y-2">
                    {effectiveSelected.creativeAssets.map((asset) => (
                      <div
                        key={asset.id}
                        className="flex items-center gap-3 p-3 rounded border border-slate-800 hover:border-slate-700 transition"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white">{asset.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5 capitalize">{asset.type.replace(/-/g, ' ')} · Updated {asset.lastUpdated}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded border font-medium capitalize ${getAssetStatusColors(asset.status)}`}>
                          {asset.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── A/B Tests ── */}
              <div>
                <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                  <RefreshCw size={12} /> A/B Testing
                </p>
                {effectiveSelected.abTests.length === 0 ? (
                  <div className="p-4 rounded border border-slate-800 text-slate-500 text-sm italic text-center">No A/B tests for this campaign</div>
                ) : (
                  <div className="space-y-4">
                    {effectiveSelected.abTests.map((test) => (
                      <div key={test.id} className="p-4 rounded border border-slate-800">
                        {/* Test header */}
                        <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                          <div>
                            <p className="text-sm font-semibold text-white">{test.name}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-slate-500">
                              <span>Metric: <span className="text-slate-300">{test.metric}</span></span>
                              <span>Started: {test.startDate}</span>
                              {test.endDate && <span>Ended: {test.endDate}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-xs px-2 py-0.5 rounded border font-medium capitalize ${getAbTestStatusColors(test.status)}`}>
                              {test.status}
                            </span>
                            <span className={`text-xs font-bold ${test.confidence >= 95 ? 'text-green-400' : test.confidence >= 80 ? 'text-yellow-400' : 'text-slate-400'}`}>
                              {test.confidence}% conf.
                            </span>
                          </div>
                        </div>

                        {/* Variant comparison */}
                        <div className="space-y-2">
                          {test.variants.map((v) => {
                            const isWinner = test.winner === v.id;
                            return (
                              <div
                                key={v.id}
                                className={`p-3 rounded border transition ${
                                  isWinner
                                    ? 'border-green-500/40 bg-green-500/5'
                                    : v.isWinner === false
                                    ? 'border-slate-700/50 bg-slate-900/20 opacity-60'
                                    : 'border-slate-700 bg-slate-900/20'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                                  <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                                    {isWinner && <CheckCircle2 size={12} className="text-green-400" />}
                                    {v.label}
                                  </p>
                                  {isWinner && (
                                    <span className="text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/30 font-bold">
                                      Winner
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                                  <span>Impressions: <span className="text-white font-bold">{formatNumber(v.impressions)}</span></span>
                                  <span>Clicks: <span className="text-cyan-400 font-bold">{formatNumber(v.clicks)}</span></span>
                                  <span>Conversions: <span className="text-green-400 font-bold">{v.conversions}</span></span>
                                  <span>CTR: <span className="text-purple-400 font-bold">{v.ctr}%</span></span>
                                  <span>CVR: <span className="text-pink-400 font-bold">{v.cvr}%</span></span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {test.status === 'running' && (
                          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                            <AlertCircle size={10} className="text-yellow-400" />
                            Test still running — confidence at {test.confidence}% (target: 95%)
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-purple-500/20 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${getCampaignStatusColors(effectiveSelected.status).dot}`} />
                  <span className="text-xs text-slate-400 capitalize">{effectiveSelected.status}</span>
                  {hasComplianceIssue(effectiveSelected.compliance) && (
                    <span className="flex items-center gap-1 text-xs text-yellow-400 ml-2">
                      <AlertTriangle size={10} /> Compliance review required
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-3 py-1 rounded border font-medium capitalize ${getCampaignStatusColors(effectiveSelected.status).badge}`}>
                    {effectiveSelected.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
