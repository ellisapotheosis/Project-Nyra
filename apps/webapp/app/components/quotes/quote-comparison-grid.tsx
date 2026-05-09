'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
              className={`relative overflow-hidden transition-all hover:shadow-lg ${
                result.available 
                  ? 'border-t-4 border-t-blue-600 shadow-md' 
                  : 'opacity-60 bg-slate-50'
              }`}
            >
              {result.available && type === 'conventional' && (
                <div className="absolute top-0 right-0">
                  <Badge className="bg-blue-600 text-white rounded-none rounded-bl-lg text-[10px] font-bold">POPULAR</Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                   <Badge variant="outline" className={`uppercase text-[10px] font-black ${
                     result.available ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                   }`}>
                    {type}
                  </Badge>
                  {result.available ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  )}
                </div>
                <CardTitle className="text-2xl font-black text-slate-900">
                  {result.available ? currency(result.monthly_payment || 0) : 'N/A'}
                </CardTitle>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monthly PITI</p>
              </CardHeader>

              <CardContent className="space-y-6">
                {!result.available ? (
                  <div className="py-8 text-center space-y-2">
                    <p className="text-xs font-bold text-red-600 uppercase">Ineligible</p>
                    <p className="text-[10px] text-slate-500 italic px-4 leading-relaxed">{result.error || 'Does not meet program guidelines'}</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                       <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Upfront Fees</span>
                        <span className="font-bold text-slate-900">{currency(result.upfront_fees || 0)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Financed Amount</span>
                        <span className="font-bold text-slate-900">{currency(result.financed_amount || 0)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Total Paid</span>
                        <span className="font-bold text-slate-900">{currency(result.total_paid || 0)}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 space-y-4">
                      <div className="flex flex-col space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                          <ShieldCheck className="mr-1 h-3 w-3 text-blue-500" /> Key Assumptions
                        </p>
                        <ul className="text-[10px] space-y-1.5">
                           {result.summary?.assumptions && Object.entries(result.summary.assumptions).slice(0, 3).map(([key, val]: [string, any]) => (
                             <li key={key} className="flex justify-between text-slate-600">
                               <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                               <span className="font-semibold text-slate-800">{typeof val === 'boolean' ? (val ? 'Yes' : 'No') : val}</span>
                             </li>
                           ))}
                        </ul>
                      </div>

                      <Button 
                        onClick={() => onApprove(type)}
                        className="w-full bg-blue-600 hover:bg-blue-700 h-11 rounded-xl font-bold shadow-lg shadow-blue-100"
                        disabled={isApproving}
                      >
                        {isApproving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Approve & Send
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
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
               <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">Assumptions Ledger</CardTitle>
                <p className="text-xs text-slate-500 font-medium">Detailed breakdown of calculated scenario parameters</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-white font-mono text-[10px]">SCENARIO-REF: {Math.random().toString(36).substring(7).toUpperCase()}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 font-bold uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4">Parameter</th>
                  {loanTypes.map(type => (
                    <th key={type} className="px-6 py-4 text-center">{type}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <LedgerRow label="Available" data={data} field="available" isBoolean />
                <LedgerRow label="Monthly PITI" data={data} field="monthly_payment" isCurrency />
                <LedgerRow label="Upfront Fees" data={data} field="upfront_fees" isCurrency />
                <LedgerRow label="Financed Amount" data={data} field="financed_amount" isCurrency />
                <LedgerRow label="Total Paid" data={data} field="total_paid" isCurrency />
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
    <tr className="hover:bg-slate-50/50 transition-colors">
      <td className="px-6 py-4 font-bold text-slate-700">{label}</td>
      {loanTypes.map(type => {
        const val = data.comparison[type]?.[field as keyof typeof data.comparison[typeof type]];
        return (
          <td key={type} className="px-6 py-4 text-center">
            {isBoolean ? (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {val ? 'YES' : 'NO'}
              </span>
            ) : (
              <span className="font-semibold text-slate-900">
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
