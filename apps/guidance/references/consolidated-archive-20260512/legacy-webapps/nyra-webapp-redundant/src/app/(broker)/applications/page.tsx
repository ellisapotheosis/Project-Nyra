'use client';

import { useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  FileCheck,
  FileText,
  FileX,
  Filter,
  Home,
  RefreshCw,
  Shield,
  User,
  Users,
  X,
  XCircle,
  ArrowRight,
  ClipboardList,
  Send,
  UserCheck,
  BookOpen,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';

// ─── Types ────────────────────────────────────────────────────────────────────

type TimeRange = '1h' | '6h' | '24h' | 'all';
type AppStatus =
  | 'new'
  | 'in-review'
  | 'documents-needed'
  | 'underwriting'
  | 'approval'
  | 'denial'
  | 'conditional';
type PropertyType = 'single-family' | 'condo' | 'multi-family' | 'townhouse';
type ComplianceStatus = 'compliant' | 'pending' | 'violation' | 'exempt';
type DocStatus = 'submitted' | 'missing' | 'expired' | 'pending-review';

interface ComplianceItem {
  id: string;
  label: string;
  category: 'TILA' | 'RESPA' | 'TRID' | 'state' | 'data';
  status: ComplianceStatus;
  dueDate: string | null;
  notes: string;
}

interface Document {
  id: string;
  name: string;
  status: DocStatus;
  submittedDate: string | null;
  expiresDate: string | null;
  required: boolean;
}

interface Application {
  id: string;
  borrowerName: string;
  coborrowerName: string | null;
  property: string;
  propertyType: PropertyType;
  loanAmount: number;
  status: AppStatus;
  progressPct: number;
  estimatedCloseDate: string;
  assignedUnderwriter: string;
  submittedDate: string;
  lastActivity: string;
  creditScore: number;
  ltv: number;
  loanType: string;
  interestRate: number;
  notes: string;
  documents: Document[];
  compliance: ComplianceItem[];
  stageHistory: { stage: AppStatus; date: string; actor: string }[];
}

interface FilterState {
  status: AppStatus | 'all';
  propertyType: PropertyType | 'all';
  amountMin: number | null;
  amountMax: number | null;
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const metricsByRange: Record<
  TimeRange,
  { total: number; inProgress: number; completed: number; avgDays: number }
> = {
  '1h':  { total: 3,   inProgress: 2,  completed: 1,  avgDays: 18 },
  '6h':  { total: 11,  inProgress: 7,  completed: 4,  avgDays: 19 },
  '24h': { total: 34,  inProgress: 21, completed: 13, avgDays: 21 },
  'all': { total: 248, inProgress: 61, completed: 187, avgDays: 24 },
};

const STATUS_PIPELINE: { status: AppStatus; label: string; count: number; color: string; bgColor: string; borderColor: string }[] = [
  { status: 'new',               label: 'New',               count: 12, color: 'text-blue-400',   bgColor: 'bg-blue-500/10',   borderColor: 'border-blue-500/30'   },
  { status: 'in-review',         label: 'In Review',         count: 18, color: 'text-cyan-400',   bgColor: 'bg-cyan-500/10',   borderColor: 'border-cyan-500/30'   },
  { status: 'documents-needed',  label: 'Docs Needed',       count: 9,  color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30' },
  { status: 'underwriting',      label: 'Underwriting',      count: 14, color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30' },
  { status: 'approval',          label: 'Approval',          count: 6,  color: 'text-green-400',  bgColor: 'bg-green-500/10',  borderColor: 'border-green-500/30'  },
  { status: 'conditional',       label: 'Conditional',       count: 4,  color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30' },
  { status: 'denial',            label: 'Denial',            count: 3,  color: 'text-red-400',    bgColor: 'bg-red-500/10',    borderColor: 'border-red-500/30'    },
];

const APPLICATIONS: Application[] = [
  {
    id: 'app-4821',
    borrowerName: 'Marcus Johnson',
    coborrowerName: 'Elena Johnson',
    property: '1482 Maple Grove Dr, Austin TX 78701',
    propertyType: 'single-family',
    loanAmount: 485000,
    status: 'underwriting',
    progressPct: 72,
    estimatedCloseDate: '2026-06-14',
    assignedUnderwriter: 'Sarah Kim',
    submittedDate: '2026-04-28',
    lastActivity: '2h ago',
    creditScore: 748,
    ltv: 78,
    loanType: '30yr Fixed',
    interestRate: 6.875,
    notes: 'Strong DTI at 31%. Self-employment income requires 24-month avg. Second review requested by UW for rental income docs.',
    documents: [
      { id: 'doc-01', name: 'W2 (2023 & 2024)',          status: 'submitted',      submittedDate: '2026-04-30', expiresDate: null,         required: true  },
      { id: 'doc-02', name: 'Bank Statements (3 mo)',     status: 'submitted',      submittedDate: '2026-05-01', expiresDate: null,         required: true  },
      { id: 'doc-03', name: 'Tax Returns (2yr)',          status: 'submitted',      submittedDate: '2026-04-30', expiresDate: null,         required: true  },
      { id: 'doc-04', name: 'Pay Stubs (recent 30d)',     status: 'submitted',      submittedDate: '2026-05-02', expiresDate: null,         required: true  },
      { id: 'doc-05', name: 'Rental Income Schedule E',  status: 'missing',        submittedDate: null,          expiresDate: null,         required: true  },
      { id: 'doc-06', name: 'Property Appraisal',        status: 'pending-review', submittedDate: '2026-05-08', expiresDate: '2026-08-08', required: true  },
      { id: 'doc-07', name: 'Homeowners Insurance',      status: 'missing',        submittedDate: null,          expiresDate: null,         required: true  },
      { id: 'doc-08', name: 'Title Commitment',          status: 'submitted',      submittedDate: '2026-05-09', expiresDate: null,         required: true  },
    ],
    compliance: [
      { id: 'c-01', label: 'Loan Estimate Delivered',       category: 'TRID',  status: 'compliant', dueDate: null,         notes: 'Delivered within 3 business days of application' },
      { id: 'c-02', label: 'Closing Disclosure (3-day)',     category: 'TRID',  status: 'pending',   dueDate: '2026-06-11', notes: 'Awaiting final loan terms before issuance' },
      { id: 'c-03', label: 'APR Disclosure (TILA)',         category: 'TILA',  status: 'compliant', dueDate: null,         notes: 'APR disclosed at 7.124%' },
      { id: 'c-04', label: 'Right of Rescission Notice',    category: 'TILA',  status: 'compliant', dueDate: null,         notes: 'N/A — purchase transaction' },
      { id: 'c-05', label: 'GFE / RESPA Servicing Disc',   category: 'RESPA', status: 'compliant', dueDate: null,         notes: 'Servicing disclosure provided' },
      { id: 'c-06', label: 'Anti-Steering Certification',   category: 'state', status: 'compliant', dueDate: null,         notes: 'TX-2 form signed by borrower' },
      { id: 'c-07', label: 'HMDA Data Validation',         category: 'data',  status: 'compliant', dueDate: null,         notes: 'All required fields validated' },
    ],
    stageHistory: [
      { stage: 'new',          date: '2026-04-28', actor: 'System'      },
      { stage: 'in-review',    date: '2026-04-29', actor: 'Mia Torres'  },
      { stage: 'underwriting', date: '2026-05-04', actor: 'Sarah Kim'   },
    ],
  },
  {
    id: 'app-4819',
    borrowerName: 'Diana Reyes',
    coborrowerName: null,
    property: '892 Sunset Blvd #4C, Austin TX 78702',
    propertyType: 'condo',
    loanAmount: 312000,
    status: 'documents-needed',
    progressPct: 38,
    estimatedCloseDate: '2026-07-02',
    assignedUnderwriter: 'James Okafor',
    submittedDate: '2026-05-03',
    lastActivity: '1d ago',
    creditScore: 712,
    ltv: 85,
    loanType: 'FHA 30yr',
    interestRate: 6.625,
    notes: 'FHA requires condo project approval. HOA financials outstanding. Credit score borderline — need LOE for 2 collections accounts.',
    documents: [
      { id: 'doc-11', name: 'W2 (2024)',                  status: 'submitted',  submittedDate: '2026-05-04', expiresDate: null,         required: true  },
      { id: 'doc-12', name: 'Bank Statements (3 mo)',     status: 'submitted',  submittedDate: '2026-05-04', expiresDate: null,         required: true  },
      { id: 'doc-13', name: 'Tax Returns (2yr)',          status: 'missing',    submittedDate: null,          expiresDate: null,         required: true  },
      { id: 'doc-14', name: 'Pay Stubs (recent 30d)',     status: 'missing',    submittedDate: null,          expiresDate: null,         required: true  },
      { id: 'doc-15', name: 'HOA Financial Statements',  status: 'missing',    submittedDate: null,          expiresDate: null,         required: true  },
      { id: 'doc-16', name: 'Condo Project Approval',    status: 'missing',    submittedDate: null,          expiresDate: null,         required: true  },
      { id: 'doc-17', name: 'LOE — Collections Accts',   status: 'missing',    submittedDate: null,          expiresDate: null,         required: true  },
      { id: 'doc-18', name: 'Property Appraisal',        status: 'missing',    submittedDate: null,          expiresDate: null,         required: true  },
    ],
    compliance: [
      { id: 'c-11', label: 'Loan Estimate Delivered',      category: 'TRID',  status: 'compliant', dueDate: null,         notes: 'Delivered 2026-05-05' },
      { id: 'c-12', label: 'Closing Disclosure (3-day)',   category: 'TRID',  status: 'pending',   dueDate: null,         notes: 'Not yet applicable — docs outstanding' },
      { id: 'c-13', label: 'APR Disclosure (TILA)',        category: 'TILA',  status: 'compliant', dueDate: null,         notes: 'APR disclosed at 7.648% (FHA MIP included)' },
      { id: 'c-14', label: 'GFE / RESPA Servicing Disc',  category: 'RESPA', status: 'compliant', dueDate: null,         notes: 'Servicing disclosure provided' },
      { id: 'c-15', label: 'HMDA Data Validation',        category: 'data',  status: 'pending',   dueDate: null,         notes: 'Awaiting complete borrower profile' },
    ],
    stageHistory: [
      { stage: 'new',               date: '2026-05-03', actor: 'System'      },
      { stage: 'in-review',         date: '2026-05-04', actor: 'Mia Torres'  },
      { stage: 'documents-needed',  date: '2026-05-06', actor: 'James Okafor'},
    ],
  },
  {
    id: 'app-4815',
    borrowerName: 'Robert Chen',
    coborrowerName: 'Linda Chen',
    property: '3301 Oak Creek Rd, Round Rock TX 78664',
    propertyType: 'single-family',
    loanAmount: 624000,
    status: 'approval',
    progressPct: 92,
    estimatedCloseDate: '2026-05-28',
    assignedUnderwriter: 'Priya Menon',
    submittedDate: '2026-04-10',
    lastActivity: '3h ago',
    creditScore: 791,
    ltv: 72,
    loanType: 'Jumbo 30yr',
    interestRate: 7.125,
    notes: 'Clean file. All docs received and verified. Final UW sign-off pending. Clear to close expected by EOD.',
    documents: [
      { id: 'doc-21', name: 'W2 (2023 & 2024)',          status: 'submitted',  submittedDate: '2026-04-12', expiresDate: null,         required: true  },
      { id: 'doc-22', name: 'Bank Statements (3 mo)',     status: 'submitted',  submittedDate: '2026-04-12', expiresDate: null,         required: true  },
      { id: 'doc-23', name: 'Tax Returns (2yr)',          status: 'submitted',  submittedDate: '2026-04-12', expiresDate: null,         required: true  },
      { id: 'doc-24', name: 'Pay Stubs (recent 30d)',     status: 'submitted',  submittedDate: '2026-04-14', expiresDate: null,         required: true  },
      { id: 'doc-25', name: 'Property Appraisal',        status: 'submitted',  submittedDate: '2026-04-22', expiresDate: '2026-07-22', required: true  },
      { id: 'doc-26', name: 'Homeowners Insurance',      status: 'submitted',  submittedDate: '2026-05-01', expiresDate: null,         required: true  },
      { id: 'doc-27', name: 'Title Commitment',          status: 'submitted',  submittedDate: '2026-04-28', expiresDate: null,         required: true  },
      { id: 'doc-28', name: 'Jumbo Asset Verification',  status: 'submitted',  submittedDate: '2026-04-15', expiresDate: null,         required: true  },
    ],
    compliance: [
      { id: 'c-21', label: 'Loan Estimate Delivered',      category: 'TRID',  status: 'compliant', dueDate: null,         notes: 'Delivered 2026-04-12' },
      { id: 'c-22', label: 'Closing Disclosure (3-day)',   category: 'TRID',  status: 'compliant', dueDate: null,         notes: 'Delivered 2026-05-09 for close 2026-05-28' },
      { id: 'c-23', label: 'APR Disclosure (TILA)',        category: 'TILA',  status: 'compliant', dueDate: null,         notes: 'APR disclosed at 7.389%' },
      { id: 'c-24', label: 'Right of Rescission Notice',  category: 'TILA',  status: 'compliant', dueDate: null,         notes: 'N/A — purchase transaction' },
      { id: 'c-25', label: 'GFE / RESPA Servicing Disc',  category: 'RESPA', status: 'compliant', dueDate: null,         notes: 'Servicing disclosure provided' },
      { id: 'c-26', label: 'Anti-Steering Certification', category: 'state', status: 'compliant', dueDate: null,         notes: 'TX-2 form signed' },
      { id: 'c-27', label: 'HMDA Data Validation',        category: 'data',  status: 'compliant', dueDate: null,         notes: 'All fields validated and submitted' },
    ],
    stageHistory: [
      { stage: 'new',          date: '2026-04-10', actor: 'System'      },
      { stage: 'in-review',    date: '2026-04-11', actor: 'Priya Menon' },
      { stage: 'underwriting', date: '2026-04-20', actor: 'Priya Menon' },
      { stage: 'approval',     date: '2026-05-09', actor: 'Priya Menon' },
    ],
  },
  {
    id: 'app-4810',
    borrowerName: 'James Williams',
    coborrowerName: null,
    property: '517 Cypress Ct, Cedar Park TX 78613',
    propertyType: 'townhouse',
    loanAmount: 389000,
    status: 'in-review',
    progressPct: 28,
    estimatedCloseDate: '2026-07-18',
    assignedUnderwriter: 'Unassigned',
    submittedDate: '2026-05-10',
    lastActivity: '6h ago',
    creditScore: 724,
    ltv: 88,
    loanType: 'Conv 30yr',
    interestRate: 6.99,
    notes: 'New submission. Initial review in progress. Need to verify employment — gap in 2024. Potential PMI required at 88% LTV.',
    documents: [
      { id: 'doc-31', name: 'W2 (2024)',                  status: 'submitted',  submittedDate: '2026-05-10', expiresDate: null,  required: true  },
      { id: 'doc-32', name: 'Bank Statements (3 mo)',     status: 'missing',    submittedDate: null,          expiresDate: null,  required: true  },
      { id: 'doc-33', name: 'Tax Returns (2yr)',          status: 'submitted',  submittedDate: '2026-05-10', expiresDate: null,  required: true  },
      { id: 'doc-34', name: 'Pay Stubs (recent 30d)',     status: 'submitted',  submittedDate: '2026-05-10', expiresDate: null,  required: true  },
      { id: 'doc-35', name: 'Property Appraisal',        status: 'missing',    submittedDate: null,          expiresDate: null,  required: true  },
      { id: 'doc-36', name: 'Employment LOE (2024 gap)', status: 'missing',    submittedDate: null,          expiresDate: null,  required: true  },
    ],
    compliance: [
      { id: 'c-31', label: 'Loan Estimate Delivered',     category: 'TRID',  status: 'compliant', dueDate: null, notes: 'Delivered 2026-05-11' },
      { id: 'c-32', label: 'Closing Disclosure (3-day)',  category: 'TRID',  status: 'pending',   dueDate: null, notes: 'Not yet applicable' },
      { id: 'c-33', label: 'APR Disclosure (TILA)',       category: 'TILA',  status: 'compliant', dueDate: null, notes: 'APR disclosed at 7.281% (with PMI)' },
      { id: 'c-34', label: 'HMDA Data Validation',       category: 'data',  status: 'pending',   dueDate: null, notes: 'Pending complete documentation' },
    ],
    stageHistory: [
      { stage: 'new',       date: '2026-05-10', actor: 'System'     },
      { stage: 'in-review', date: '2026-05-11', actor: 'Mia Torres' },
    ],
  },
  {
    id: 'app-4804',
    borrowerName: 'Sophia Martinez',
    coborrowerName: 'Carlos Martinez',
    property: '2844 Riverview Ln, Kyle TX 78640',
    propertyType: 'single-family',
    loanAmount: 541000,
    status: 'conditional',
    progressPct: 83,
    estimatedCloseDate: '2026-06-05',
    assignedUnderwriter: 'Sarah Kim',
    submittedDate: '2026-04-18',
    lastActivity: '4h ago',
    creditScore: 763,
    ltv: 80,
    loanType: 'Conv 30yr',
    interestRate: 6.875,
    notes: 'Conditional approval issued. Outstanding conditions: updated payoff statement, final COI. All other conditions cleared.',
    documents: [
      { id: 'doc-41', name: 'W2 (2023 & 2024)',          status: 'submitted',      submittedDate: '2026-04-20', expiresDate: null,         required: true  },
      { id: 'doc-42', name: 'Bank Statements (3 mo)',     status: 'submitted',      submittedDate: '2026-04-20', expiresDate: null,         required: true  },
      { id: 'doc-43', name: 'Property Appraisal',        status: 'submitted',      submittedDate: '2026-04-30', expiresDate: '2026-07-30', required: true  },
      { id: 'doc-44', name: 'Homeowners Insurance COI',  status: 'missing',        submittedDate: null,          expiresDate: null,         required: true  },
      { id: 'doc-45', name: 'Payoff Statement',          status: 'missing',        submittedDate: null,          expiresDate: null,         required: true  },
      { id: 'doc-46', name: 'Title Commitment',          status: 'submitted',      submittedDate: '2026-05-01', expiresDate: null,         required: true  },
      { id: 'doc-47', name: 'Purchase Agreement',        status: 'submitted',      submittedDate: '2026-04-19', expiresDate: null,         required: true  },
    ],
    compliance: [
      { id: 'c-41', label: 'Loan Estimate Delivered',     category: 'TRID',  status: 'compliant', dueDate: null,         notes: 'Delivered 2026-04-20' },
      { id: 'c-42', label: 'Closing Disclosure (3-day)',  category: 'TRID',  status: 'compliant', dueDate: null,         notes: 'Delivered 2026-06-02 for close 2026-06-05' },
      { id: 'c-43', label: 'APR Disclosure (TILA)',       category: 'TILA',  status: 'compliant', dueDate: null,         notes: 'APR at 7.018%' },
      { id: 'c-44', label: 'GFE / RESPA Servicing Disc', category: 'RESPA', status: 'compliant', dueDate: null,         notes: 'Provided at application' },
      { id: 'c-45', label: 'Anti-Steering Certification',category: 'state', status: 'compliant', dueDate: null,         notes: 'TX-2 signed' },
      { id: 'c-46', label: 'HMDA Data Validation',       category: 'data',  status: 'compliant', dueDate: null,         notes: 'Submitted' },
    ],
    stageHistory: [
      { stage: 'new',          date: '2026-04-18', actor: 'System'      },
      { stage: 'in-review',    date: '2026-04-19', actor: 'Sarah Kim'   },
      { stage: 'underwriting', date: '2026-04-25', actor: 'Sarah Kim'   },
      { stage: 'conditional',  date: '2026-05-08', actor: 'Sarah Kim'   },
    ],
  },
  {
    id: 'app-4798',
    borrowerName: 'Nathan Brooks',
    coborrowerName: null,
    property: '1190 Pinecroft Dr, Pflugerville TX 78660',
    propertyType: 'single-family',
    loanAmount: 298000,
    status: 'denial',
    progressPct: 100,
    estimatedCloseDate: '—',
    assignedUnderwriter: 'James Okafor',
    submittedDate: '2026-04-05',
    lastActivity: '3d ago',
    creditScore: 618,
    ltv: 96,
    loanType: 'FHA 30yr',
    interestRate: 0,
    notes: 'Denied: insufficient credit history, DTI at 58% exceeds FHA maximum of 50%. Adverse action notice issued 2026-05-09. Borrower advised on credit remediation.',
    documents: [
      { id: 'doc-51', name: 'W2 (2024)',              status: 'submitted', submittedDate: '2026-04-06', expiresDate: null, required: true },
      { id: 'doc-52', name: 'Bank Statements (3 mo)', status: 'submitted', submittedDate: '2026-04-06', expiresDate: null, required: true },
      { id: 'doc-53', name: 'Tax Returns (1yr)',      status: 'submitted', submittedDate: '2026-04-06', expiresDate: null, required: true },
    ],
    compliance: [
      { id: 'c-51', label: 'Loan Estimate Delivered',    category: 'TRID',  status: 'compliant', dueDate: null, notes: 'Delivered 2026-04-07' },
      { id: 'c-52', label: 'Adverse Action Notice',      category: 'TILA',  status: 'compliant', dueDate: null, notes: 'ECOA adverse action notice issued 2026-05-09' },
      { id: 'c-53', label: 'HMDA Data Validation',      category: 'data',  status: 'compliant', dueDate: null, notes: 'Denial recorded in HMDA LAR' },
    ],
    stageHistory: [
      { stage: 'new',          date: '2026-04-05', actor: 'System'       },
      { stage: 'in-review',    date: '2026-04-06', actor: 'James Okafor' },
      { stage: 'underwriting', date: '2026-04-15', actor: 'James Okafor' },
      { stage: 'denial',       date: '2026-05-09', actor: 'James Okafor' },
    ],
  },
];

const PIPELINE_ORDER: AppStatus[] = [
  'new', 'in-review', 'documents-needed', 'underwriting', 'approval', 'conditional', 'denial',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  if (amount === 0) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

function getStatusConfig(status: AppStatus) {
  switch (status) {
    case 'new':               return { badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30',     dot: 'bg-blue-400',            label: 'New'              };
    case 'in-review':         return { badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',     dot: 'bg-cyan-400',            label: 'In Review'        };
    case 'documents-needed':  return { badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-400 animate-pulse', label: 'Docs Needed'  };
    case 'underwriting':      return { badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30', dot: 'bg-purple-400',          label: 'Underwriting'     };
    case 'approval':          return { badge: 'bg-green-500/10 text-green-400 border-green-500/30',  dot: 'bg-green-400',           label: 'Approval'         };
    case 'conditional':       return { badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30', dot: 'bg-orange-400 animate-pulse', label: 'Conditional'  };
    case 'denial':            return { badge: 'bg-red-500/10 text-red-400 border-red-500/30',         dot: 'bg-red-400',             label: 'Denial'           };
  }
}

function getProgressBarColor(status: AppStatus, pct: number): string {
  if (status === 'denial')  return 'from-red-600 to-red-500';
  if (status === 'approval') return 'from-green-500 to-emerald-400';
  if (pct >= 80)  return 'from-purple-500 to-pink-400';
  if (pct >= 50)  return 'from-cyan-500 to-blue-400';
  return 'from-slate-500 to-slate-400';
}

function getComplianceConfig(status: ComplianceStatus) {
  switch (status) {
    case 'compliant':  return { badge: 'bg-green-500/10 text-green-400 border-green-500/30',   icon: <CheckCircle2 size={13} className="text-green-400" />  };
    case 'pending':    return { badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', icon: <Clock size={13} className="text-yellow-400" />         };
    case 'violation':  return { badge: 'bg-red-500/10 text-red-400 border-red-500/30',          icon: <XCircle size={13} className="text-red-400" />          };
    case 'exempt':     return { badge: 'bg-slate-500/10 text-slate-400 border-slate-500/30',    icon: <Shield size={13} className="text-slate-400" />         };
  }
}

function getDocStatusConfig(status: DocStatus) {
  switch (status) {
    case 'submitted':      return { badge: 'bg-green-500/10 text-green-400 border-green-500/30',   icon: <FileCheck size={13} className="text-green-400" />,  label: 'Submitted'      };
    case 'missing':        return { badge: 'bg-red-500/10 text-red-400 border-red-500/30',          icon: <FileX size={13} className="text-red-400" />,        label: 'Missing'        };
    case 'expired':        return { badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30', icon: <AlertTriangle size={13} className="text-orange-400" />, label: 'Expired'    };
    case 'pending-review': return { badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', icon: <Eye size={13} className="text-yellow-400" />,        label: 'In Review'      };
  }
}

function getComplianceCategoryColor(category: ComplianceItem['category']): string {
  switch (category) {
    case 'TILA':  return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    case 'RESPA': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    case 'TRID':  return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    case 'state': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'data':  return 'bg-pink-500/10 text-pink-400 border-pink-500/30';
  }
}

function getNextStage(status: AppStatus): AppStatus | null {
  const idx = PIPELINE_ORDER.indexOf(status);
  if (idx === -1 || idx >= PIPELINE_ORDER.length - 2) return null; // denial is terminal
  return PIPELINE_ORDER[idx + 1];
}

function getOverallComplianceStatus(items: ComplianceItem[]): 'all-clear' | 'pending' | 'violation' {
  if (items.some((i) => i.status === 'violation')) return 'violation';
  if (items.some((i) => i.status === 'pending'))   return 'pending';
  return 'all-clear';
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function ApplicationsPage() {
  const [timeRange, setTimeRange]           = useState<TimeRange>('all');
  const [selectedApp, setSelectedApp]       = useState<Application | null>(null);
  const [modalTab, setModalTab]             = useState<'details' | 'documents' | 'compliance' | 'notes'>('details');
  const [filterStatus, setFilterStatus]     = useState<AppStatus | 'all'>('all');
  const [filterPropType, setFilterPropType] = useState<PropertyType | 'all'>('all');
  const [filterAmtMax, setFilterAmtMax]     = useState<number | null>(null);
  const [showFilters, setShowFilters]       = useState(false);
  // Simulate stage advancement
  const [stageOverrides, setStageOverrides] = useState<Record<string, AppStatus>>({});

  const metrics = metricsByRange[timeRange];

  // Apply filters
  const filteredApps = APPLICATIONS.filter((app) => {
    const effectiveStatus = stageOverrides[app.id] ?? app.status;
    if (filterStatus !== 'all' && effectiveStatus !== filterStatus) return false;
    if (filterPropType !== 'all' && app.propertyType !== filterPropType) return false;
    if (filterAmtMax !== null && app.loanAmount > filterAmtMax) return false;
    return true;
  });

  // Effective selected app (with stage override)
  const effectiveSelected = selectedApp
    ? { ...selectedApp, status: stageOverrides[selectedApp.id] ?? selectedApp.status }
    : null;

  function advanceStage(appId: string) {
    const app = APPLICATIONS.find((a) => a.id === appId);
    if (!app) return;
    const currentStatus = stageOverrides[appId] ?? app.status;
    const next = getNextStage(currentStatus);
    if (next) {
      setStageOverrides((prev) => ({ ...prev, [appId]: next }));
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Applications"
        subtitle="Broker Pipeline — Tracking, Compliance & Underwriting Management"
      />

      {/* ── Time Range Selector ── */}
      <div className="flex gap-2 justify-end">
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

      {/* ── Metrics Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <FileText size={14} /> Total Applications
            </p>
            <p className="text-2xl font-bold text-cyan-400">{metrics.total}</p>
            <p className="text-xs text-slate-400 mt-1">in last {timeRange === 'all' ? 'all time' : timeRange}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <Activity size={14} /> In Progress
            </p>
            <p className="text-2xl font-bold text-purple-400">{metrics.inProgress}</p>
            <p className="text-xs text-slate-400 mt-1">active pipeline</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <CheckCircle2 size={14} /> Completed
            </p>
            <p className="text-2xl font-bold text-green-400">{metrics.completed}</p>
            <p className="text-xs text-slate-400 mt-1">closed or denied</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <Clock size={14} /> Avg Processing
            </p>
            <p className="text-2xl font-bold text-orange-400">{metrics.avgDays}d</p>
            <p className="text-xs text-slate-400 mt-1">application to close</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Application Pipeline Visualization ── */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <BarChart3 size={18} /> Application Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Pipeline flow */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {STATUS_PIPELINE.map((stage, i) => {
              const isLast = i === STATUS_PIPELINE.length - 1;
              const isDenial = stage.status === 'denial';
              return (
                <div key={stage.status} className="flex items-center gap-2">
                  <button
                    onClick={() => setFilterStatus(filterStatus === stage.status ? 'all' : stage.status)}
                    className={`flex items-center gap-2 px-3 py-2 rounded border transition ${stage.borderColor} ${stage.bgColor} hover:opacity-90 ${filterStatus === stage.status ? 'ring-2 ring-white/20' : ''}`}
                  >
                    <span className={`text-sm font-bold ${stage.color}`}>{stage.count}</span>
                    <span className={`text-xs ${stage.color}`}>{stage.label}</span>
                  </button>
                  {!isLast && (
                    <ArrowRight size={14} className={isDenial ? 'hidden' : 'text-slate-600'} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Stage breakdown bars */}
          <div className="space-y-2">
            {STATUS_PIPELINE.map((stage) => {
              const total = STATUS_PIPELINE.reduce((s, st) => s + st.count, 0);
              const pct = Math.round((stage.count / total) * 100);
              return (
                <div key={stage.status} className="flex items-center gap-3">
                  <span className={`text-xs w-28 flex-shrink-0 ${stage.color}`}>{stage.label}</span>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${stage.bgColor.replace('/10', '/60')} border-0 transition-all`}
                      style={{ width: `${pct}%`, background: `var(--tw-gradient-stops, inherit)` }}
                    >
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${
                          stage.status === 'approval'         ? 'from-green-500 to-emerald-400' :
                          stage.status === 'denial'           ? 'from-red-600 to-red-500' :
                          stage.status === 'underwriting'     ? 'from-purple-500 to-pink-400' :
                          stage.status === 'documents-needed' ? 'from-yellow-500 to-amber-400' :
                          stage.status === 'conditional'      ? 'from-orange-500 to-amber-400' :
                          stage.status === 'in-review'        ? 'from-cyan-500 to-blue-400' :
                          'from-blue-500 to-blue-400'
                        }`}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                  <span className={`text-xs font-bold w-6 text-right ${stage.color}`}>{stage.count}</span>
                  <span className="text-xs text-slate-600 w-8 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Filters ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 rounded border text-sm font-medium transition ${
            showFilters
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
              : 'bg-slate-500/10 text-slate-400 border-slate-500/20 hover:border-slate-500/30'
          }`}
        >
          <Filter size={14} /> Filters
          {(filterStatus !== 'all' || filterPropType !== 'all' || filterAmtMax !== null) && (
            <span className="w-2 h-2 rounded-full bg-purple-400" />
          )}
        </button>

        {/* Active filter chips */}
        {filterStatus !== 'all' && (
          <button
            onClick={() => setFilterStatus('all')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-purple-500/40 bg-purple-500/10 text-purple-300 text-xs font-medium hover:bg-purple-500/20 transition"
          >
            Status: {getStatusConfig(filterStatus).label} <X size={11} />
          </button>
        )}
        {filterPropType !== 'all' && (
          <button
            onClick={() => setFilterPropType('all')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 text-xs font-medium hover:bg-cyan-500/20 transition"
          >
            Type: {filterPropType} <X size={11} />
          </button>
        )}
        {filterAmtMax !== null && (
          <button
            onClick={() => setFilterAmtMax(null)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-orange-500/40 bg-orange-500/10 text-orange-300 text-xs font-medium hover:bg-orange-500/20 transition"
          >
            Max: {formatCurrency(filterAmtMax)} <X size={11} />
          </button>
        )}

        <span className="text-xs text-slate-500 ml-auto">{filteredApps.length} application{filteredApps.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Status filter */}
              <div>
                <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {(['all', ...PIPELINE_ORDER] as (AppStatus | 'all')[]).map((s) => {
                    const cfg = s === 'all' ? null : getStatusConfig(s);
                    return (
                      <button
                        key={s}
                        onClick={() => setFilterStatus(s)}
                        className={`px-2.5 py-1 rounded border text-xs font-medium transition ${
                          filterStatus === s
                            ? s === 'all'
                              ? 'bg-white/10 text-white border-white/30'
                              : cfg!.badge + ' ring-1 ring-white/20'
                            : s === 'all'
                              ? 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                              : cfg!.badge + ' opacity-50'
                        }`}
                      >
                        {s === 'all' ? 'All' : cfg!.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Property type filter */}
              <div>
                <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Property Type</p>
                <div className="flex flex-wrap gap-1.5">
                  {(['all', 'single-family', 'condo', 'multi-family', 'townhouse'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterPropType(t)}
                      className={`px-2.5 py-1 rounded border text-xs font-medium transition capitalize ${
                        filterPropType === t
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/20 hover:border-slate-500/30'
                      }`}
                    >
                      {t === 'all' ? 'All Types' : t.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount filter */}
              <div>
                <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Max Loan Amount</p>
                <div className="flex flex-wrap gap-1.5">
                  {[null, 350000, 500000, 650000].map((amt) => (
                    <button
                      key={amt ?? 'none'}
                      onClick={() => setFilterAmtMax(amt)}
                      className={`px-2.5 py-1 rounded border text-xs font-medium transition ${
                        filterAmtMax === amt
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/20 hover:border-slate-500/30'
                      }`}
                    >
                      {amt === null ? 'Any' : `≤ ${formatCurrency(amt)}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Applications Table ── */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <ClipboardList size={18} /> Recent Applications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Borrower</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-3 py-3 hidden md:table-cell">Property</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-3 py-3">Amount</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-3 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-3 py-3 hidden lg:table-cell">Progress</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-3 py-3 hidden xl:table-cell">Est. Close</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-3 py-3 hidden xl:table-cell">Underwriter</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-3 py-3 hidden sm:table-cell">Compliance</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app) => {
                  const effectiveStatus = stageOverrides[app.id] ?? app.status;
                  const sc = getStatusConfig(effectiveStatus);
                  const compStatus = getOverallComplianceStatus(app.compliance);
                  const missingDocs = app.documents.filter((d) => d.status === 'missing').length;
                  return (
                    <tr
                      key={app.id}
                      onClick={() => { setSelectedApp(app); setModalTab('details'); }}
                      className="border-b border-slate-800/60 hover:bg-purple-500/5 transition cursor-pointer group"
                    >
                      {/* Borrower */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                            <User size={13} className="text-purple-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{app.borrowerName}</p>
                            {app.coborrowerName && (
                              <p className="text-xs text-slate-500">+ {app.coborrowerName}</p>
                            )}
                            <p className="text-xs text-slate-600 font-mono">{app.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Property */}
                      <td className="px-3 py-4 hidden md:table-cell">
                        <p className="text-xs text-slate-300 max-w-[180px] truncate">{app.property}</p>
                        <p className="text-xs text-slate-500 capitalize mt-0.5 flex items-center gap-1">
                          <Home size={10} /> {app.propertyType.replace('-', ' ')}
                        </p>
                      </td>

                      {/* Amount */}
                      <td className="px-3 py-4">
                        <p className="text-sm font-bold text-white">{formatCurrency(app.loanAmount)}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{app.loanType}</p>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${sc.dot}`} />
                          <span className={`text-xs px-2 py-0.5 rounded border font-medium ${sc.badge}`}>
                            {sc.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                          <Clock size={9} /> {app.lastActivity}
                        </p>
                      </td>

                      {/* Progress */}
                      <td className="px-3 py-4 hidden lg:table-cell">
                        <div className="w-24">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500">Progress</span>
                            <span className="text-slate-300 font-bold">{app.progressPct}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${getProgressBarColor(effectiveStatus, app.progressPct)} rounded-full transition-all`}
                              style={{ width: `${app.progressPct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Est. Close */}
                      <td className="px-3 py-4 hidden xl:table-cell">
                        <p className="text-xs text-slate-300">{app.estimatedCloseDate}</p>
                      </td>

                      {/* Underwriter */}
                      <td className="px-3 py-4 hidden xl:table-cell">
                        <p className="text-xs text-slate-300 flex items-center gap-1">
                          <UserCheck size={11} className="text-slate-500" />
                          {app.assignedUnderwriter}
                        </p>
                      </td>

                      {/* Compliance indicator */}
                      <td className="px-3 py-4 hidden sm:table-cell">
                        <div className="flex flex-col gap-1">
                          {compStatus === 'all-clear' && (
                            <span className="text-xs flex items-center gap-1 text-green-400">
                              <Shield size={11} /> Clear
                            </span>
                          )}
                          {compStatus === 'pending' && (
                            <span className="text-xs flex items-center gap-1 text-yellow-400">
                              <AlertCircle size={11} /> Pending
                            </span>
                          )}
                          {compStatus === 'violation' && (
                            <span className="text-xs flex items-center gap-1 text-red-400">
                              <XCircle size={11} /> Violation
                            </span>
                          )}
                          {missingDocs > 0 && (
                            <span className="text-xs flex items-center gap-1 text-orange-400">
                              <FileX size={11} /> {missingDocs} doc{missingDocs !== 1 ? 's' : ''} missing
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Arrow */}
                      <td className="px-3 py-4">
                        <ChevronRight size={14} className="text-slate-600 group-hover:text-purple-400 transition" />
                      </td>
                    </tr>
                  );
                })}

                {filteredApps.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center text-slate-500 text-sm italic">
                      No applications match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Application Detail Modal ── */}
      {effectiveSelected && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedApp(null)}
        >
          <div
            className="bg-black border border-purple-500/30 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 flex items-start justify-between p-6 border-b border-purple-500/20 bg-black/90 backdrop-blur z-10">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-purple-400" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-base">
                    {effectiveSelected.borrowerName}
                    {effectiveSelected.coborrowerName && (
                      <span className="text-slate-400 font-normal text-sm"> & {effectiveSelected.coborrowerName}</span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">{effectiveSelected.id} · {effectiveSelected.property}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${getStatusConfig(effectiveSelected.status).badge}`}>
                      {getStatusConfig(effectiveSelected.status).label}
                    </span>
                    <span className="text-xs text-slate-500">{effectiveSelected.loanType}</span>
                    <span className="text-xs font-bold text-white">{formatCurrency(effectiveSelected.loanAmount)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 hover:bg-red-500/20 rounded transition flex-shrink-0 ml-4"
              >
                <X size={18} className="text-red-400" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-800 px-6 gap-1 sticky top-[89px] bg-black/95 backdrop-blur z-10">
              {(['details', 'documents', 'compliance', 'notes'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setModalTab(tab)}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide transition border-b-2 -mb-px capitalize ${
                    modalTab === tab
                      ? 'border-purple-500 text-purple-300'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-6">

              {/* ── Details Tab ── */}
              {modalTab === 'details' && (
                <>
                  {/* Key metrics */}
                  <div>
                    <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-medium">Loan Details</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: 'Loan Amount',   value: formatCurrency(effectiveSelected.loanAmount),  color: 'text-white'       },
                        { label: 'Interest Rate',  value: effectiveSelected.interestRate > 0 ? `${effectiveSelected.interestRate}%` : '—', color: 'text-cyan-400'   },
                        { label: 'LTV',            value: `${effectiveSelected.ltv}%`,                   color: effectiveSelected.ltv >= 90 ? 'text-red-400' : effectiveSelected.ltv >= 80 ? 'text-yellow-400' : 'text-green-400' },
                        { label: 'Credit Score',   value: `${effectiveSelected.creditScore}`,             color: effectiveSelected.creditScore >= 740 ? 'text-green-400' : effectiveSelected.creditScore >= 680 ? 'text-yellow-400' : 'text-red-400' },
                        { label: 'Loan Type',      value: effectiveSelected.loanType,                    color: 'text-purple-400'  },
                        { label: 'Property Type',  value: effectiveSelected.propertyType.replace('-', ' '), color: 'text-slate-300' },
                        { label: 'Submitted',      value: effectiveSelected.submittedDate,               color: 'text-slate-300'  },
                        { label: 'Est. Close',     value: effectiveSelected.estimatedCloseDate,          color: 'text-slate-300'  },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="p-3 rounded border border-slate-800">
                          <p className="text-xs text-slate-500">{label}</p>
                          <p className={`text-sm font-bold ${color} mt-0.5 capitalize`}>{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <p className="text-slate-500 uppercase tracking-wider font-medium">Application Progress</p>
                      <span className="text-white font-bold">{effectiveSelected.progressPct}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getProgressBarColor(effectiveSelected.status, effectiveSelected.progressPct)} rounded-full transition-all`}
                        style={{ width: `${effectiveSelected.progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Stage history */}
                  <div>
                    <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-medium">Stage History</p>
                    <div className="space-y-2">
                      {effectiveSelected.stageHistory.map((entry, i) => {
                        const sc = getStatusConfig(entry.stage);
                        return (
                          <div key={i} className="flex items-center gap-3 p-3 rounded border border-slate-800">
                            <span className={`h-2 w-2 rounded-full flex-shrink-0 ${sc.dot}`} />
                            <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${sc.badge}`}>
                              {sc.label}
                            </span>
                            <span className="text-xs text-slate-300 flex-1">{entry.date}</span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <User size={10} /> {entry.actor}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Assigned underwriter */}
                  <div className="p-4 rounded border border-slate-800 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                      <UserCheck size={15} className="text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-500">Assigned Underwriter</p>
                      <p className="text-sm font-bold text-white">{effectiveSelected.assignedUnderwriter}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Last Activity</p>
                      <p className="text-xs text-slate-300">{effectiveSelected.lastActivity}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-medium">Actions</p>
                    <div className="flex flex-wrap gap-2">
                      {getNextStage(effectiveSelected.status) && (
                        <button
                          onClick={() => advanceStage(effectiveSelected.id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded border border-purple-500/40 bg-purple-500/10 text-purple-300 text-xs font-medium hover:border-purple-500/60 hover:bg-purple-500/20 transition"
                        >
                          <ArrowRight size={12} /> Move to {getStatusConfig(getNextStage(effectiveSelected.status)!).label}
                        </button>
                      )}
                      <button
                        onClick={() => setModalTab('documents')}
                        className="flex items-center gap-1.5 px-3 py-2 rounded border border-yellow-500/40 bg-yellow-500/10 text-yellow-300 text-xs font-medium hover:border-yellow-500/60 hover:bg-yellow-500/20 transition"
                      >
                        <Send size={12} /> Request Documents
                      </button>
                      <button
                        className="flex items-center gap-1.5 px-3 py-2 rounded border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 text-xs font-medium hover:border-cyan-500/60 hover:bg-cyan-500/20 transition"
                      >
                        <Users size={12} /> Assign Underwriter
                      </button>
                      <button
                        className="flex items-center gap-1.5 px-3 py-2 rounded border border-green-500/40 bg-green-500/10 text-green-300 text-xs font-medium hover:border-green-500/60 hover:bg-green-500/20 transition"
                      >
                        <FileText size={12} /> Generate Closing Docs
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ── Documents Tab ── */}
              {modalTab === 'documents' && (
                <>
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Submitted',   count: effectiveSelected.documents.filter((d) => d.status === 'submitted').length,      color: 'text-green-400',  bg: 'bg-green-500/5  border-green-500/20'  },
                      { label: 'Missing',     count: effectiveSelected.documents.filter((d) => d.status === 'missing').length,        color: 'text-red-400',    bg: 'bg-red-500/5    border-red-500/20'    },
                      { label: 'In Review',   count: effectiveSelected.documents.filter((d) => d.status === 'pending-review').length, color: 'text-yellow-400', bg: 'bg-yellow-500/5 border-yellow-500/20' },
                    ].map(({ label, count, color, bg }) => (
                      <div key={label} className={`p-3 rounded border ${bg} text-center`}>
                        <p className={`text-xl font-bold ${color}`}>{count}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Document list */}
                  <div className="space-y-2">
                    {effectiveSelected.documents.map((doc) => {
                      const dc = getDocStatusConfig(doc.status);
                      return (
                        <div
                          key={doc.id}
                          className={`flex items-center gap-3 p-3 rounded border transition ${
                            doc.status === 'missing'
                              ? 'border-red-500/20 bg-red-500/5 hover:border-red-500/30'
                              : doc.status === 'pending-review'
                              ? 'border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/30'
                              : 'border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex-shrink-0">{dc.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-xs font-semibold text-white">{doc.name}</p>
                              {doc.required && (
                                <span className="text-xs text-slate-600">required</span>
                              )}
                            </div>
                            {doc.submittedDate && (
                              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                <Clock size={9} /> Submitted {doc.submittedDate}
                                {doc.expiresDate && (
                                  <span className="text-slate-600"> · expires {doc.expiresDate}</span>
                                )}
                              </p>
                            )}
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded border font-medium flex-shrink-0 ${dc.badge}`}>
                            {dc.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Missing docs action */}
                  {effectiveSelected.documents.filter((d) => d.status === 'missing').length > 0 && (
                    <div className="p-4 rounded border border-orange-500/30 bg-orange-500/5">
                      <p className="text-xs font-semibold text-orange-300 mb-2 flex items-center gap-1.5">
                        <AlertTriangle size={13} />
                        {effectiveSelected.documents.filter((d) => d.status === 'missing').length} required document{effectiveSelected.documents.filter((d) => d.status === 'missing').length !== 1 ? 's' : ''} missing
                      </p>
                      <p className="text-xs text-slate-400 mb-3">
                        Send a document request to the borrower for all outstanding items.
                      </p>
                      <button className="flex items-center gap-1.5 px-3 py-2 rounded border border-orange-500/40 bg-orange-500/10 text-orange-300 text-xs font-medium hover:bg-orange-500/20 transition">
                        <Send size={12} /> Send Document Request to Borrower
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* ── Compliance Tab ── */}
              {modalTab === 'compliance' && (
                <>
                  {/* Overall status */}
                  {(() => {
                    const overall = getOverallComplianceStatus(effectiveSelected.compliance);
                    return (
                      <div className={`p-4 rounded border flex items-center gap-3 ${
                        overall === 'all-clear' ? 'border-green-500/30 bg-green-500/5' :
                        overall === 'pending'   ? 'border-yellow-500/30 bg-yellow-500/5' :
                        'border-red-500/30 bg-red-500/5'
                      }`}>
                        {overall === 'all-clear' && <CheckCircle2 size={18} className="text-green-400 flex-shrink-0" />}
                        {overall === 'pending'   && <AlertCircle size={18} className="text-yellow-400 flex-shrink-0" />}
                        {overall === 'violation' && <XCircle size={18} className="text-red-400 flex-shrink-0" />}
                        <div>
                          <p className={`text-sm font-bold ${
                            overall === 'all-clear' ? 'text-green-300' :
                            overall === 'pending'   ? 'text-yellow-300' :
                            'text-red-300'
                          }`}>
                            {overall === 'all-clear' ? 'All Compliance Items Clear' :
                             overall === 'pending'   ? 'Compliance Items Pending Review' :
                             'Compliance Violation Detected'}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {effectiveSelected.compliance.filter((c) => c.status === 'compliant').length}/{effectiveSelected.compliance.length} items compliant
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Compliance items */}
                  <div className="space-y-2">
                    {effectiveSelected.compliance.map((item) => {
                      const cc = getComplianceConfig(item.status);
                      return (
                        <div key={item.id} className="p-3 rounded border border-slate-800 hover:border-slate-700 transition">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">{cc.icon}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <p className="text-xs font-semibold text-white">{item.label}</p>
                                <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${getComplianceCategoryColor(item.category)}`}>
                                  {item.category}
                                </span>
                                <span className={`text-xs px-1.5 py-0.5 rounded border font-medium capitalize ${cc.badge}`}>
                                  {item.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400">{item.notes}</p>
                              {item.dueDate && (
                                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                  <Clock size={9} /> Due: {item.dueDate}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Compliance legend */}
                  <div className="border-t border-slate-800 pt-4">
                    <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-medium">Regulatory Frameworks</p>
                    <div className="flex flex-wrap gap-2">
                      {(['TILA', 'RESPA', 'TRID', 'state', 'data'] as const).map((cat) => (
                        <span key={cat} className={`text-xs px-2 py-0.5 rounded border font-medium ${getComplianceCategoryColor(cat)}`}>
                          {cat === 'TILA'  ? 'TILA — Truth in Lending' :
                           cat === 'RESPA' ? 'RESPA — Real Estate Settlement' :
                           cat === 'TRID'  ? 'TRID — Know Before You Owe' :
                           cat === 'state' ? 'State Regulations' :
                           'Data Validation'}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ── Notes Tab ── */}
              {modalTab === 'notes' && (
                <>
                  <div>
                    <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-medium flex items-center gap-1.5">
                      <BookOpen size={12} /> Underwriting Notes
                    </p>
                    <div className="p-4 rounded border border-slate-800 bg-slate-900/30">
                      <p className="text-sm text-slate-300 leading-relaxed">{effectiveSelected.notes}</p>
                    </div>
                  </div>

                  {/* Quick stats recap */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded border border-slate-800">
                      <p className="text-xs text-slate-500">Documents</p>
                      <p className="text-sm font-bold text-white mt-0.5">
                        {effectiveSelected.documents.filter((d) => d.status === 'submitted').length}
                        <span className="text-slate-500 font-normal"> / {effectiveSelected.documents.length} submitted</span>
                      </p>
                    </div>
                    <div className="p-3 rounded border border-slate-800">
                      <p className="text-xs text-slate-500">Compliance</p>
                      <p className="text-sm font-bold text-white mt-0.5">
                        {effectiveSelected.compliance.filter((c) => c.status === 'compliant').length}
                        <span className="text-slate-500 font-normal"> / {effectiveSelected.compliance.length} cleared</span>
                      </p>
                    </div>
                  </div>

                  {/* Credit profile */}
                  <div>
                    <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-medium">Credit Profile</p>
                    <div className="space-y-3">
                      {/* Credit score bar */}
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-slate-400 flex items-center gap-1.5"><DollarSign size={11} /> Credit Score</span>
                          <span className={`font-bold ${
                            effectiveSelected.creditScore >= 740 ? 'text-green-400' :
                            effectiveSelected.creditScore >= 680 ? 'text-yellow-400' : 'text-red-400'
                          }`}>{effectiveSelected.creditScore}</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${
                              effectiveSelected.creditScore >= 740 ? 'from-green-500 to-emerald-400' :
                              effectiveSelected.creditScore >= 680 ? 'from-yellow-500 to-amber-400' :
                              'from-red-500 to-rose-400'
                            }`}
                            style={{ width: `${Math.min(((effectiveSelected.creditScore - 300) / (850 - 300)) * 100, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-slate-600 mt-1">
                          <span>300</span><span>Poor</span><span>Fair</span><span>Good</span><span>Excellent</span><span>850</span>
                        </div>
                      </div>

                      {/* LTV bar */}
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-slate-400 flex items-center gap-1.5"><Home size={11} /> LTV Ratio</span>
                          <span className={`font-bold ${
                            effectiveSelected.ltv >= 90 ? 'text-red-400' :
                            effectiveSelected.ltv >= 80 ? 'text-yellow-400' : 'text-green-400'
                          }`}>{effectiveSelected.ltv}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${
                              effectiveSelected.ltv >= 90 ? 'from-red-500 to-rose-400' :
                              effectiveSelected.ltv >= 80 ? 'from-yellow-500 to-amber-400' :
                              'from-green-500 to-emerald-400'
                            }`}
                            style={{ width: `${effectiveSelected.ltv}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Modal footer */}
              <div className="pt-4 border-t border-purple-500/20 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className={`h-2 w-2 rounded-full ${getStatusConfig(effectiveSelected.status).dot}`} />
                  {getStatusConfig(effectiveSelected.status).label} · Last activity {effectiveSelected.lastActivity}
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 rounded border border-slate-700 text-slate-400 text-xs font-medium hover:border-slate-600 hover:text-slate-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
