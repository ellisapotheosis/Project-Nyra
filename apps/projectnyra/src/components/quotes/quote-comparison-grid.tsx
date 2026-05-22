"use client";

import React from "react";
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
  Zap,
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

export function QuoteComparisonGrid({
  data,
  onApprove,
  isApproving,
}: QuoteComparisonGridProps) {
  const loanTypes: LoanType[] = ["conventional", "fha", "va", "usda"];
  const scenarioRef = `SCN-${data.property_value}-${data.loan_amount}-${data.credit_score}`;

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
                  ? "border-t-4 border-t-indigo-600 shadow-md bg-card/40"
                  : "opacity-60 bg-muted/20"
              }`}
            >
              {result.available && type === "conventional" && (
                <div className="absolute top-0 right-0">
                  <Badge className="bg-indigo-600 text-white rounded-none rounded-bl-lg text-[10px] font-bold">
                    POPULAR
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant="outline"
                    className={`uppercase text-[10px] font-black ${
                      result.available
                        ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                        : "bg-muted/30 text-muted-foreground border-border/40"
                    }`}
                  >
                    {type}
                  </Badge>
                  {result.available ? (
                    <CheckCircle2 className="h-4 w-4 text-turquoise-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-pink-400" />
                  )}
                </div>
                <CardTitle className="text-2xl font-black text-foreground">
                  {result.available
                    ? currency(result.monthly_payment || 0)
                    : "N/A"}
                </CardTitle>
                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                  Monthly PITI
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {!result.available ? (
                  <div className="py-8 text-center space-y-2">
                    <p className="text-xs font-bold text-pink-400 uppercase">
                      Ineligible
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 italic px-4 leading-relaxed">
                      {result.error || "Does not meet program guidelines"}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          Upfront Fees
                        </span>
                        <span className="font-bold text-foreground">
                          {currency(result.upfront_fees || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          Financed Amount
                        </span>
                        <span className="font-bold text-foreground">
                          {currency(result.financed_amount || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          Total Paid
                        </span>
                        <span className="font-bold text-turquoise-400">
                          {currency(result.total_paid || 0)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border/40 space-y-4">
                      <div className="flex flex-col space-y-2">
                        <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest flex items-center">
                          <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-indigo-400" />{" "}
                          Key Assumptions
                        </p>
                        <ul className="text-[10px] space-y-1.5">
                          {result.summary?.assumptions &&
                            Object.entries(result.summary.assumptions)
                              .slice(0, 3)
                              .map(([key, val]: [string, any]) => (
                                <li
                                  key={key}
                                  className="flex justify-between text-muted-foreground"
                                >
                                  <span className="capitalize">
                                    {key.replace(/_/g, " ")}
                                  </span>
                                  <span className="font-semibold text-foreground">
                                    {typeof val === "boolean"
                                      ? val
                                        ? "Yes"
                                        : "No"
                                      : val}
                                  </span>
                                </li>
                              ))}
                        </ul>
                      </div>

                      <Button
                        onClick={() => onApprove(type)}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 h-11 rounded-xl font-bold shadow-lg shadow-indigo-900/20 gap-2"
                        disabled={isApproving}
                      >
                        {isApproving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="size-4" />
                        )}
                        <span className="uppercase tracking-widest text-[10px]">
                          Approve & Send
                        </span>
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
      <Card className="border-border/40 shadow-sm overflow-hidden bg-card/20">
        <CardHeader className="bg-muted/20 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="size-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-sm">
                <FileText className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-foreground tracking-tight">
                  Assumptions Ledger
                </CardTitle>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">
                  Detailed breakdown of calculated scenario parameters
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="bg-background/40 font-mono text-[10px] text-muted-foreground border-border/40"
            >
              SCENARIO-REF: {scenarioRef}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/30 text-muted-foreground font-bold uppercase tracking-widest border-b border-border/40">
                  <th className="px-6 py-4">Parameter</th>
                  {loanTypes.map((type) => (
                    <th key={type} className="px-6 py-4 text-center">
                      {type}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                <LedgerRow
                  label="Available"
                  data={data}
                  field="available"
                  isBoolean
                />
                <LedgerRow
                  label="Monthly PITI"
                  data={data}
                  field="monthly_payment"
                  isCurrency
                />
                <LedgerRow
                  label="Upfront Fees"
                  data={data}
                  field="upfront_fees"
                  isCurrency
                />
                <LedgerRow
                  label="Financed Amount"
                  data={data}
                  field="financed_amount"
                  isCurrency
                />
                <LedgerRow
                  label="Total Paid"
                  data={data}
                  field="total_paid"
                  isCurrency
                />
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LedgerRow({
  label,
  data,
  field,
  isCurrency,
  isBoolean,
}: {
  label: string;
  data: ComparisonResponse;
  field: string;
  isCurrency?: boolean;
  isBoolean?: boolean;
}) {
  const loanTypes: LoanType[] = ["conventional", "fha", "va", "usda"];

  return (
    <tr className="hover:bg-muted/10 transition-colors group">
      <td className="px-6 py-4 font-bold text-muted-foreground/80 group-hover:text-foreground transition-colors">
        {label}
      </td>
      {loanTypes.map((type) => {
        const val =
          data.comparison[type]?.[
            field as keyof (typeof data.comparison)[typeof type]
          ];
        return (
          <td key={type} className="px-6 py-4 text-center">
            {isBoolean ? (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${val ? "bg-turquoise-500/10 text-turquoise-400 border border-turquoise-500/20" : "bg-pink-500/10 text-pink-400 border border-pink-500/20"}`}
              >
                {val ? "YES" : "NO"}
              </span>
            ) : (
              <span className="font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
                {val === undefined
                  ? "—"
                  : isCurrency
                    ? currency(val as number)
                    : val}
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
