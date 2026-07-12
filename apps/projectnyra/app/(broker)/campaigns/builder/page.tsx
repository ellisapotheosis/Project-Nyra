"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  PhoneMissed,
  MessageSquare,
  Mail,
  Phone,
  MoreVertical,
  GripVertical,
  Clock,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CampaignBuilderPage() {
  return (
    <div className="flex flex-col space-y-10 p-8 lg:p-12 bg-background min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
              Campaign Architect
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Sequence Builder
          </h1>
          <p className="text-sm font-medium text-muted-foreground max-w-md">
            Design automated omnichannel journeys for the{" "}
            <span className="text-indigo-400 font-bold uppercase tracking-tighter">
              'Refinance Blitz'
            </span>{" "}
            pool.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-10 border-border/40 bg-muted/20 text-muted-foreground hover:text-foreground"
          >
            Discard
          </Button>
          <Button className="h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 shadow-[0_0_20px_-5px_rgba(var(--indigo-rgb),0.4)]">
            Deploy Sequence
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Step 1 */}
        <Card className="border-border/40 bg-card/40 relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 shadow-[0_0_15px_rgba(var(--indigo-rgb),0.5)]" />
          <CardHeader className="pb-4 border-b border-border/20 flex flex-row items-center justify-between bg-muted/20">
            <div>
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                Day 01: Initial Reach
              </CardTitle>
              <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase font-bold tracking-widest">
                Trigger: System Assignment
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground/40 hover:text-foreground"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <ActionItem
              icon={<PhoneMissed className="h-3.5 w-3.5" />}
              iconTone="text-turquoise-400 bg-turquoise-400/10 border-turquoise-400/20"
              title="RVM Drop + Missed Call"
              subtitle="10:30 AM | AI Voice Agent"
            />
            <ActionItem
              icon={<MessageSquare className="h-3.5 w-3.5" />}
              iconTone="text-indigo-400 bg-indigo-400/10 border-indigo-400/20"
              title="Personalized SMS"
              subtitle="1:00 PM | Twilio Messaging"
            />
            <ActionItem
              icon={<Mail className="h-3.5 w-3.5" />}
              iconTone="text-pink-400 bg-pink-400/10 border-pink-400/20"
              title="Nurture Email #1"
              subtitle="3:45 PM | SendGrid SMTP"
            />
            <Button
              variant="outline"
              className="w-full h-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 border-dashed border-border/40 hover:border-indigo-500/40 hover:text-indigo-400 transition-all mt-2"
            >
              <Plus className="mr-2 h-3.5 w-3.5" />
              Inject Action
            </Button>
          </CardContent>
        </Card>

        {/* Step 2 */}
        <Card className="border-border/40 bg-card/40 shadow-xl opacity-80 hover:opacity-100 transition-opacity">
          <CardHeader className="pb-4 border-b border-border/20 flex flex-row items-center justify-between bg-muted/10">
            <div>
              <CardTitle className="text-sm font-bold text-foreground">
                Day 02: Persistence
              </CardTitle>
              <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase font-bold tracking-widest text-indigo-400/60">
                Trigger: +24h Offset
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground/40"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <ActionItem
              icon={<Phone className="h-3.5 w-3.5" />}
              iconTone="text-turquoise-400 bg-turquoise-400/10 border-turquoise-400/20"
              title="Manual Call Attempt"
              subtitle="9:15 AM | Broker Queue"
            />
            <ActionItem
              icon={<Mail className="h-3.5 w-3.5" />}
              iconTone="text-pink-400 bg-pink-400/10 border-pink-400/20"
              title="Contextual Follow-up"
              subtitle="2:30 PM | Microsoft Graph"
            />
            <Button
              variant="outline"
              className="w-full h-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 border-dashed border-border/40 hover:border-indigo-500/40 hover:text-indigo-400 mt-2"
            >
              <Plus className="mr-2 h-3.5 w-3.5" />
              Inject Action
            </Button>
          </CardContent>
        </Card>

        {/* Add Step */}
        <div className="border-2 border-dashed border-border/40 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center bg-card/10 h-full min-h-[300px] cursor-pointer hover:bg-card/20 hover:border-indigo-500/30 transition-all group">
          <div className="size-16 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-500/10 transition-all shadow-[0_0_20px_-10px_rgba(var(--indigo-rgb),0.5)]">
            <Plus className="h-8 w-8 text-indigo-400" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Extend Journey</h3>
          <p className="text-xs text-muted-foreground/60 mt-2 mb-6 max-w-[160px]">
            Add another day of automated follow-ups.
          </p>
          <Button
            variant="outline"
            className="h-9 border-border/40 px-6 font-bold uppercase text-[10px] tracking-widest"
          >
            Add Execution Day
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ActionItemProps {
  icon: React.ReactNode;
  iconTone: string;
  title: string;
  subtitle: string;
}

function ActionItem({ icon, iconTone, title, subtitle }: ActionItemProps) {
  return (
    <div className="flex items-start group/item">
      <div className="flex flex-col items-center mr-3 mt-1.5 cursor-grab opacity-0 group-hover/item:opacity-100 transition-opacity">
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/30" />
      </div>
      <div
        className={cn(
          "flex items-center justify-center size-9 rounded-xl border shrink-0 mt-0.5 shadow-sm transition-transform group-hover/item:scale-105",
          iconTone
        )}
      >
        {icon}
      </div>
      <div className="ml-3 flex-1 border border-border/30 bg-background/40 p-3.5 rounded-2xl shadow-sm group-hover/item:border-indigo-500/30 transition-colors">
        <div className="flex justify-between items-start">
          <p className="text-xs font-bold text-foreground group-hover/item:text-indigo-300 transition-colors">
            {title}
          </p>
        </div>
        <p className="text-[10px] font-medium text-muted-foreground/60 mt-1 uppercase tracking-tighter">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
