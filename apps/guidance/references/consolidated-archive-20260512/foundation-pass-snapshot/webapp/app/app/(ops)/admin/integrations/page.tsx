import { Activity, ExternalLink, ServerCog, ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { ComplianceBadge } from "@/components/status/compliance-badge";
import { StatusBadge } from "@/components/status/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { serviceConfig } from "@/lib/api/config";

export const dynamic = "force-dynamic";

type IntegrationStatus = {
  name: string;
  category: string;
  url?: string;
  healthPath?: string;
  publicUrl?: string;
  status: "healthy" | "unconfigured" | "unreachable";
  detail: string;
};

const externalLinks = {
  Twenty: process.env.NEXT_PUBLIC_TWENTY_URL,
  Activepieces: process.env.NEXT_PUBLIC_ACTIVEPIECES_URL,
  n8n: process.env.NEXT_PUBLIC_N8N_URL,
  Nexus: process.env.NEXT_PUBLIC_NEXUS_UI_URL,
  OpenMemory: process.env.NEXT_PUBLIC_OPENMEMORY_URL,
  Paperclip: process.env.NEXT_PUBLIC_PAPERCLIP_URL,
  OpenClaw: process.env.NEXT_PUBLIC_OPENCLAW_URL,
};

export default async function IntegrationsPage() {
  const statuses = await Promise.all([
    checkIntegration("CRM API", "System of record boundary", serviceConfig.crmApiUrl, "/health"),
    checkIntegration("Quote API", "Deterministic quotes", serviceConfig.quoteApiUrl, "/health"),
    checkIntegration("Campaign Engine", "Campaign runtime", serviceConfig.campaignEngineUrl, "/api/health"),
    checkIntegration("OpenClaw Gateway", "Assistant gateway", serviceConfig.openClawBaseUrl, "/health", externalLinks.OpenClaw),
    checkIntegration("Twenty CRM", "CRM ledger", process.env.TWENTY_CRM_URL, "/health", externalLinks.Twenty),
    checkIntegration("Activepieces", "Workflow glue", process.env.ACTIVEPIECES_BASE_URL, "/api/v1/health", externalLinks.Activepieces),
    checkIntegration("n8n", "Workflow glue", process.env.N8N_BASE_URL, "/healthz", externalLinks.n8n),
    checkIntegration("Nexus Router", "Model/tool router", process.env.NEXUS_ROUTER_URL, "/health", externalLinks.Nexus),
    checkIntegration("OpenMemory", "Memory diagnostics", process.env.OPENMEMORY_URL, "/health", externalLinks.OpenMemory),
    checkIntegration("Paperclip", "Governance panel", process.env.PAPERCLIP_URL, "/health", externalLinks.Paperclip),
    checkIntegration("Twilio", "SMS/voice provider", process.env.TWILIO_ACCOUNT_SID ? "configured" : undefined),
    checkIntegration("SendGrid", "Email provider", process.env.SENDGRID_API_KEY ? "configured" : undefined),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      <PageHeader
        eyebrow="Operator Admin"
        title="Integration Health"
        description="Read-only service and provider configuration view. Secrets stay server-side; this page only reports reachability and configuration presence."
        meta={
          <>
            <ComplianceBadge label="READ_ONLY" state="clear" />
            <ComplianceBadge label="NO_SECRET_RENDER" state="clear" />
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {statuses.map((item) => (
          <Card key={item.name} className="border-border/50 bg-card/40 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-sm font-black uppercase tracking-widest">{item.name}</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">{item.category}</p>
              </div>
              <StatusBadge status={item.status} />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/45 p-4 text-sm">
                <Activity className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{item.detail}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="size-3.5 text-emerald-400" />
                  Gateway only
                </span>
                {item.publicUrl ? (
                  <a
                    href={item.publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                  >
                    Open <ExternalLink className="size-3" />
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <ServerCog className="size-3" />
                    Internal
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

async function checkIntegration(
  name: string,
  category: string,
  url?: string,
  healthPath = "/health",
  publicUrl?: string
): Promise<IntegrationStatus> {
  if (!url) {
    return {
      name,
      category,
      publicUrl,
      status: "unconfigured",
      detail: "No service URL or provider credential is configured in this runtime.",
    };
  }

  if (url === "configured") {
    return {
      name,
      category,
      publicUrl,
      status: "healthy",
      detail: "Credential presence detected. Live provider API calls are intentionally not made from this read-only dashboard.",
    };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1500);
    const response = await fetch(`${url.replace(/\/$/, "")}${healthPath}`, {
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timer);

    return {
      name,
      category,
      url,
      healthPath,
      publicUrl,
      status: response.ok ? "healthy" : "unreachable",
      detail: `Health check returned HTTP ${response.status}.`,
    };
  } catch (error) {
    return {
      name,
      category,
      url,
      healthPath,
      publicUrl,
      status: "unreachable",
      detail: error instanceof Error ? error.message : "Health check failed.",
    };
  }
}
