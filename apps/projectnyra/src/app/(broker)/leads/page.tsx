"use client";

import React, { useEffect } from "react";
import { Mail, MapPin, Phone, Star } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { crmApi, type Lead, useApi } from "@/lib/api";
import { StatusGate } from "@/components/status-gate";

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
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Lead Management
        </h1>
        <p className="mt-2 text-muted-foreground">
          Unified lead view pulling the strongest layout ideas from the old
          admin and CRM surfaces.
        </p>
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
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm text-muted-foreground">
                      Total Leads
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-3xl font-semibold">
                    {leads.length}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm text-muted-foreground">
                      Qualified
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-3xl font-semibold">
                    {qualifiedCount}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm text-muted-foreground">
                      Average Loan Size
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-3xl font-semibold">
                    {currency(averageLoan / 10000)}
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4">
                {leads.map((lead: Lead) => (
                  <Card key={lead.id} className="border-border/70 bg-card/80">
                    <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex size-12 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary">
                          {lead.firstName?.[0] || lead.name?.[0] || "?"}
                          {lead.lastName?.[0] || ""}
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-lg font-semibold">
                              {lead.firstName
                                ? `${lead.firstName} ${lead.lastName}`
                                : lead.name || "Unknown Lead"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {lead.loanPurpose || "General"} •{" "}
                              {currency((lead.loanAmount || 0) / 10000)} •{" "}
                              {lead.stage || "New"}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            {lead.email && (
                              <span className="inline-flex items-center gap-1">
                                <Mail className="size-4" />
                                {lead.email}
                              </span>
                            )}
                            {lead.phone && (
                              <span className="inline-flex items-center gap-1">
                                <Phone className="size-4" />
                                {lead.phone}
                              </span>
                            )}
                            {lead.location && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="size-4" />
                                {lead.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="grid gap-2 text-sm lg:text-right">
                        {lead.creditBand && (
                          <span className="inline-flex items-center gap-1 text-primary">
                            <Star className="size-4" />
                            {lead.creditBand} credit band
                          </span>
                        )}
                        <p className="text-muted-foreground">
                          Campaign: {lead.campaignId || "None"}
                        </p>
                        <p className="text-muted-foreground">
                          Source: {lead.source || "Unknown"}
                        </p>
                        {lead.nextTouch && (
                          <p className="text-muted-foreground">
                            Next touch: {lead.nextTouch}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          );
        }}
      </StatusGate>
    </div>
  );
}
