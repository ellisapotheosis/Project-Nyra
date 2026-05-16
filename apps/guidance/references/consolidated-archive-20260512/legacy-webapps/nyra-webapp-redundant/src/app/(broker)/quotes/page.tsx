'use client';

import { useState, useMemo } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  DollarSign,
  Eye,
  FileText,
  Filter,
  Home,
  Mail,
  MessageSquare,
  Percent,
  RefreshCw,
  Search,
  Send,
  Shield,
  TrendingUp,
  User,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';

// ─── Types ────────────────────────────────────────────────────────────────────

type TimeRange = '1h' | '6h' | '24h' | 'all';
type QuoteStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
type ProductType = 'conventional' | 'fha' | 'va' | 'jumbo' | 'heloc' | 'arm';
type AmountRange = '<250k' | '250k-500k' | '500k-750k' | '750k-1m' | '>1m';

interface ComplianceCheck {
  label: string;
  passed: boolean;
  note?: string;
}

interface RateDetail {
  product: string;
  rate: number;
  apr: number;
  points: number;
  monthlyPayment: number;
  loanTerm: number;
  type: string;
}

interface Quote {
  id: string;
  borrowerName: string;
  borrowerEmail: string;
  borrowerPhone: string;
  loanAmount: number;
  productType: ProductType;
  status: QuoteStatus;
  createdAt: string;
  expiresAt: string;
  lastViewed: string | null;
  sentAt: string | null;
  acceptedAt: string | null;
  terms: string;
  interestRate: number;
  apr: number;
  monthlyPayment: number;
  loanTerm: number;
  ltv: number;
  creditScore: number;
  propertyAddress: string;
  propertyType: string;
  followUpCount: number;
  notes: string;
  rates: RateDetail[];
  compliance: ComplianceCheck[];
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const QUOTES: Quote[] = [
  {
    id: 'q-1001',
    borrowerName: 'Marcus Chen',
    borrowerEmail: 'm.chen@email.com',
    borrowerPhone: '(415) 555-0182',
    loanAmount: 680000,
    productType: 'conventional',
    status: 'accepted',
    createdAt: '2026-05-12 09:14',
    expiresAt: '2026-05-19 09:14',
    lastViewed: '2026-05-12 11:30',
    sentAt: '2026-05-12 09:20',
    acceptedAt: '2026-05-12 11:45',
    terms: '30yr fixed @ 6.875%',
    interestRate: 6.875,
    apr: 7.12,
    monthlyPayment: 4467,
    loanTerm: 30,
    ltv: 80,
    creditScore: 762,
    propertyAddress: '2847 Maple Ave, San Francisco, CA 94110',
    propertyType: 'Single Family',
    followUpCount: 0,
    notes: 'Borrower pre-approved. Rate lock requested.',
    rates: [
      { product: '30yr Fixed', rate: 6.875, apr: 7.12, points: 0, monthlyPayment: 4467, loanTerm: 30, type: 'conventional' },
      { product: '15yr Fixed', rate: 6.250, apr: 6.48, points: 0, monthlyPayment: 5831, loanTerm: 15, type: 'conventional' },
      { product: '7/1 ARM',    rate: 6.375, apr: 7.20, points: 0, monthlyPayment: 4242, loanTerm: 30, type: 'arm' },
    ],
    compliance: [
      { label: 'TILA Disclosure Provided',         passed: true  },
      { label: 'RESPA GFE Delivered',              passed: true  },
      { label: 'TRID 3-Day Waiting Period',        passed: true  },
      { label: 'APR Within Tolerance (±0.125%)',   passed: true  },
      { label: 'Rate Lock Disclosure',             passed: true  },
      { label: 'State Licensing Verified (CA)',    passed: true  },
    ],
  },
  {
    id: 'q-1002',
    borrowerName: 'Priya Sharma',
    borrowerEmail: 'priya.sharma@gmail.com',
    borrowerPhone: '(510) 555-0247',
    loanAmount: 425000,
    productType: 'fha',
    status: 'viewed',
    createdAt: '2026-05-12 08:00',
    expiresAt: '2026-05-19 08:00',
    lastViewed: '2026-05-12 10:15',
    sentAt: '2026-05-12 08:05',
    acceptedAt: null,
    terms: '30yr fixed @ 7.125% (FHA)',
    interestRate: 7.125,
    apr: 7.89,
    monthlyPayment: 2862,
    loanTerm: 30,
    ltv: 96.5,
    creditScore: 638,
    propertyAddress: '514 Oak Street, Oakland, CA 94607',
    propertyType: 'Condo',
    followUpCount: 1,
    notes: 'MIP included in payment. Down payment assistance program applied.',
    rates: [
      { product: '30yr FHA Fixed', rate: 7.125, apr: 7.89, points: 0, monthlyPayment: 2862, loanTerm: 30, type: 'fha' },
      { product: '30yr Conv.',     rate: 7.500, apr: 7.72, points: 0, monthlyPayment: 2973, loanTerm: 30, type: 'conventional' },
    ],
    compliance: [
      { label: 'TILA Disclosure Provided',        passed: true  },
      { label: 'RESPA GFE Delivered',             passed: true  },
      { label: 'TRID 3-Day Waiting Period',       passed: true  },
      { label: 'FHA MIP Disclosure',              passed: true  },
      { label: 'APR Within Tolerance (±0.125%)',  passed: true  },
      { label: 'Condo FHA Approval Status',       passed: false, note: 'Condo project FHA approval pending — confirm before close' },
    ],
  },
  {
    id: 'q-1003',
    borrowerName: 'James Whitfield',
    borrowerEmail: 'j.whitfield@outlook.com',
    borrowerPhone: '(628) 555-0319',
    loanAmount: 1_250_000,
    productType: 'jumbo',
    status: 'sent',
    createdAt: '2026-05-12 07:30',
    expiresAt: '2026-05-19 07:30',
    lastViewed: null,
    sentAt: '2026-05-12 07:45',
    acceptedAt: null,
    terms: '30yr fixed @ 7.375% (Jumbo)',
    interestRate: 7.375,
    apr: 7.52,
    monthlyPayment: 8633,
    loanTerm: 30,
    ltv: 70,
    creditScore: 798,
    propertyAddress: '88 Pacific Heights Blvd, San Francisco, CA 94115',
    propertyType: 'Single Family',
    followUpCount: 0,
    notes: 'High-net-worth client. Portfolio loan consideration on table.',
    rates: [
      { product: '30yr Jumbo Fixed', rate: 7.375, apr: 7.52, points: 0,   monthlyPayment: 8633, loanTerm: 30, type: 'jumbo' },
      { product: '30yr Jumbo Fixed', rate: 7.125, apr: 7.27, points: 1.5, monthlyPayment: 8449, loanTerm: 30, type: 'jumbo' },
      { product: '10/1 ARM',         rate: 6.875, apr: 7.40, points: 0,   monthlyPayment: 8206, loanTerm: 30, type: 'arm'   },
    ],
    compliance: [
      { label: 'TILA Disclosure Provided',       passed: true  },
      { label: 'RESPA GFE Delivered',            passed: true  },
      { label: 'TRID 3-Day Waiting Period',      passed: false, note: 'Quote sent before 3-business-day window closed — monitor timeline' },
      { label: 'Jumbo ATR Documentation',        passed: true  },
      { label: 'APR Within Tolerance (±0.125%)', passed: true  },
      { label: 'State Licensing Verified (CA)',   passed: true  },
    ],
  },
  {
    id: 'q-1004',
    borrowerName: 'Daniela Reyes',
    borrowerEmail: 'd.reyes@yahoo.com',
    borrowerPhone: '(925) 555-0488',
    loanAmount: 310_000,
    productType: 'va',
    status: 'draft',
    createdAt: '2026-05-12 11:00',
    expiresAt: '2026-05-19 11:00',
    lastViewed: null,
    sentAt: null,
    acceptedAt: null,
    terms: '30yr fixed @ 6.500% (VA)',
    interestRate: 6.500,
    apr: 6.72,
    monthlyPayment: 1960,
    loanTerm: 30,
    ltv: 100,
    creditScore: 701,
    propertyAddress: '1402 Concord Blvd, Concord, CA 94520',
    propertyType: 'Single Family',
    followUpCount: 0,
    notes: 'VA funding fee included. COE verified.',
    rates: [
      { product: '30yr VA Fixed', rate: 6.500, apr: 6.72, points: 0, monthlyPayment: 1960, loanTerm: 30, type: 'va' },
      { product: '15yr VA Fixed', rate: 5.875, apr: 6.10, points: 0, monthlyPayment: 2599, loanTerm: 15, type: 'va' },
    ],
    compliance: [
      { label: 'TILA Disclosure Provided',       passed: true  },
      { label: 'VA COE Verification',            passed: true  },
      { label: 'VA Funding Fee Disclosure',      passed: true  },
      { label: 'TRID 3-Day Waiting Period',      passed: true  },
      { label: 'APR Within Tolerance (±0.125%)', passed: true  },
      { label: 'State Licensing Verified (CA)',   passed: true  },
    ],
  },
  {
    id: 'q-1005',
    borrowerName: 'Thomas Nguyen',
    borrowerEmail: 't.nguyen@gmail.com',
    borrowerPhone: '(408) 555-0552',
    loanAmount: 540_000,
    productType: 'conventional',
    status: 'rejected',
    createdAt: '2026-05-11 14:00',
    expiresAt: '2026-05-18 14:00',
    lastViewed: '2026-05-11 16:30',
    sentAt: '2026-05-11 14:10',
    acceptedAt: null,
    terms: '30yr fixed @ 7.250%',
    interestRate: 7.250,
    apr: 7.48,
    monthlyPayment: 3684,
    loanTerm: 30,
    ltv: 85,
    creditScore: 680,
    propertyAddress: '720 E Hamilton Ave, San Jose, CA 95123',
    propertyType: 'Townhome',
    followUpCount: 2,
    notes: 'Borrower declined — rate too high. Consider refinancing scenario in 6–12 months.',
    rates: [
      { product: '30yr Fixed', rate: 7.250, apr: 7.48, points: 0, monthlyPayment: 3684, loanTerm: 30, type: 'conventional' },
    ],
    compliance: [
      { label: 'TILA Disclosure Provided',       passed: true  },
      { label: 'RESPA GFE Delivered',            passed: true  },
      { label: 'TRID 3-Day Waiting Period',      passed: true  },
      { label: 'APR Within Tolerance (±0.125%)', passed: true  },
      { label: 'State Licensing Verified (CA)',   passed: true  },
      { label: 'Adverse Action Notice Required', passed: false, note: 'Rejection triggers ECOA adverse action notice — send within 30 days' },
    ],
  },
  {
    id: 'q-1006',
    borrowerName: 'Aisha Johnson',
    borrowerEmail: 'aisha.j@icloud.com',
    borrowerPhone: '(510) 555-0614',
    loanAmount: 890_000,
    productType: 'jumbo',
    status: 'expired',
    createdAt: '2026-05-05 10:00',
    expiresAt: '2026-05-12 10:00',
    lastViewed: '2026-05-06 09:00',
    sentAt: '2026-05-05 10:15',
    acceptedAt: null,
    terms: '30yr fixed @ 7.500% (Jumbo)',
    interestRate: 7.500,
    apr: 7.64,
    monthlyPayment: 6224,
    loanTerm: 30,
    ltv: 75,
    creditScore: 744,
    propertyAddress: '3310 Broadway Terrace, Oakland, CA 94611',
    propertyType: 'Single Family',
    followUpCount: 3,
    notes: 'Quote expired. Borrower unresponsive after 3 follow-ups. Archive after 30 days.',
    rates: [
      { product: '30yr Jumbo Fixed', rate: 7.500, apr: 7.64, points: 0, monthlyPayment: 6224, loanTerm: 30, type: 'jumbo' },
    ],
    compliance: [
      { label: 'TILA Disclosure Provided',       passed: true  },
      { label: 'RESPA GFE Delivered',            passed: true  },
      { label: 'Quote Expiration Notice Sent',   passed: true  },
      { label: 'APR Within Tolerance (±0.125%)', passed: true  },
      { label: 'State Licensing Verified (CA)',   passed: true  },
      { label: 'Re-disclosure Required on Refresh', passed: false, note: 'New quote requires fresh TRID disclosures — cannot reuse expired package' },
    ],
  },
  {
    id: 'q-1007',
    borrowerName: 'Carlos Romero',
    borrowerEmail: 'c.romero@gmail.com',
    borrowerPhone: '(415) 555-0771',
    loanAmount: 195_000,
    productType: 'fha',
    status: 'accepted',
    createdAt: '2026-05-10 13:00',
    expiresAt: '2026-05-17 13:00',
    lastViewed: '2026-05-10 15:00',
    sentAt: '2026-05-10 13:10',
    acceptedAt: '2026-05-10 15:22',
    terms: '30yr fixed @ 7.000% (FHA)',
    interestRate: 7.000,
    apr: 7.74,
    monthlyPayment: 1297,
    loanTerm: 30,
    ltv: 96.5,
    creditScore: 621,
    propertyAddress: '88 Fruitvale Ave, Oakland, CA 94601',
    propertyType: 'Single Family',
    followUpCount: 0,
    notes: 'Down payment assistance grant applied. First-time homebuyer.',
    rates: [
      { product: '30yr FHA Fixed', rate: 7.000, apr: 7.74, points: 0, monthlyPayment: 1297, loanTerm: 30, type: 'fha' },
    ],
    compliance: [
      { label: 'TILA Disclosure Provided',       passed: true },
      { label: 'RESPA GFE Delivered',            passed: true },
      { label: 'FHA MIP Disclosure',             passed: true },
      { label: 'TRID 3-Day Waiting Period',      passed: true },
      { label: 'APR Within Tolerance (±0.125%)', passed: true },
      { label: 'State Licensing Verified (CA)',   passed: true },
    ],
  },
  {
    id: 'q-1008',
    borrowerName: 'Emily Park',
    borrowerEmail: 'emilypark@hotmail.com',
    borrowerPhone: '(650) 555-0893',
    loanAmount: 765_000,
    productType: 'conventional',
    status: 'sent',
    createdAt: '2026-05-12 10:30',
    expiresAt: '2026-05-19 10:30',
    lastViewed: null,
    sentAt: '2026-05-12 10:35',
    acceptedAt: null,
    terms: '15yr fixed @ 6.500%',
    interestRate: 6.500,
    apr: 6.72,
    monthlyPayment: 6670,
    loanTerm: 15,
    ltv: 78,
    creditScore: 812,
    propertyAddress: '450 Castro St, Mountain View, CA 94041',
    propertyType: 'Single Family',
    followUpCount: 0,
    notes: 'Excellent credit. Consider rate buydown scenario.',
    rates: [
      { product: '15yr Fixed', rate: 6.500, apr: 6.72, points: 0,   monthlyPayment: 6670, loanTerm: 15, type: 'conventional' },
      { product: '30yr Fixed', rate: 7.000, apr: 7.22, points: 0,   monthlyPayment: 5090, loanTerm: 30, type: 'conventional' },
      { product: '15yr Fixed', rate: 6.125, apr: 6.35, points: 1.0, monthlyPayment: 6506, loanTerm: 15, type: 'conventional' },
    ],
    compliance: [
      { label: 'TILA Disclosure Provided',       passed: true },
      { label: 'RESPA GFE Delivered',            passed: true },
      { label: 'TRID 3-Day Waiting Period',      passed: true },
      { label: 'APR Within Tolerance (±0.125%)', passed: true },
      { label: 'State Licensing Verified (CA)',   passed: true },
      { label: 'Rate Lock Disclosure',           passed: true },
    ],
  },
];

const metricsByRange: Record<TimeRange, {
  totalQuotes: number;
  pendingQuotes: number;
  avgValue: number;
  acceptanceRate: number;
  avgTimeToAcceptHrs: number;
  expirationRate: number;
  followUpEffectiveness: number;
}> = {
  '1h':  { totalQuotes: 3,  pendingQuotes: 2, avgValue: 633_000, acceptanceRate: 33.3, avgTimeToAcceptHrs: 2.5,  expirationRate: 0.0,  followUpEffectiveness: 0   },
  '6h':  { totalQuotes: 6,  pendingQuotes: 3, avgValue: 598_000, acceptanceRate: 33.3, avgTimeToAcceptHrs: 2.5,  expirationRate: 0.0,  followUpEffectiveness: 0   },
  '24h': { totalQuotes: 8,  pendingQuotes: 4, avgValue: 631_875, acceptanceRate: 37.5, avgTimeToAcceptHrs: 2.3,  expirationRate: 12.5, followUpEffectiveness: 33.3 },
  'all': { totalQuotes: 8,  pendingQuotes: 4, avgValue: 631_875, acceptanceRate: 37.5, avgTimeToAcceptHrs: 2.3,  expirationRate: 12.5, followUpEffectiveness: 33.3 },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function formatCurrencyFull(n: number): string {
  return `$${n.toLocaleString()}`;
}

function getAmountRange(amount: number): AmountRange {
  if (amount < 250_000)    return '<250k';
  if (amount < 500_000)    return '250k-500k';
  if (amount < 750_000)    return '500k-750k';
  if (amount < 1_000_000)  return '750k-1m';
  return '>1m';
}

function getStatusColors(status: QuoteStatus) {
  switch (status) {
    case 'draft':    return { badge: 'bg-slate-500/10 text-slate-400 border-slate-500/30',   dot: 'bg-slate-400',                       text: 'text-slate-400'   };
    case 'sent':     return { badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30',      dot: 'bg-blue-400',                        text: 'text-blue-400'    };
    case 'viewed':   return { badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',      dot: 'bg-cyan-400 animate-pulse',          text: 'text-cyan-400'    };
    case 'accepted': return { badge: 'bg-green-500/10 text-green-400 border-green-500/30',   dot: 'bg-green-400',                       text: 'text-green-400'   };
    case 'rejected': return { badge: 'bg-red-500/10 text-red-400 border-red-500/30',         dot: 'bg-red-400',                         text: 'text-red-400'     };
    case 'expired':  return { badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30', dot: 'bg-orange-400',                     text: 'text-orange-400'  };
  }
}

function getStatusIcon(status: QuoteStatus) {
  switch (status) {
    case 'draft':    return <FileText   size={13} className="text-slate-400" />;
    case 'sent':     return <Send       size={13} className="text-blue-400"  />;
    case 'viewed':   return <Eye        size={13} className="text-cyan-400"  />;
    case 'accepted': return <CheckCircle2 size={13} className="text-green-400" />;
    case 'rejected': return <XCircle   size={13} className="text-red-400"   />;
    case 'expired':  return <Clock      size={13} className="text-orange-400" />;
  }
}

function getProductColors(product: ProductType) {
  switch (product) {
    case 'conventional': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    case 'fha':          return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    case 'va':           return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'jumbo':        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'heloc':        return 'bg-pink-500/10 text-pink-400 border-pink-500/30';
    case 'arm':          return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
  }
}

const AMOUNT_RANGES: { label: AmountRange; min: number; max: number; color: string }[] = [
  { label: '<250k',     min: 0,           max: 250_000,    color: 'from-purple-500 to-purple-400' },
  { label: '250k-500k', min: 250_000,     max: 500_000,    color: 'from-cyan-500 to-cyan-400'    },
  { label: '500k-750k', min: 500_000,     max: 750_000,    color: 'from-pink-500 to-pink-400'    },
  { label: '750k-1m',   min: 750_000,     max: 1_000_000,  color: 'from-amber-500 to-amber-400'  },
  { label: '>1m',       min: 1_000_000,   max: Infinity,   color: 'from-emerald-500 to-emerald-400' },
];

const STATUS_BREAKDOWN: { status: QuoteStatus; color: string; barColor: string }[] = [
  { status: 'draft',    color: 'text-slate-400',  barColor: 'from-slate-500 to-slate-400'   },
  { status: 'sent',     color: 'text-blue-400',   barColor: 'from-blue-500 to-blue-400'     },
  { status: 'viewed',   color: 'text-cyan-400',   barColor: 'from-cyan-500 to-cyan-400'     },
  { status: 'accepted', color: 'text-green-400',  barColor: 'from-green-500 to-green-400'   },
  { status: 'rejected', color: 'text-red-400',    barColor: 'from-red-500 to-red-400'       },
  { status: 'expired',  color: 'text-orange-400', barColor: 'from-orange-500 to-orange-400' },
];

// ─── Histogram Component ──────────────────────────────────────────────────────

function LoanHistogram({ quotes }: { quotes: Quote[] }) {
  const buckets = AMOUNT_RANGES.map((r) => ({
    ...r,
    count: quotes.filter((q) => q.loanAmount >= r.min && q.loanAmount < r.max).length,
  }));
  const maxCount = Math.max(...buckets.map((b) => b.count), 1);

  return (
    <div className="space-y-3">
      {buckets.map((bucket) => (
        <div key={bucket.label}>
          <div className="flex items-center justify-between mb-1 text-xs">
            <span className="text-slate-400 font-mono">{bucket.label}</span>
            <span className="text-white font-bold">{bucket.count}</span>
          </div>
          <div className="w-full h-5 bg-slate-800 rounded overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${bucket.color} rounded transition-all duration-500`}
              style={{ width: `${(bucket.count / maxCount) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Donut Status Chart ───────────────────────────────────────────────────────

function StatusDonut({ quotes }: { quotes: Quote[] }) {
  const colorMap: Record<QuoteStatus, string> = {
    draft:    '#64748b',
    sent:     '#3b82f6',
    viewed:   '#22d3ee',
    accepted: '#22c55e',
    rejected: '#ef4444',
    expired:  '#f97316',
  };

  const total = quotes.length || 1;
  const slices = STATUS_BREAKDOWN.map((s) => ({
    status: s.status,
    count: quotes.filter((q) => q.status === s.status).length,
    color: colorMap[s.status],
  })).filter((s) => s.count > 0);

  let cumulative = 0;
  const cx = 50; const cy = 50; const r = 38;

  const paths = slices.map((slice) => {
    const pct = (slice.count / total) * 100;
    const startAngle = (cumulative / 100) * 360 - 90;
    cumulative += pct;
    const endAngle = (cumulative / 100) * 360 - 90;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad   = (endAngle   * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = pct > 50 ? 1 : 0;
    return { d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`, ...slice, pct };
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="w-40 h-40 mx-auto">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {paths.map((p, i) => (
            <path key={i} d={p.d} fill={p.color} opacity={0.85} className="hover:opacity-100 transition-opacity">
              <title>{p.status}: {p.count} ({p.pct.toFixed(1)}%)</title>
            </path>
          ))}
          <circle cx={cx} cy={cy} r={22} fill="#0a0a0f" />
          <text x={cx} y={cy - 3} textAnchor="middle" className="fill-white" style={{ fontSize: 8, fontWeight: 700 }}>
            {total}
          </text>
          <text x={cx} y={cy + 7} textAnchor="middle" style={{ fontSize: 5.5, fill: '#94a3b8' }}>
            QUOTES
          </text>
        </svg>
      </div>
      <div className="space-y-1.5">
        {STATUS_BREAKDOWN.map((s) => {
          const count = quotes.filter((q) => q.status === s.status).length;
          return (
            <div key={s.status} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: colorMap[s.status] }} />
                <span className="text-slate-300 capitalize">{s.status}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">{count}</span>
                <span className={`font-bold w-8 text-right ${s.color}`}>
                  {total > 0 ? ((count / total) * 100).toFixed(0) : 0}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Quote Comparison ─────────────────────────────────────────────────────────

function QuoteComparison({ quotes }: { quotes: Quote[] }) {
  // Group by borrower email and find borrowers with multiple quotes
  const grouped = quotes.reduce<Record<string, Quote[]>>((acc, q) => {
    acc[q.borrowerEmail] = acc[q.borrowerEmail] || [];
    acc[q.borrowerEmail].push(q);
    return acc;
  }, {});

  const multipleQuotes = Object.entries(grouped).filter(([, qs]) => qs.length > 1);

  if (multipleQuotes.length === 0) {
    return (
      <div className="p-4 rounded border border-slate-800 text-sm text-slate-500 text-center">
        No borrowers with multiple quotes in current filter.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {multipleQuotes.map(([email, qs]) => (
        <div key={email}>
          <p className="text-xs text-slate-500 mb-2 flex items-center gap-1.5">
            <User size={11} /> {qs[0].borrowerName} — {qs.length} quotes
          </p>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(qs.length, 3)}, 1fr)` }}>
            {qs.map((q) => {
              const sc = getStatusColors(q.status);
              return (
                <div key={q.id} className="p-3 rounded border border-slate-800 bg-slate-900/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-slate-500">{q.id}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded border font-medium capitalize ${sc.badge}`}>
                      {q.status}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white">{formatCurrency(q.loanAmount)}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{q.interestRate}% · {q.loanTerm}yr</p>
                  <p className="text-xs text-slate-500 mt-0.5">{q.productType.toUpperCase()}</p>
                  <p className="text-xs text-purple-400 mt-1 font-semibold">${q.monthlyPayment.toLocaleString()}/mo</p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function QuoteDetailModal({ quote, onClose, onAction }: {
  quote: Quote;
  onClose: () => void;
  onAction: (action: string, quoteId: string) => void;
}) {
  const sc = getStatusColors(quote.status);
  const complianceFailed = quote.compliance.filter((c) => !c.passed);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-black border border-purple-500/30 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 flex items-start justify-between p-6 border-b border-purple-500/20 bg-black/90 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded border ${sc.badge}`}>
              {getStatusIcon(quote.status)}
            </div>
            <div>
              <h2 className="text-white font-bold text-base">{quote.id} — {quote.borrowerName}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{quote.propertyAddress}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-red-500/20 rounded transition flex-shrink-0 ml-4"
          >
            <X size={18} className="text-red-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Borrower Info */}
          <div>
            <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider">Borrower Information</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: 'Name',          value: quote.borrowerName,  icon: <User size={11} />   },
                { label: 'Email',         value: quote.borrowerEmail, icon: <Mail size={11} />   },
                { label: 'Phone',         value: quote.borrowerPhone, icon: <MessageSquare size={11} /> },
                { label: 'Credit Score',  value: quote.creditScore.toString(), icon: <TrendingUp size={11} /> },
                { label: 'Property',      value: quote.propertyType,  icon: <Home size={11} />   },
                { label: 'LTV',           value: `${quote.ltv}%`,     icon: <Percent size={11} /> },
              ].map(({ label, value, icon }) => (
                <div key={label} className="p-3 rounded border border-slate-800 bg-slate-900/30">
                  <p className="text-xs text-slate-500 flex items-center gap-1 mb-1">{icon} {label}</p>
                  <p className="text-sm text-white font-semibold truncate">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quote Details */}
          <div>
            <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider">Quote Details</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Loan Amount',  value: formatCurrencyFull(quote.loanAmount), color: 'text-purple-400' },
                { label: 'Interest Rate', value: `${quote.interestRate}%`,            color: 'text-cyan-400'   },
                { label: 'APR',          value: `${quote.apr}%`,                      color: 'text-blue-400'   },
                { label: 'Monthly Pmt',  value: `$${quote.monthlyPayment.toLocaleString()}`, color: 'text-green-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="p-3 rounded border border-slate-800 text-center">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className={`text-xl font-bold ${color} mt-1`}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Product / Rate Options */}
          <div>
            <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider">Rate Options Presented</p>
            <div className="space-y-2">
              {quote.rates.map((rate, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 p-3 rounded border flex-wrap ${
                    i === 0 ? 'border-purple-500/40 bg-purple-500/5' : 'border-slate-800'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{rate.product}</span>
                      {i === 0 && <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">Selected</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-5 text-xs flex-shrink-0 flex-wrap">
                    <div className="text-center">
                      <p className="text-slate-500">Rate</p>
                      <p className="text-white font-bold">{rate.rate}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-500">APR</p>
                      <p className="text-blue-400 font-bold">{rate.apr}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-500">Points</p>
                      <p className="text-white font-bold">{rate.points}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-500">Mo. Payment</p>
                      <p className="text-green-400 font-bold">${rate.monthlyPayment.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-500">Term</p>
                      <p className="text-white font-bold">{rate.loanTerm}yr</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Checklist */}
          <div>
            <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <Shield size={12} /> Compliance Checklist
              {complianceFailed.length > 0 && (
                <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30">
                  {complianceFailed.length} issue{complianceFailed.length > 1 ? 's' : ''}
                </span>
              )}
            </p>
            <div className="space-y-2">
              {quote.compliance.map((check, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded border ${
                    check.passed
                      ? 'border-green-500/20 bg-green-500/5'
                      : 'border-red-500/30 bg-red-500/5'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {check.passed
                      ? <CheckCircle2 size={14} className="text-green-400" />
                      : <AlertCircle  size={14} className="text-red-400"   />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${check.passed ? 'text-green-300' : 'text-red-300'}`}>
                      {check.label}
                    </p>
                    {check.note && (
                      <p className="text-xs text-red-400 mt-0.5">{check.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider">Quote Timeline</p>
            <div className="space-y-2 text-xs">
              {[
                { label: 'Created',    value: quote.createdAt,    color: 'text-slate-400'  },
                { label: 'Sent',       value: quote.sentAt,       color: 'text-blue-400'   },
                { label: 'Last Viewed', value: quote.lastViewed,  color: 'text-cyan-400'   },
                { label: 'Accepted',   value: quote.acceptedAt,   color: 'text-green-400'  },
                { label: 'Expires',    value: quote.expiresAt,    color: 'text-orange-400' },
              ].filter((t) => t.value).map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between p-2.5 rounded border border-slate-800">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Clock size={11} /> {label}
                  </span>
                  <span className={`font-semibold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {quote.notes && (
            <div>
              <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Notes</p>
              <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 border border-slate-800 rounded p-3">
                {quote.notes}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-purple-500/20 flex flex-wrap gap-2">
            {quote.status === 'draft' && (
              <button
                onClick={() => onAction('send', quote.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition"
              >
                <Send size={14} /> Send Quote
              </button>
            )}
            {(quote.status === 'sent' || quote.status === 'viewed') && (
              <button
                onClick={() => onAction('reminder', quote.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded text-sm font-medium bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition"
              >
                <Mail size={14} /> Send Reminder
              </button>
            )}
            {quote.status !== 'accepted' && quote.status !== 'rejected' && (
              <button
                onClick={() => onAction('accept', quote.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded text-sm font-medium bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition"
              >
                <CheckCircle2 size={14} /> Mark Accepted
              </button>
            )}
            <button
              onClick={() => onAction('regenerate', quote.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded text-sm font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition"
            >
              <RefreshCw size={14} /> Regenerate
            </button>
            <button
              onClick={() => onAction('modify', quote.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded text-sm font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition"
            >
              <Zap size={14} /> Modify Terms
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function QuotesPage() {
  const [timeRange, setTimeRange]             = useState<TimeRange>('24h');
  const [selectedQuote, setSelectedQuote]     = useState<Quote | null>(null);
  const [filterStatus, setFilterStatus]       = useState<QuoteStatus | 'all'>('all');
  const [filterProduct, setFilterProduct]     = useState<ProductType | 'all'>('all');
  const [filterAmountRange, setFilterAmount]  = useState<AmountRange | 'all'>('all');
  const [searchQuery, setSearchQuery]         = useState('');
  const [showFilters, setShowFilters]         = useState(false);

  const metrics = metricsByRange[timeRange];

  // Apply filters
  const filteredQuotes = useMemo(() => {
    return QUOTES.filter((q) => {
      if (filterStatus !== 'all' && q.status !== filterStatus) return false;
      if (filterProduct !== 'all' && q.productType !== filterProduct) return false;
      if (filterAmountRange !== 'all') {
        const range = AMOUNT_RANGES.find((r) => r.label === filterAmountRange);
        if (range && (q.loanAmount < range.min || q.loanAmount >= range.max)) return false;
      }
      if (searchQuery) {
        const q2 = searchQuery.toLowerCase();
        if (
          !q.borrowerName.toLowerCase().includes(q2) &&
          !q.borrowerEmail.toLowerCase().includes(q2) &&
          !q.id.toLowerCase().includes(q2) &&
          !q.propertyAddress.toLowerCase().includes(q2)
        ) return false;
      }
      return true;
    });
  }, [filterStatus, filterProduct, filterAmountRange, searchQuery]);

  function handleAction(action: string, quoteId: string) {
    // In production these would call the API; for now show intent via console
    console.info(`Action "${action}" on quote ${quoteId}`);
    setSelectedQuote(null);
  }

  const hasActiveFilters = filterStatus !== 'all' || filterProduct !== 'all' || filterAmountRange !== 'all' || searchQuery !== '';

  return (
    <div className="space-y-8">
      <PageHeader
        title="Quotes"
        subtitle="Quote Analytics, Pipeline Management & Compliance Tracking"
      />

      {/* ── Time Range + Filter Bar ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Time Range */}
        <div className="flex gap-2">
          {(['1h', '6h', '24h', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                timeRange === range
                  ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                  : 'bg-gray-500/10 text-gray-400 border border-gray-500/20 hover:border-gray-500/30'
              }`}
            >
              {range === 'all' ? 'All Time' : range.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition border ${
            hasActiveFilters
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
              : 'bg-gray-500/10 text-gray-400 border-gray-500/20 hover:border-gray-500/30'
          }`}
        >
          <Filter size={14} />
          Filters
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          )}
          <ChevronDown size={12} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* ── Filter Panel ── */}
      {showFilters && (
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Search */}
              <div>
                <p className="text-xs text-slate-500 mb-1.5">Search</p>
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Name, email, ID..."
                    className="w-full pl-8 pr-3 py-1.5 text-sm rounded border border-slate-700 bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <p className="text-xs text-slate-500 mb-1.5">Status</p>
                <div className="flex flex-wrap gap-1">
                  {(['all', 'draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`px-2 py-0.5 rounded text-xs font-medium border transition capitalize ${
                        filterStatus === s
                          ? s === 'all'
                            ? 'bg-purple-500/30 text-purple-300 border-purple-500/50'
                            : getStatusColors(s as QuoteStatus).badge
                          : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Filter */}
              <div>
                <p className="text-xs text-slate-500 mb-1.5">Product Type</p>
                <div className="flex flex-wrap gap-1">
                  {(['all', 'conventional', 'fha', 'va', 'jumbo', 'arm', 'heloc'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setFilterProduct(p)}
                      className={`px-2 py-0.5 rounded text-xs font-medium border transition uppercase ${
                        filterProduct === p
                          ? p === 'all'
                            ? 'bg-purple-500/30 text-purple-300 border-purple-500/50'
                            : getProductColors(p as ProductType)
                          : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Range Filter */}
              <div>
                <p className="text-xs text-slate-500 mb-1.5">Loan Amount</p>
                <div className="flex flex-wrap gap-1">
                  {(['all', '<250k', '250k-500k', '500k-750k', '750k-1m', '>1m'] as const).map((a) => (
                    <button
                      key={a}
                      onClick={() => setFilterAmount(a)}
                      className={`px-2 py-0.5 rounded text-xs font-medium border transition font-mono ${
                        filterAmountRange === a
                          ? 'bg-purple-500/30 text-purple-300 border-purple-500/50'
                          : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                <p className="text-xs text-slate-500">{filteredQuotes.length} of {QUOTES.length} quotes shown</p>
                <button
                  onClick={() => { setFilterStatus('all'); setFilterProduct('all'); setFilterAmount('all'); setSearchQuery(''); }}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition"
                >
                  <X size={11} /> Clear filters
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Metrics Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <FileText size={14} /> Total Quotes
            </p>
            <p className="text-2xl font-bold text-purple-400">{metrics.totalQuotes}</p>
            <p className="text-xs text-slate-400 mt-1">in last {timeRange === 'all' ? 'all time' : timeRange}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <Clock size={14} /> Pending Quotes
            </p>
            <p className="text-2xl font-bold text-cyan-400">{metrics.pendingQuotes}</p>
            <p className="text-xs text-slate-400 mt-1">awaiting response</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <DollarSign size={14} /> Avg Quote Value
            </p>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(metrics.avgValue)}</p>
            <p className="text-xs text-slate-400 mt-1">loan amount average</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <Percent size={14} /> Acceptance Rate
            </p>
            <p className="text-2xl font-bold text-amber-400">{metrics.acceptanceRate}%</p>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
              <div
                className="bg-gradient-to-r from-amber-500 to-yellow-400 h-1.5 rounded-full"
                style={{ width: `${metrics.acceptanceRate}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Status Breakdown + Performance ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Status Donut */}
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <BarChart3 size={18} /> Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatusDonut quotes={filteredQuotes} />
          </CardContent>
        </Card>

        {/* Quote Performance */}
        <Card className="bg-card/40 backdrop-blur-md border border-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp size={18} /> Quote Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                {
                  label: 'Avg Time to Acceptance',
                  value: `${metrics.avgTimeToAcceptHrs}h`,
                  sub: 'from sent to accepted',
                  color: 'text-green-400',
                  icon: <Clock size={14} className="text-green-400" />,
                },
                {
                  label: 'Expiration Rate',
                  value: `${metrics.expirationRate}%`,
                  sub: 'quotes expired unactioned',
                  color: metrics.expirationRate > 20 ? 'text-red-400' : metrics.expirationRate > 10 ? 'text-orange-400' : 'text-green-400',
                  icon: <AlertTriangle size={14} className="text-orange-400" />,
                },
                {
                  label: 'Follow-up Effectiveness',
                  value: `${metrics.followUpEffectiveness}%`,
                  sub: 'converted after follow-up',
                  color: 'text-cyan-400',
                  icon: <Mail size={14} className="text-cyan-400" />,
                },
              ].map(({ label, value, sub, color, icon }) => (
                <div key={label} className="p-4 rounded border border-slate-800 bg-slate-900/30 text-center">
                  <div className="flex justify-center mb-2">{icon}</div>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-slate-400 font-medium mt-1">{label}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>

            {/* Status bar breakdown */}
            <div className="space-y-2">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Volume by Status</p>
              {STATUS_BREAKDOWN.map((s) => {
                const count = filteredQuotes.filter((q) => q.status === s.status).length;
                const pct = filteredQuotes.length > 0 ? (count / filteredQuotes.length) * 100 : 0;
                return (
                  <div key={s.status}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(s.status)}
                        <span className={`capitalize ${s.color}`}>{s.status}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500">{count} quotes</span>
                        <span className={`font-bold w-8 text-right ${s.color}`}>{pct.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${s.barColor} rounded-full transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Loan Amount Distribution + Quote Comparison ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Histogram */}
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <BarChart3 size={18} /> Loan Amount Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LoanHistogram quotes={filteredQuotes} />
            <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-3 gap-3 text-center text-xs">
              {[
                { label: 'Min',    value: formatCurrency(Math.min(...filteredQuotes.map((q) => q.loanAmount), 0)) },
                { label: 'Median', value: formatCurrency(filteredQuotes.length > 0 ? [...filteredQuotes].sort((a, b) => a.loanAmount - b.loanAmount)[Math.floor(filteredQuotes.length / 2)]?.loanAmount ?? 0 : 0) },
                { label: 'Max',    value: formatCurrency(Math.max(...filteredQuotes.map((q) => q.loanAmount), 0)) },
              ].map(({ label, value }) => (
                <div key={label} className="p-2 rounded border border-slate-800">
                  <p className="text-slate-500">{label}</p>
                  <p className="text-white font-bold mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quote Comparison */}
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Eye size={18} /> Quote Comparison (Same Borrower)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QuoteComparison quotes={filteredQuotes} />
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Quotes Table ── */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText size={18} /> Recent Quotes
            </CardTitle>
            <span className="text-xs text-slate-500">{filteredQuotes.length} quotes</span>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 border-b border-slate-800">
                  <th className="text-left pb-3 pr-4 font-medium">Borrower</th>
                  <th className="text-left pb-3 pr-4 font-medium">Amount</th>
                  <th className="text-left pb-3 pr-4 font-medium">Terms</th>
                  <th className="text-left pb-3 pr-4 font-medium">Product</th>
                  <th className="text-left pb-3 pr-4 font-medium">Status</th>
                  <th className="text-left pb-3 pr-4 font-medium">Created</th>
                  <th className="text-left pb-3 pr-4 font-medium">Expires</th>
                  <th className="text-left pb-3 font-medium">Last Viewed</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredQuotes.map((quote) => {
                  const sc = getStatusColors(quote.status);
                  const compliancePassed = quote.compliance.every((c) => c.passed);
                  return (
                    <tr
                      key={quote.id}
                      className="hover:bg-slate-900/40 transition group cursor-pointer"
                      onClick={() => setSelectedQuote(quote)}
                    >
                      <td className="py-3 pr-4">
                        <div>
                          <p className="text-white font-semibold">{quote.borrowerName}</p>
                          <p className="text-xs text-slate-500">{quote.borrowerEmail}</p>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="text-white font-bold">{formatCurrency(quote.loanAmount)}</p>
                        <p className="text-xs text-slate-500">${quote.monthlyPayment.toLocaleString()}/mo</p>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="text-slate-300 text-xs font-mono">{quote.terms}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs px-2 py-0.5 rounded border font-medium uppercase ${getProductColors(quote.productType)}`}>
                          {quote.productType}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${sc.dot}`} />
                          <span className={`text-xs px-1.5 py-0.5 rounded border font-medium capitalize ${sc.badge}`}>
                            {quote.status}
                          </span>
                          {!compliancePassed && (
                            <AlertCircle size={12} className="text-red-400 ml-1" title="Compliance issues" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="text-xs text-slate-400">{quote.createdAt}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="text-xs text-orange-400">{quote.expiresAt}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="text-xs text-slate-400">
                          {quote.lastViewed ?? <span className="text-slate-600">—</span>}
                        </p>
                      </td>
                      <td className="py-3">
                        <ChevronRight size={14} className="text-slate-600 group-hover:text-purple-400 transition" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredQuotes.length === 0 && (
              <div className="py-12 text-center text-slate-500">
                <FileText size={28} className="mx-auto mb-3 text-slate-700" />
                <p className="text-sm">No quotes match the current filters.</p>
              </div>
            )}
          </div>

          {/* Mobile Card List */}
          <div className="lg:hidden space-y-3">
            {filteredQuotes.map((quote) => {
              const sc = getStatusColors(quote.status);
              const compliancePassed = quote.compliance.every((c) => c.passed);
              return (
                <button
                  key={quote.id}
                  onClick={() => setSelectedQuote(quote)}
                  className="w-full text-left p-4 rounded border border-slate-800 hover:border-purple-500/40 hover:bg-purple-500/5 transition group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold text-white">{quote.borrowerName}</p>
                      <p className="text-xs text-slate-500">{quote.id}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded border font-medium capitalize ${sc.badge}`}>
                        {quote.status}
                      </span>
                      {!compliancePassed && <AlertCircle size={12} className="text-red-400" />}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-slate-500">Amount</p>
                      <p className="text-white font-bold">{formatCurrency(quote.loanAmount)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Rate</p>
                      <p className="text-purple-400 font-bold">{quote.interestRate}%</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Mo. Pmt</p>
                      <p className="text-green-400 font-bold">${quote.monthlyPayment.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-600">
                    <span>{quote.createdAt}</span>
                    <ChevronRight size={12} className="text-slate-600 group-hover:text-purple-400 transition" />
                  </div>
                </button>
              );
            })}

            {filteredQuotes.length === 0 && (
              <div className="py-8 text-center text-slate-500 text-sm">No quotes match the current filters.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Compliance Summary Banner ── */}
      {(() => {
        const quotesWithIssues = filteredQuotes.filter((q) => q.compliance.some((c) => !c.passed));
        if (quotesWithIssues.length === 0) return null;
        return (
          <Card className="bg-card/40 backdrop-blur-md border border-red-500/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-red-300">
                    Compliance Review Required — {quotesWithIssues.length} quote{quotesWithIssues.length > 1 ? 's' : ''} with issues
                  </p>
                  <div className="mt-2 space-y-1">
                    {quotesWithIssues.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => setSelectedQuote(q)}
                        className="flex items-center gap-2 text-xs text-slate-400 hover:text-red-300 transition"
                      >
                        <AlertCircle size={11} className="text-red-400 flex-shrink-0" />
                        <span className="font-mono text-slate-500">{q.id}</span>
                        <span>{q.borrowerName}</span>
                        <span className="text-slate-600">—</span>
                        <span className="text-red-400">
                          {q.compliance.filter((c) => !c.passed).length} issue{q.compliance.filter((c) => !c.passed).length > 1 ? 's' : ''}
                        </span>
                        <ChevronRight size={10} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* ── Quote Detail Modal ── */}
      {selectedQuote && (
        <QuoteDetailModal
          quote={selectedQuote}
          onClose={() => setSelectedQuote(null)}
          onAction={handleAction}
        />
      )}
    </div>
  );
}
