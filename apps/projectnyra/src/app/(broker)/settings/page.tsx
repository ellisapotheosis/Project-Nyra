import {
  BellRing,
  CheckCircle2,
  KeyRound,
  Network,
  RadioTower,
  ShieldAlert,
  ShieldCheck,
  ServerCog,
  Settings2,
  ToggleLeft,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const platformNotes = [
  {
    title: "Auth Direction",
    icon: KeyRound,
    status: "planned",
    detail:
      "Final broker auth should use the Oracle VPS Supabase stack. Legacy auth artifacts are not the target platform contract.",
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
  ["CRM_API_URL / CRM_API_KEY", "server", "CRM API read/write boundary"],
  [
    "QUOTE_API_URL / QUOTE_API_SECRET",
    "server",
    "Quote service artifact generation",
  ],
  [
    "OPENCLAW_PUBLIC_BASE_URL / OPENCLAW_GATEWAY_TOKEN",
    "server",
    "Assistant gateway proxy",
  ],
  [
    "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "client",
    "Broker auth bootstrap",
  ],
  ["SUPABASE_SERVICE_ROLE_KEY", "server", "Server-side auth administration"],
  [
    "NEXUS_ROUTER_URL / LITELLM_PROXY_URL / GRAFBASE_URL",
    "server",
    "Nexus status checks",
  ],
  [
    "NEXT_PUBLIC_NEXUS_ROUTER_URL / NEXT_PUBLIC_GRAFANA_URL",
    "client",
    "Operator launch links only",
  ],
];

const featureFlags = [
  ["Live lead radar", "enabled", "Shows cached/mock/live source labels"],
  ["Assistant direct writes", "disabled", "Actions require service approval"],
  [
    "Mock CRM writes",
    "guarded",
    "Disabled in production unless explicitly enabled",
  ],
  [
    "Discord operator alerts",
    "pending",
    "Surface status when webhook contract exists",
  ],
];

export default function SettingsPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 lg:px-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-turquoise-400">
            <Settings2 className="size-4" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
              Product Configuration
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Settings
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Operational assumptions for the consolidated broker webapp. These
            settings explain boundaries, environment contracts, and feature
            posture without exposing secrets or enabling unsafe direct actions.
          </p>
        </div>
        <Badge variant="outline" className="w-fit gap-2">
          <ShieldAlert className="size-3 text-pink-400" />
          Secrets never rendered
        </Badge>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {platformNotes.map(({ title, icon: Icon, status, detail }) => (
          <Card key={title} className="border-border/40 bg-card/40">
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
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card className="border-border/40 bg-card/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-muted-foreground">
              <RadioTower className="size-4 text-turquoise-400" />
              Environment Contract
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {envGroups.map(([env, scope, detail]) => (
              <div
                key={env}
                className="grid gap-3 rounded-xl border border-border/40 bg-background/40 px-4 py-3 text-sm md:grid-cols-[1fr_100px_1.2fr]"
              >
                <span className="font-mono text-xs">{env}</span>
                <Badge variant="outline" className="w-fit text-[9px]">
                  {scope}
                </Badge>
                <span className="text-muted-foreground">{detail}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-border/40 bg-card/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-muted-foreground">
                <ToggleLeft className="size-4 text-indigo-400" />
                Feature Posture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {featureFlags.map(([label, state, detail]) => (
                <div
                  key={label}
                  className="rounded-xl border border-border/40 bg-background/40 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{label}</p>
                    <Badge variant="outline" className="text-[9px]">
                      {state}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {detail}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-muted-foreground">
                <BellRing className="size-4 text-pink-400" />
                Operator Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>
                Discord and other operator notifications should be surfaced here
                when a real webhook/status contract exists.
              </p>
              <div className="flex items-center gap-2 rounded-xl border border-border/40 bg-background/40 p-3 text-foreground">
                <CheckCircle2 className="size-4 text-turquoise-400" />
                Manual-owner actions stay documented, not hidden in UI copy.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
