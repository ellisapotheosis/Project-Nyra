'use client';

import { useState } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  BarChart3,
  TrendingUp,
  Archive,
  Shield,
  Eye,
  XCircle,
  Loader2,
  FileImage,
  FileType,
  Layers,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';

type TimeRange = '1h' | '6h' | '24h';
type DocStatus = 'uploading' | 'processing' | 'completed' | 'failed' | 'archived';
type ProcessingStage = 'uploading' | 'ocr' | 'extraction' | 'validation' | 'indexing' | 'complete' | 'failed';

interface ProcessingQueueItem {
  id: string;
  name: string;
  format: string;
  pages: number;
  stage: ProcessingStage;
  progress: number;
  estimatedRemaining: string;
  uploadedAt: string;
}

interface HistoryItem {
  id: string;
  name: string;
  uploadedDate: string;
  fileSize: string;
  pages: number;
  format: string;
  status: DocStatus;
  ocrQuality: number;
}

interface DocumentDetail {
  id: string;
  name: string;
  format: string;
  pages: number;
  fileSize: string;
  uploadedDate: string;
  status: DocStatus;
  ocrQuality: number;
  ocrPreview: string;
  extractedFields: { label: string; value: string; confidence: number }[];
  retentionStatus: string;
  piiDetected: string[];
  regulatoryClass: string;
}

interface ProcessingError {
  type: string;
  count: number;
  trend: 'up' | 'down' | 'flat';
  lastSeen: string;
  example: string;
}

const queueItems: ProcessingQueueItem[] = [
  { id: 'q1', name: 'W2_Johnson_2025.pdf', format: 'PDF', pages: 4, stage: 'ocr', progress: 62, estimatedRemaining: '0m 48s', uploadedAt: '10:52 AM' },
  { id: 'q2', name: 'BankStatement_Chase_Mar.pdf', format: 'PDF', pages: 12, stage: 'extraction', progress: 78, estimatedRemaining: '0m 22s', uploadedAt: '10:50 AM' },
  { id: 'q3', name: 'DriversLicense_scan.png', format: 'PNG', pages: 1, stage: 'validation', progress: 91, estimatedRemaining: '0m 09s', uploadedAt: '10:49 AM' },
  { id: 'q4', name: 'TaxReturn_1040_2024.pdf', format: 'PDF', pages: 8, stage: 'uploading', progress: 18, estimatedRemaining: '2m 15s', uploadedAt: '10:53 AM' },
  { id: 'q5', name: 'PayStub_March_Nguyen.jpg', format: 'JPG', pages: 2, stage: 'indexing', progress: 97, estimatedRemaining: '0m 03s', uploadedAt: '10:48 AM' },
];

const historyItems: HistoryItem[] = [
  { id: 'h1', name: 'Appraisal_Report_Marina.pdf', uploadedDate: '2026-05-12 09:14', fileSize: '4.2 MB', pages: 32, format: 'PDF', status: 'completed', ocrQuality: 98.4 },
  { id: 'h2', name: 'Insurance_Cert_Allstate.pdf', uploadedDate: '2026-05-12 08:55', fileSize: '0.8 MB', pages: 6, format: 'PDF', status: 'completed', ocrQuality: 96.1 },
  { id: 'h3', name: 'EmploymentLetter_FBO.docx', uploadedDate: '2026-05-12 08:31', fileSize: '0.2 MB', pages: 2, format: 'DOCX', status: 'completed', ocrQuality: 99.7 },
  { id: 'h4', name: 'Paystub_blurry_scan.jpg', uploadedDate: '2026-05-12 07:58', fileSize: '1.1 MB', pages: 1, format: 'JPG', status: 'failed', ocrQuality: 34.2 },
  { id: 'h5', name: 'TaxReturn_2023_Reyes.pdf', uploadedDate: '2026-05-11 16:40', fileSize: '2.9 MB', pages: 18, format: 'PDF', status: 'archived', ocrQuality: 97.8 },
  { id: 'h6', name: 'BankStatement_Wells_Q1.pdf', uploadedDate: '2026-05-11 15:22', fileSize: '3.5 MB', pages: 24, format: 'PDF', status: 'completed', ocrQuality: 95.3 },
];

const processingErrors: ProcessingError[] = [
  { type: 'OCR Confidence Too Low', count: 14, trend: 'down', lastSeen: '07:58 AM', example: 'Blurry scan; resolution below 150 DPI threshold' },
  { type: 'Unsupported Format', count: 7, trend: 'flat', lastSeen: '2026-05-11 14:22', example: 'HEIC image format not yet in processing pipeline' },
  { type: 'Corrupted File', count: 3, trend: 'down', lastSeen: '2026-05-10 11:05', example: 'PDF cross-reference table invalid' },
  { type: 'Password Protected', count: 9, trend: 'up', lastSeen: '10:40 AM', example: 'Encrypted PDF requires owner password' },
  { type: 'Page Count Exceeded', count: 2, trend: 'flat', lastSeen: '2026-05-09 09:30', example: 'Document >200 pages; exceeds single-job limit' },
];

const documentDetails: Record<string, DocumentDetail> = {
  h1: {
    id: 'h1',
    name: 'Appraisal_Report_Marina.pdf',
    format: 'PDF',
    pages: 32,
    fileSize: '4.2 MB',
    uploadedDate: '2026-05-12 09:14',
    status: 'completed',
    ocrQuality: 98.4,
    ocrPreview: 'UNIFORM RESIDENTIAL APPRAISAL REPORT\nFile No.: APR-2026-04892\nProperty Address: 421 Marina Blvd, San Francisco, CA 94123\nLegal Description: Lot 12, Block 44A, Marina District\nAssessed Value: $1,240,000\nAppraiser Opinion of Value: $1,285,000\nEffective Date: May 10, 2026...',
    extractedFields: [
      { label: 'Property Address', value: '421 Marina Blvd, San Francisco, CA 94123', confidence: 99.1 },
      { label: 'Appraised Value', value: '$1,285,000', confidence: 98.7 },
      { label: 'Effective Date', value: '2026-05-10', confidence: 99.4 },
      { label: 'Appraiser License', value: 'CA-AG-0048291', confidence: 97.2 },
      { label: 'Property Type', value: 'Single Family Residential', confidence: 98.9 },
    ],
    retentionStatus: 'Active — expires 2033-05-12',
    piiDetected: ['Borrower Name', 'Property Address', 'SSN (masked)'],
    regulatoryClass: 'FIRREA Compliant Appraisal',
  },
  h4: {
    id: 'h4',
    name: 'Paystub_blurry_scan.jpg',
    format: 'JPG',
    pages: 1,
    fileSize: '1.1 MB',
    uploadedDate: '2026-05-12 07:58',
    status: 'failed',
    ocrQuality: 34.2,
    ocrPreview: '[OCR FAILED — Image resolution insufficient]\nConfidence: 34.2% — below 70% acceptance threshold\nDetected noise: excessive JPEG compression artifacts\nRecommendation: Re-upload at 300 DPI or higher resolution scan',
    extractedFields: [
      { label: 'Employer Name', value: '(unreadable)', confidence: 21.0 },
      { label: 'Gross Pay', value: '(unreadable)', confidence: 18.5 },
      { label: 'Pay Period', value: '(unreadable)', confidence: 29.1 },
    ],
    retentionStatus: 'Failed — pending re-submission',
    piiDetected: [],
    regulatoryClass: 'Unclassified — processing incomplete',
  },
};

const throughputByType: { type: string; docsPerHour: number; avgTime: string; color: string }[] = [
  { type: 'PDF (text)', docsPerHour: 48, avgTime: '1m 15s', color: 'from-cyan-500 to-blue-500' },
  { type: 'PDF (scanned)', docsPerHour: 22, avgTime: '2m 42s', color: 'from-purple-500 to-pink-400' },
  { type: 'JPEG/PNG', docsPerHour: 34, avgTime: '1m 48s', color: 'from-pink-400 to-rose-500' },
  { type: 'DOCX/TXT', docsPerHour: 61, avgTime: '0m 58s', color: 'from-green-500 to-emerald-400' },
];

const statusBreakdown: { label: string; count: number; color: string; bg: string }[] = [
  { label: 'Uploading', count: 2, color: 'text-blue-400', bg: 'bg-blue-500' },
  { label: 'Processing', count: 5, color: 'text-yellow-400', bg: 'bg-yellow-500' },
  { label: 'Completed', count: 147, color: 'text-green-400', bg: 'bg-green-500' },
  { label: 'Failed', count: 14, color: 'text-red-400', bg: 'bg-red-500' },
  { label: 'Archived', count: 38, color: 'text-slate-400', bg: 'bg-slate-500' },
];

const metricsByRange: Record<TimeRange, { processed: number; queue: number; successRate: string; avgTime: string }> = {
  '1h': { processed: 23, queue: 5, successRate: '95.7%', avgTime: '1m 52s' },
  '6h': { processed: 118, queue: 5, successRate: '94.1%', avgTime: '2m 04s' },
  '24h': { processed: 412, queue: 5, successRate: '96.6%', avgTime: '1m 58s' },
};

function getStageLabel(stage: ProcessingStage): string {
  const labels: Record<ProcessingStage, string> = {
    uploading: 'Uploading',
    ocr: 'OCR Scan',
    extraction: 'Field Extraction',
    validation: 'Validation',
    indexing: 'Indexing',
    complete: 'Complete',
    failed: 'Failed',
  };
  return labels[stage];
}

function getStageColor(stage: ProcessingStage): string {
  switch (stage) {
    case 'uploading': return 'text-blue-400';
    case 'ocr': return 'text-cyan-400';
    case 'extraction': return 'text-purple-400';
    case 'validation': return 'text-yellow-400';
    case 'indexing': return 'text-pink-400';
    case 'complete': return 'text-green-400';
    case 'failed': return 'text-red-400';
  }
}

function getDocStatusConfig(status: DocStatus) {
  switch (status) {
    case 'completed': return { label: 'Completed', color: 'bg-green-500/10 text-green-400 border-green-500/30', icon: <CheckCircle2 size={13} className="text-green-400" /> };
    case 'failed': return { label: 'Failed', color: 'bg-red-500/10 text-red-400 border-red-500/30', icon: <XCircle size={13} className="text-red-400" /> };
    case 'processing': return { label: 'Processing', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', icon: <Loader2 size={13} className="text-yellow-400 animate-spin" /> };
    case 'uploading': return { label: 'Uploading', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: <Upload size={13} className="text-blue-400" /> };
    case 'archived': return { label: 'Archived', color: 'bg-slate-500/10 text-slate-400 border-slate-500/30', icon: <Archive size={13} className="text-slate-400" /> };
  }
}

function getFormatIcon(format: string) {
  if (format === 'PDF') return <FileType size={14} className="text-rose-400" />;
  if (format === 'DOCX') return <FileText size={14} className="text-blue-400" />;
  return <FileImage size={14} className="text-amber-400" />;
}

function getOcrQualityColor(score: number): string {
  if (score >= 90) return 'text-green-400';
  if (score >= 70) return 'text-yellow-400';
  if (score >= 50) return 'text-orange-400';
  return 'text-red-400';
}

function getTrendIcon(trend: 'up' | 'down' | 'flat') {
  if (trend === 'up') return <TrendingUp size={12} className="text-red-400" />;
  if (trend === 'down') return <TrendingUp size={12} className="text-green-400 rotate-180" />;
  return <Activity size={12} className="text-slate-400" />;
}

export default function PaperclipPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [selectedDoc, setSelectedDoc] = useState<DocumentDetail | null>(null);

  const metrics = metricsByRange[timeRange];
  const totalDocs = statusBreakdown.reduce((a, b) => a + b.count, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Paperclip"
        subtitle="Document Processing & Management — OCR Pipeline, Extraction, Compliance Metadata"
      />

      {/* Time Range Selector */}
      <div className="flex gap-2 justify-end">
        {(['1h', '6h', '24h'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded text-sm font-medium transition ${
              timeRange === range
                ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                : 'bg-gray-500/10 text-gray-400 border border-gray-500/20 hover:border-gray-500/30'
            }`}
          >
            {range.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <FileText size={14} /> Documents Processed
            </p>
            <p className="text-2xl font-bold text-cyan-400">{metrics.processed}</p>
            <p className="text-xs text-slate-400 mt-1">in last {timeRange}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <Layers size={14} /> Processing Queue
            </p>
            <p className="text-2xl font-bold text-yellow-400">{metrics.queue}</p>
            <p className="text-xs text-slate-400 mt-1">active jobs</p>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <CheckCircle2 size={14} /> Success Rate
            </p>
            <p className="text-2xl font-bold text-green-400">{metrics.successRate}</p>
            <p className="text-xs text-slate-400 mt-1">OCR accepted</p>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <Clock size={14} /> Avg Processing Time
            </p>
            <p className="text-2xl font-bold text-purple-400">{metrics.avgTime}</p>
            <p className="text-xs text-slate-400 mt-1">per document</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <BarChart3 size={18} /> Document Status Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Visual Bar */}
            <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
              {statusBreakdown.map((s) => (
                <div
                  key={s.label}
                  className={`${s.bg} opacity-80 hover:opacity-100 transition`}
                  style={{ width: `${(s.count / totalDocs) * 100}%` }}
                  title={`${s.label}: ${s.count}`}
                />
              ))}
            </div>
            {/* Legend */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {statusBreakdown.map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${s.bg} flex-shrink-0`} />
                  <div>
                    <p className={`text-sm font-bold ${s.color}`}>{s.count}</p>
                    <p className="text-xs text-slate-500">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Processing Queue */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Loader2 size={18} className="animate-spin text-yellow-400" /> Active Processing Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {queueItems.map((item) => (
              <div key={item.id} className="p-4 rounded border border-slate-800 hover:border-slate-700 transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getFormatIcon(item.format)}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.format} · {item.pages}p · uploaded {item.uploadedAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right ml-4">
                    <span className={`text-xs font-semibold ${getStageColor(item.stage)}`}>
                      {getStageLabel(item.stage)}
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">~{item.estimatedRemaining} left</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Progress</span>
                    <span className="text-cyan-400 font-semibold">{item.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-400 h-1.5 rounded-full transition-all"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document History / Archive */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Archive size={18} /> Document History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {historyItems.map((item) => {
              const statusCfg = getDocStatusConfig(item.status);
              const detail = documentDetails[item.id];
              return (
                <button
                  key={item.id}
                  onClick={() => detail ? setSelectedDoc(detail) : undefined}
                  className={`w-full text-left p-4 rounded border border-slate-800 hover:border-slate-700 hover:bg-slate-900/40 transition group ${detail ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <div className="flex items-center gap-3">
                    {getFormatIcon(item.format)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-white group-hover:text-cyan-400 truncate">{item.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded border flex items-center gap-1 ${statusCfg.color}`}>
                          {statusCfg.icon} {statusCfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.uploadedDate} · {item.fileSize} · {item.pages}p · {item.format}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-bold ${getOcrQualityColor(item.ocrQuality)}`}>
                        {item.ocrQuality}%
                      </p>
                      <p className="text-xs text-slate-500">OCR quality</p>
                    </div>
                    {detail && (
                      <Eye size={14} className="text-slate-600 group-hover:text-cyan-400 transition flex-shrink-0 ml-1" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Processing Performance Metrics */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <TrendingUp size={18} /> Processing Performance by Document Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {throughputByType.map((t) => {
              const maxDocsPerHour = Math.max(...throughputByType.map((x) => x.docsPerHour));
              const barWidth = (t.docsPerHour / maxDocsPerHour) * 100;
              return (
                <div key={t.type} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{t.type}</span>
                    <div className="flex items-center gap-4 text-slate-500">
                      <span className="text-cyan-400 font-semibold">{t.docsPerHour} docs/hr</span>
                      <span>avg {t.avgTime}</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className={`bg-gradient-to-r ${t.color} h-2 rounded-full`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Processing Errors Summary */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertTriangle size={18} className="text-orange-400" /> Processing Errors — Most Common Failures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {processingErrors.map((err) => (
              <div key={err.type} className="flex items-start gap-4 p-4 rounded border border-slate-800 hover:border-slate-700 transition">
                <div className="flex-shrink-0 mt-0.5">
                  <AlertCircle size={16} className="text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-white">{err.type}</p>
                    <span className="flex items-center gap-1">{getTrendIcon(err.trend)}</span>
                  </div>
                  <p className="text-xs text-slate-400">{err.example}</p>
                  <p className="text-xs text-slate-600 mt-1">Last seen: {err.lastSeen}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-orange-400">{err.count}</p>
                  <p className="text-xs text-slate-500">occurrences</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Metadata */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Shield size={18} className="text-purple-400" /> Compliance Metadata Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded border border-purple-500/20 bg-purple-500/5">
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                <Archive size={12} /> Retention Status
              </p>
              <p className="text-sm font-bold text-purple-300">147 Active</p>
              <p className="text-xs text-slate-400 mt-1">38 Archived · 2 Expiring soon</p>
            </div>
            <div className="p-4 rounded border border-pink-500/20 bg-pink-500/5">
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                <Eye size={12} /> PII Detection
              </p>
              <p className="text-sm font-bold text-pink-300">All Docs Scanned</p>
              <p className="text-xs text-slate-400 mt-1">SSN masked · 98.4% detection rate</p>
            </div>
            <div className="p-4 rounded border border-cyan-500/20 bg-cyan-500/5">
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                <Shield size={12} /> Regulatory Class
              </p>
              <p className="text-sm font-bold text-cyan-300">FIRREA / TRID</p>
              <p className="text-xs text-slate-400 mt-1">14 unclassified · needs review</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Detail Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedDoc(null)}>
          <div
            className="bg-black/95 border border-purple-500/30 rounded-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-purple-500/20">
              <div className="flex items-center gap-2">
                {getFormatIcon(selectedDoc.format)}
                <div>
                  <h2 className="text-white font-semibold">{selectedDoc.name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedDoc.format} · {selectedDoc.pages}p · {selectedDoc.fileSize} · {selectedDoc.uploadedDate}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="text-gray-400 hover:text-white transition ml-4 flex-shrink-0">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status + OCR Quality */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {getDocStatusConfig(selectedDoc.status).icon}
                    <span className="text-sm font-semibold text-white capitalize">{selectedDoc.status}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">OCR Quality Score</p>
                  <p className={`text-lg font-bold ${getOcrQualityColor(selectedDoc.ocrQuality)}`}>
                    {selectedDoc.ocrQuality}%
                  </p>
                </div>
              </div>

              {/* OCR Preview */}
              <div>
                <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                  <Eye size={12} /> OCR Preview
                </p>
                <div className="p-3 rounded bg-slate-900/60 border border-slate-700 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
                  {selectedDoc.ocrPreview}
                </div>
              </div>

              {/* Extracted Fields */}
              <div>
                <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                  <FileText size={12} /> Extracted Fields
                </p>
                <div className="space-y-2">
                  {selectedDoc.extractedFields.map((field) => (
                    <div key={field.label} className="flex items-center justify-between p-2 rounded border border-slate-800">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500">{field.label}</p>
                        <p className="text-sm text-white truncate">{field.value}</p>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <p className={`text-xs font-semibold ${getOcrQualityColor(field.confidence)}`}>
                          {field.confidence}%
                        </p>
                        <p className="text-xs text-slate-600">confidence</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance Metadata */}
              <div className="pt-4 border-t border-purple-500/20 space-y-3">
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Shield size={12} /> Compliance Metadata
                </p>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex justify-between p-2 rounded border border-slate-800">
                    <span className="text-xs text-slate-500">Retention</span>
                    <span className="text-xs text-purple-300 font-medium">{selectedDoc.retentionStatus}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded border border-slate-800">
                    <span className="text-xs text-slate-500">PII Detected</span>
                    <span className="text-xs text-pink-300 font-medium">
                      {selectedDoc.piiDetected.length > 0 ? selectedDoc.piiDetected.join(', ') : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 rounded border border-slate-800">
                    <span className="text-xs text-slate-500">Regulatory Class</span>
                    <span className="text-xs text-cyan-300 font-medium">{selectedDoc.regulatoryClass}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
