import { AlertTriangle, Cloud, Mail, MessageSquare, RadioTower, Workflow } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@nyra/ui";

const inboxItems = [
  { service: "Twilio", detail: "SMS sender verification pending", owner: "Owner action", icon: MessageSquare, severity: "blocked" },
  { service: "SendGrid", detail: "Domain authentication not confirmed", owner: "Owner action", icon: Mail, severity: "blocked" },
  { service: "Twenty", detail: "Custom mortgage objects need final audit", owner: "CRM setup", icon: RadioTower, severity: "review" },
  { service: "OpenClaw / Nexus", detail: "Expose safe health summaries only", owner: "Ops adapter", icon: Workflow, severity: "review" },
  { service: "Cloudflare", detail: "Access policies must gate admin surfaces", owner: "Owner action", icon: Cloud, severity: "review" },
];

export function IntegrationFailureInbox() {
  return (
    <Card className="overflow-hidden rounded-[28px] border border-pink-500/20 bg-card/40 shadow-2xl backdrop-blur-md">
      <CardHeader className="border-b border-border/50 bg-pink-500/5">
        <CardTitle className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-pink-300">
          <AlertTriangle className="size-4" />
          Integration_Failure_Inbox
        </CardTitle>
        <p className="text-[10px] font-bold uppercase leading-relaxed tracking-widest text-muted-foreground">
          Triage lane for failed or unverified Twilio, SendGrid, Activepieces, n8n, Twenty, OpenClaw, Nexus, and Cloudflare events. Mock labels remain until service contracts are live.
        </p>
      </CardHeader>
      <CardContent className="grid gap-3 p-5 lg:grid-cols-5">
        {inboxItems.map(({ service, detail, owner, icon: Icon, severity }) => (
          <div key={service} className="rounded-2xl border border-border/40 bg-background/45 p-4 shadow-inner">
            <div className="flex items-center justify-between">
              <Icon className={severity === "blocked" ? "size-4 text-pink-300" : "size-4 text-amber-300"} />
              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{owner}</span>
            </div>
            <p className="mt-3 text-[11px] font-black uppercase tracking-tight text-foreground">{service}</p>
            <p className="mt-1 text-[9px] font-bold uppercase leading-relaxed tracking-widest text-muted-foreground">{detail}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
