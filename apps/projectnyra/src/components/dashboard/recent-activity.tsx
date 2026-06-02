"use client";

import React from "react";
import { Clock, CheckCircle, AlertTriangle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string | number;
  type: "lead" | "quote" | "application" | "compliance";
  title: string;
  description: string;
  time: string;
  status: "new" | "completed" | "processing";
}

interface RecentActivityProps {
  activities?: ActivityItem[];
  className?: string;
}

const defaultActivities: ActivityItem[] = [
  {
    id: 1,
    type: "lead",
    title: "New lead from RateHunter",
    description: "Sarah Johnson - $450,000 purchase loan",
    time: "5 minutes ago",
    status: "new",
  },
  {
    id: 2,
    type: "quote",
    title: "Quote generated",
    description: "Michael Chen - 30Y Conventional at 6.875%",
    time: "12 minutes ago",
    status: "completed",
  },
  {
    id: 3,
    type: "application",
    title: "Application submitted",
    description: "Lisa Rodriguez - $325,000 FHA purchase",
    time: "18 minutes ago",
    status: "processing",
  },
  {
    id: 4,
    type: "compliance",
    title: "Disclosure delivered",
    description: "TILA-RESPA LE sent to David Kim",
    time: "32 minutes ago",
    status: "completed",
  },
];

export function RecentActivity({
  activities = defaultActivities,
  className,
}: RecentActivityProps) {
  return (
    <Card className={cn("border-border/40 bg-card/40", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
          <Clock className="h-4 w-4 text-turquoise-400" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-border/20 hover:bg-muted/30 transition-colors"
            >
              <div className="flex-shrink-0 mt-1">
                {activity.status === "completed" ? (
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                ) : activity.status === "processing" ? (
                  <Clock className="h-4 w-4 text-amber-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-turquoise-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {activity.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {activity.description}
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-tighter">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
