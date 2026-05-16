'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@nyra/ui";
import { Badge } from "@nyra/ui";
import { Button } from "@nyra/ui";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  ChevronRight,
  Send,
  FileText,
  ShieldCheck,
  Zap
} from "lucide-react";
import { ComparisonResponse, LoanType } from "@/lib/api/quotes";

interface QuoteComparisonGridProps {
  data: ComparisonResponse;
  onApprove: (loanType: LoanType) => void;
  isApproving?: boolean;
}

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function QuoteComparisonGrid({ data, onApprove, isApproving }: QuoteComparisonGridProps) {
  const loanTypes: LoanType[] = ["conventional", "fha", "va", "usda"];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {loanTypes.map((type) => {
          const result = data.comparison[type];
          if (!result) return null;

          return (
            <Card
              key={type}
              className={`relative overflow-hidden transition-all hover:shadow-2xl border-border/50 backdrop-blur-md ${
                result.available
                  ? 'border-t-4 border-t-primary shadow-xl bg-card/40'
                  : 'opacity-60 bg-muted/20 grayscale border-t-4 border-t-destructive/30'
              }`}
            >
              {result.available && type === 'conventional' && (
                <div className="absolute top-0 right-0">
                  <Badge className="bg-primary text-white rounded-none rounded-bl-xl text-[9px] font-black uppercase tracking-widest px-3 py-1 shadow-lg shadow-primary/20">MOST_FAVORABLE</Badge>
                </div>
              )}

              <CardHeader className="pb-4 border-b border-border/30 bg-background/20">
                <div className="flex items-center justify-between mb-2">
                   <Badge variant="outline" className={`uppercase text-[9px] font-black tracking-widest ${
                     result.available ? 'bg-primary/10 text-primary border-primary/30' : 'bg-muted/50 text-muted-foreground border-border'
                   }`}>
                    {type}
                  </Badge>
                  {result.available ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-300 shadow-[0_0_8px_rgba(20,184,166,0.6)]" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  )}
                </div>
                <CardTitle className="text-2xl font-black text-foreground uppercase tracking-tighter">
                  {result.available ? currency(result.monthly_payment || 0) : 'INELIGIBLE'}
                </CardTitle>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1">MONTHLY_PITI</p>
              </CardHeader>

              <CardContent className="space-y-6 pt-6">
                {!result.available ? (
                  <div className="py-8 text-center space-y-3">
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-destructive/20 to-transparent mb-4" />
                    <p className="text-[10px] font-black text-destructive uppercase tracking-widest leading-relaxed px-4">{result.error || 'Does not meet program guidelines'}</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                       <div className="flex justify-between text-[11px] font-bold uppercase tracking-tight">
                        <span className="text-muted-foreground">Upfront_Fees</span>
                        <span className="text-foreground">{currency(result.upfront_fees || 0)}</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-bold uppercase tracking-tight">
                        <span className="text-muted-foreground">Financed_Principal</span>
                        <span className="text-foreground">{currency(result.financed_amount || 0)}</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-widest border-t border-border/30 pt-3 text-emerald-300">
                        <span>Total_Volume</span>
                        <span>{currency(result.total_paid || 0)}</span>
                      </div>
                    </div>

                    <div className="pt-4 space-y-4">
                      <div className="flex flex-col space-y-2 bg-background/40 p-3 rounded-lg border border-border/30 shadow-inner">
                        <p className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center">
                          <ShieldCheck className="mr-1.5 h-3 w-3" /> Core_Assumptions
                        </p>
                        <ul className="text-[9px] space-y-1.5 font-bold uppercase tracking-tighter">
                           {result.summary?.assumptions && Object.entries(result.summary.assumptions).slice(0, 3).map(([key, val]: [string, any]) => (
                             <li key={key} className="flex justify-between text-muted-foreground">
                               <span>{key.replace(/_/g, ' ')}</span>
                               <span className="text-foreground">{typeof val === 'boolean' ? (val ? 'YES' : 'NO') : val}</span>
                             </li>
                           ))}
                        </ul>
                      </div>

                      <Button
                        onClick={() => onApprove(type)}
                        className="w-full h-11 rounded-lg font-black bg-primary hover:bg-primary/80 text-white uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 active:scale-95 transition-all"
                        disabled={isApproving}
                      >
                        {isApproving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="mr-2 h-3.5 w-3.5" />}
                        APPROVE_&_DISPATCH
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Assumptions Ledger / Detailed Breakdown */}
      <Card className="border-border/50 bg-card/40 backdrop-blur-md shadow-2xl overflow-hidden rounded-lg border-b-2 border-b-emerald-500">
        <CardHeader className="bg-background/20 border-b border-border/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
               <div className="h-12 w-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-black tracking-tight text-foreground uppercase">Assumptions Ledger</CardTitle>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Full response trace from quote-worker-5090</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-black text-[10px] uppercase tracking-[0.2em] px-3 py-1">SCENARIO_REF: SERVICE_SYNC</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-background/40 text-muted-foreground font-black uppercase tracking-widest border-b border-border/50">
                  <th className="px-8 py-5 border-r border-border/30">Parameter_Metric</th>
                  {loanTypes.map(type => (
                    <th key={type} className="px-6 py-5 text-center font-black">{type.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-bold uppercase tracking-tight">
                <LedgerRow label="Status_Available" data={data} field="available" isBoolean />
                <LedgerRow label="Monthly_PITI" data={data} field="monthly_payment" isCurrency />
                <LedgerRow label="Upfront_Fees_USD" data={data} field="upfront_fees" isCurrency />
                <LedgerRow label="Principal_Volume" data={data} field="financed_amount" isCurrency />
                <LedgerRow label="Amortized_Total" data={data} field="total_paid" isCurrency />
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LedgerRow({ label, data, field, isCurrency, isBoolean }: { label: string, data: ComparisonResponse, field: string, isCurrency?: boolean, isBoolean?: boolean }) {
  const loanTypes: LoanType[] = ["conventional", "fha", "va", "usda"];

  return (
    <tr className="hover:bg-primary/5 transition-colors group">
      <td className="px-8 py-5 font-black text-muted-foreground border-r border-border/30 group-hover:text-primary transition-colors">{label}</td>
      {loanTypes.map(type => {
        const val = data.comparison[type]?.[field as keyof typeof data.comparison[typeof type]];
        return (
          <td key={type} className="px-6 py-5 text-center">
            {isBoolean ? (
              <Badge className={`border-none rounded-full px-3 py-0.5 text-[9px] font-black ${val ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
                {val ? 'TRUE' : 'FALSE'}
              </Badge>
            ) : (
              <span className="font-black text-foreground tracking-tight">
                {val === undefined ? '—' : (isCurrency ? currency(val as number) : val)}
              </span>
            )}
          </td>
        );
      })}
    </tr>
  );
}

function Loader2(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
