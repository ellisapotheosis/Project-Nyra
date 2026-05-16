import { KeyRound, Network, ShieldCheck, ServerCog } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const platformNotes = [
  {
    title: "Auth Direction",
    icon: KeyRound,
    status: "planned",
    detail:
      "Final broker auth should use the Oracle VPS Supabase stack. Clerk artifacts are not part of the target platform.",
  },
  {
    title: "CRM Boundary",
    icon: ServerCog,
    status: "active",
    detail:
      "UI routes should read and mutate mortgage records through the CRM API boundary, not direct Twenty database access.",
  },
  {
    title: "Assistant Surface",
    icon: Network,
    status: "active",
    detail:
      "OpenClaw and Nexus remain internal broker tools, with the webapp using server-side proxy routes for chat calls.",
  },
  {
    title: "Compliance Guardrails",
    icon: ShieldCheck,
    status: "required",
    detail:
      "STOP, unsubscribe, reply-pausing, quiet hours, and quote generation must stay in services with tests.",
  },
];

const envGroups = [
  "CRM_API_URL / CRM_API_KEY",
  "QUOTE_API_URL / QUOTE_API_SECRET",
  "OPENCLAW_PUBLIC_BASE_URL / OPENCLAW_GATEWAY_TOKEN",
  "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_NEXUS_UI_URL",
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Platform notes for the consolidated broker webapp. This route records
          the auth, CRM, assistant, and deployment assumptions from the guidance
          folder until the live Oracle VPS services are wired end to end.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {platformNotes.map(({ title, icon: Icon, status, detail }) => (
          <Card key={title} className="border-border/70 bg-card/80">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Icon className="size-5 text-primary" />
                {title}
              </CardTitle>
              <Badge variant="outline">{status}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">
                {detail}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/70 bg-card/80">
        <CardHeader>
          <CardTitle>Environment Contract</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {envGroups.map((env) => (
            <div
              key={env}
              className="rounded-lg border border-border/60 bg-background/40 px-4 py-3 font-mono text-xs"
            >
              {env}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
