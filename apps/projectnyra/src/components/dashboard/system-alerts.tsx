"use client";

import React from "react";
import { AlertTriangle, Info, Bell } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AlertItem {
  id: string | number;
  type: "warning" | "info" | "error";
  title: string;
  description: string;
  action?: string;
}

interface SystemAlertsProps {
  alerts?: AlertItem[];
  className?: string;
}

const defaultAlerts: AlertItem[] = [
  {
    id: 1,
    type: "warning",
    title: "Rate lock expiring soon",
    description: "3 loans have rate locks expiring within 7 days",
    action: "Review locks",
  },
  {
    id: 2,
    type: "info",
    title: "Campaign performance",
    description: "Email campaign #47 has 35% open rate",
    action: "View details",
  },
];

export function SystemAlerts({
  alerts = defaultAlerts,
  className,
}: SystemAlertsProps) {
  return (
    <Card className={cn("border-border/40 bg-card/40", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
          <Bell className="h-4 w-4 text-amber-400" />
          System Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-xl border transition-all",
                alert.type === "warning" &&
                  "border-amber-400/20 bg-amber-400/5",
                alert.type === "info" &&
                  "border-turquoise-400/20 bg-turquoise-400/5",
                alert.type === "error" && "border-rose-400/20 bg-rose-400/5"
              )}
            >
              <div className="mt-0.5 shrink-0">
                {alert.type === "warning" && (
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                )}
                {alert.type === "info" && (
                  <Info className="h-4 w-4 text-turquoise-400" />
                )}
                {alert.type === "error" && (
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">
                  {alert.title}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {alert.description}
                </p>
              </div>
              {alert.action && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-[10px] font-bold uppercase tracking-widest text-turquoise-400 hover:bg-transparent hover:text-turquoise-300"
                >
                  {alert.action}
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
