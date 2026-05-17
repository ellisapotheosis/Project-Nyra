"use client";

import React, { useEffect, useState } from "react";
import {
  Mail,
  MessageSquare,
  Phone,
  Search,
  Filter,
  MoreHorizontal,
  UserCircle,
  Activity,
  Clock,
  ChevronRight,
  Download,
  Plus,
  Zap,
  ShieldCheck,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  ScrollArea,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@nyra/ui";
import { PageHeader } from "@nyra/ui";
import { crmApi, useApi } from "@/lib/api";
import { StatusGate } from "@nyra/ui";
import { cn } from "@/lib/utils";

export default function LeadsPage() {
  const leadsApi = useApi(crmApi.getLeads);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStage, setFilterFilter] = useState<string>("all");

  useEffect(() => {
    leadsApi.execute();
  }, []);

  const filteredLeads =
    leadsApi.data?.leads.filter((lead: any) => {
      const nameMatch = (lead.firstName + " " + lead.lastName)
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const stageMatch = filterStage === "all" || lead.stage === filterStage;
      return nameMatch && stageMatch;
    }) || [];

  const currency = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="space-y-12 p-8 max-w-[1600px] mx-auto min-h-screen">
      <PageHeader
        eyebrow="Registry_Operations"
        title="Broker Lead Registry"
        description="Master queue for mortgage lead ingestion, grading, and automated campaign orchestration."
        meta={
          <div className="flex gap-2">
            <Badge
              variant="outline"
              className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-black text-[10px] uppercase tracking-widest px-4 py-1"
            >
              REALTIME_SYNC: ACTIVE
            </Badge>
            <Badge className="bg-turquoise-500 text-black font-black text-[10px] uppercase tracking-widest px-4 py-1 shadow-lg shadow-turquoise-500/20">
              {filteredLeads.length} QUEUED_PARTICLES
            </Badge>
          </div>
        }
        actions={
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-indigo-500/20 bg-indigo-500/5 text-indigo-400 font-black uppercase tracking-widest text-[9px] h-10 px-6 rounded-xl"
            >
              <Download className="mr-2 size-3.5" /> EXPORT_CSV
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[9px] h-10 px-8 rounded-xl shadow-lg shadow-indigo-500/30">
              <Plus className="mr-2 size-4" /> CREATE_LEAD
            </Button>
          </div>
        }
      />

      <Card className="bg-card/40 backdrop-blur-md border border-border/50 shadow-2xl rounded-[32px] overflow-hidden">
        <CardContent className="p-8 space-y-8">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="relative w-full max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-indigo-400 transition-colors" />
              <Input
                placeholder="SEARCH_REGISTRY_BY_IDENT..."
                className="h-12 pl-12 bg-background/40 border-border/50 rounded-2xl text-[11px] font-black uppercase tracking-widest focus:border-indigo-400 shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                  STAGE_FILTER:
                </p>
                <select
                  className="h-10 px-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-400 outline-none focus:border-indigo-400"
                  value={filterStage}
                  onChange={(e) => setFilterFilter(e.target.value)}
                >
                  <option value="all">ALL_STAGES</option>
                  <option value="NEW">NEW_INGRESS</option>
                  <option value="QUALIFIED">QUALIFIED</option>
                  <option value="ACTIVE">ACTIVE_FILE</option>
                </select>
              </div>
            </div>
          </div>

          <StatusGate
            data={leadsApi.data?.leads ?? null}
            error={leadsApi.error}
            isLoading={leadsApi.isLoading}
            onRetry={leadsApi.execute}
            loadingMessage="Retrieving Lead Registry..."
            emptyMessage="No leads found in the system of record."
          >
            {(leads) => (
              <div className="grid gap-4">
                {filteredLeads.map((lead: any) => (
                  <div
                    key={lead.id}
                    className="group relative flex flex-col md:flex-row md:items-center gap-6 p-6 rounded-[24px] bg-background/40 border border-border/30 hover:border-indigo-500/30 transition-all shadow-xl hover:scale-[1.01] border-l-4 border-l-turquoise-500"
                  >
                    <div className="flex-1 min-w-0 grid gap-6 md:grid-cols-4 items-center">
                      <div className="flex items-center gap-5 col-span-1">
                        <div className="size-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                          <UserCircle className="size-6" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-foreground group-hover:text-indigo-400 transition-colors uppercase tracking-tight text-sm truncate">
                            {lead.firstName} {lead.lastName}
                          </p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60 italic">
                            {lead.email}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                          INTENT_SCORE
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-foreground italic">
                            {lead.leadScore || 85}%
                          </span>
                          <div className="flex-1 h-1 bg-black/40 rounded-full overflow-hidden border border-border/10">
                            <div
                              className="h-full bg-turquoise-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]"
                              style={{ width: `${lead.leadScore || 85}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                          SCENARIO_LOAD
                        </p>
                        <p className="text-sm font-black text-foreground uppercase tracking-tight italic">
                          {lead.loanPurpose || "GENERAL"}{" "}
                          <span className="text-indigo-400 ml-1">
                            @{currency(lead.loanAmount || 3500000)}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6">
                        <div className="text-right">
                          <p className="text-[9px] font-black text-foreground uppercase italic">
                            {lead.campaignStatus || "IDLE"}
                          </p>
                          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-30">
                            CAMPAIGN_STATE
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-xl hover:bg-indigo-500/10 text-indigo-400"
                          >
                            <MessageSquare className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-xl hover:bg-turquoise-500/10 text-turquoise-400"
                          >
                            <Zap className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="hidden md:block size-5 text-muted-foreground opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            )}
          </StatusGate>
        </CardContent>
      </Card>
    </div>
  );
}
