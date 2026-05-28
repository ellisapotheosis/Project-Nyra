"use client";

import React, { useEffect } from "react";
import { Mail, MapPin, Phone, Star } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from "@nyra/ui";
import { crmApi, type Lead, useApi } from "@/lib/api";
import { StatusGate } from "@/components/status-gate";
import { LeadManagementTable } from "@/components/leads/lead-management-table";
import type { LeadRecord } from "@/lib/mock-data";

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function LeadsPage() {
  const leadsApi = useApi(crmApi.getLeads);

  useEffect(() => {
    leadsApi.execute();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">
            Lead Management
          </h1>
          <p className="text-sm text-white/40 font-medium">
            Unified mortgage pipeline operations pulling from legacy admin and
            CRM sources.
          </p>
        </div>
      </div>

      <StatusGate
        data={leadsApi.data?.leads ?? null}
        error={leadsApi.error}
        isLoading={leadsApi.isLoading}
        onRetry={leadsApi.execute}
        loadingMessage="Fetching leads..."
        emptyMessage="No leads found."
      >
        {(leads) => {
          const qualifiedCount = leads.filter(
            (lead: Lead) => lead.stage === "Qualified"
          ).length;
          const totalLoanAmount = leads.reduce(
            (sum: number, lead: Lead) => sum + (lead.loanAmount || 0),
            0
          );
          const averageLoan =
            leads.length > 0 ? Math.round(totalLoanAmount / leads.length) : 0;

          return (
            <div className="space-y-10">
              <div className="grid gap-4 md:grid-cols-3">
                <Card variant="glass" className="bg-white/5 border-white/5">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                      Total Pipeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6">
                    <div className="text-2xl font-black text-white">
                      {leads.length}
                    </div>
                    <p className="text-[10px] text-white/30 mt-1 font-medium uppercase tracking-wider">
                      Active leads across all sources
                    </p>
                  </CardContent>
                </Card>
                <Card variant="glass" className="bg-white/5 border-white/5">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                      Qualified Leads
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6">
                    <div className="text-2xl font-black text-turquoise-400">
                      {qualifiedCount}
                    </div>
                    <p className="text-[10px] text-white/30 mt-1 font-medium uppercase tracking-wider">
                      Ready for document collection
                    </p>
                  </CardContent>
                </Card>
                <Card variant="glass" className="bg-white/5 border-white/5">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                      Average Ticket
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6">
                    <div className="text-2xl font-black text-indigo-400">
                      {currency(averageLoan / 10000)}
                    </div>
                    <p className="text-[10px] text-white/30 mt-1 font-medium uppercase tracking-wider">
                      Mean loan value in process
                    </p>
                  </CardContent>
                </Card>
              </div>

              <LeadManagementTable leads={leads as unknown as LeadRecord[]} />
            </div>
          );
        }}
      </StatusGate>
    </div>
  );
}
