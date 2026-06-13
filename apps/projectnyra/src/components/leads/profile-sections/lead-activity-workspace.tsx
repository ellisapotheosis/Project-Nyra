"use client";

import type React from "react";
import {
  Activity,
  Mail,
  MessageSquare,
  MoreVertical,
  Send,
} from "lucide-react";

import { Timeline } from "@/components/leads/timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ConversationLog, Lead } from "@/lib/api/crm";

interface LeadActivityWorkspaceProps {
  lead: Lead;
  logs: ConversationLog[];
  isLoading?: boolean;
}

export function LeadActivityWorkspace({
  lead,
  logs,
  isLoading,
}: LeadActivityWorkspaceProps) {
  return (
    <div className="flex-1 flex flex-col bg-background">
      <Tabs defaultValue="all" className="flex min-h-0 flex-1 flex-col">
        <div className="h-14 px-6 border-b border-border/40 bg-card/40 flex items-center justify-between shrink-0">
          <TabsList className="bg-muted/40 h-8 p-0.5">
            <LeadTab value="all">All</LeadTab>
            <LeadTab value="calls">Calls</LeadTab>
            <LeadTab value="messages">Messages</LeadTab>
            <LeadTab value="pricing">Pricing</LeadTab>
          </TabsList>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground"
          >
            <MoreVertical className="size-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 lg:p-10">
            <TabsContent value="all" className="mt-0 outline-none">
              <Timeline
                logs={logs}
                isLoading={isLoading}
                leadName={lead.firstName}
              />
            </TabsContent>

            <TabsContent
              value="pricing"
              className="mt-0 outline-none max-w-4xl mx-auto space-y-6"
            >
              <ScenarioComparison />
            </TabsContent>
          </div>
        </ScrollArea>

        <MessageComposer leadFirstName={lead.firstName} />
      </Tabs>
    </div>
  );
}

function LeadTab({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  return (
    <TabsTrigger
      value={value}
      className="text-[10px] uppercase font-bold px-4 h-7 data-[state=active]:bg-background"
    >
      {children}
    </TabsTrigger>
  );
}

function ScenarioComparison() {
  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold tracking-tight">
            Scenario Comparison
          </h3>
          <p className="text-sm text-muted-foreground">
            Market-locked data from LenderPrice & Rocket
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-2 border-indigo-500/30 text-indigo-400"
        >
          <Activity className="size-4" />
          Live Rates
        </Button>
      </div>

      <div className="grid gap-4">
        <Card className="border-border/40 bg-card/40 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 shadow-[0_0_10px_rgba(var(--indigo-rgb),0.5)]" />
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <Badge className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20 text-[10px] uppercase font-bold">
                  Conventional Cash Out
                </Badge>
                <CardTitle className="text-lg">
                  Rocket Mortgage High-Cap
                </CardTitle>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">6.250%</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Note Rate
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-4 gap-4 p-4 rounded-xl bg-background/40 border border-border/30">
              <QuoteMetric label="APR" value="6.345%" />
              <QuoteMetric label="Points" value="0.375" />
              <QuoteMetric
                label="Credit/Cost"
                value="$1,250"
                className="text-pink-400"
              />
              <QuoteMetric
                label="Monthly P&I"
                value="$2,001"
                className="font-bold text-turquoise-400"
                align="right"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground"
              >
                View LOE
              </Button>
              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-6 h-8 text-[11px] font-bold uppercase tracking-wider"
              >
                Propose Scenario
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function QuoteMetric({
  label,
  value,
  className = "font-semibold",
  align = "left",
}: {
  label: string;
  value: string;
  className?: string;
  align?: "left" | "right";
}) {
  return (
    <div className={`space-y-1 ${align === "right" ? "text-right" : ""}`}>
      <p className="text-[10px] uppercase font-bold text-muted-foreground/60">
        {label}
      </p>
      <p className={`text-sm ${className}`}>{value}</p>
    </div>
  );
}

function MessageComposer({ leadFirstName }: { leadFirstName?: string }) {
  return (
    <div className="p-4 bg-card/60 border-t border-border/40 backdrop-blur shrink-0">
      <div className="max-w-4xl mx-auto flex items-end gap-3">
        <div className="flex-1 bg-background/60 border border-border/60 rounded-2xl focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all p-3">
          <textarea
            className="w-full bg-transparent border-none focus:ring-0 resize-none outline-none text-sm p-1 min-h-[44px] placeholder:text-muted-foreground/50"
            placeholder={`Send a secured message to ${leadFirstName}...`}
          />
          <div className="flex justify-between items-center mt-2 px-1">
            <div className="flex items-center gap-1">
              <ComposerIconButton>
                <MessageSquare className="size-4" />
              </ComposerIconButton>
              <ComposerIconButton>
                <Mail className="size-4" />
              </ComposerIconButton>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/60 cursor-pointer hover:text-muted-foreground">
                <input
                  type="checkbox"
                  className="size-3 rounded border-border/60 bg-background text-indigo-500 focus:ring-indigo-500/40"
                />
                Append STOP Opt-out
              </label>
              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl h-8 px-5 text-[10px] font-bold uppercase tracking-widest gap-2"
              >
                <Send className="size-3" />
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComposerIconButton({ children }: { children: React.ReactNode }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8 text-muted-foreground/70 hover:text-indigo-400 hover:bg-indigo-500/5"
    >
      {children}
    </Button>
  );
}
