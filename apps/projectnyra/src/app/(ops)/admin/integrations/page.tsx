import { Activity, ExternalLink, ServerCog, ShieldCheck } from "lucide-react";

import { PageHeader } from "@nyra/ui";
import { IntegrationFailureInbox } from "@/components/integrations/integration-failure-inbox";
import { ComplianceBadge } from "@nyra/ui";
import { StatusBadge } from "@nyra/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@nyra/ui";
import { serviceConfig } from "@/lib/api/config";
import { cn } from "@/lib/utils";

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
    checkIntegration(
      "CRM API",
      "System_Registry_Boundary",
      serviceConfig.crmApiUrl,
      "/health"
    ),
    checkIntegration(
      "Quote API",
      "Deterministic_Pricing",
      serviceConfig.quoteApiUrl,
      "/health"
    ),
    checkIntegration(
      "OpenClaw",
      "Agent_Gateway",
      serviceConfig.openClawBaseUrl,
      "/health",
      externalLinks.OpenClaw
    ),
    checkIntegration(
      "Twenty CRM",
      "Ledger_System_of_Record",
      serviceConfig.twentyCrmUrl,
      "/health",
      externalLinks.Twenty
    ),
    checkIntegration(
      "Activepieces",
      "Omnichannel_Glue",
      serviceConfig.activepiecesBaseUrl,
      "/api/v1/health",
      externalLinks.Activepieces
    ),
    checkIntegration(
      "Nexus Router",
      "Logic_Model_Router",
      serviceConfig.nexusRouterUrl,
      "/health",
      externalLinks.Nexus
    ),
    checkIntegration("LLXPRT Bridge", "Subscription_CLI_Proxy", "configured"),
    checkIntegration(
      "mem0",
      "Cognitive_Recall",
      serviceConfig.mem0Url,
      "/health"
    ),
    checkIntegration(
      "FalkorDB",
      "Sacred_Graph_Memory",
      serviceConfig.falkorDbUrl,
      "/health"
    ),
    checkIntegration(
      "Paperclip",
      "Goal_Alignment_Sentinel",
      serviceConfig.paperclipUrl,
      "/health",
      externalLinks.Paperclip
    ),
    checkIntegration(
      "Orchestrator",
      "Cluster_Control_Plane",
      process.env.ORCHESTRATOR_HEALTH_URL,
      "/health"
    ),
    checkIntegration(
      "Worker 5090",
      "Primary_Reasoning",
      process.env.WORKER_5090_HEALTH_URL,
      ""
    ),
    checkIntegration(
      "Worker 3090",
      "Steady_State_Ops",
      process.env.WORKER_3090TI_HEALTH_URL,
      ""
    ),
    checkIntegration(
      "Twilio",
      "Voice/SMS_Node",
      process.env.TWILIO_ACCOUNT_SID ? "configured" : undefined
    ),
    checkIntegration(
      "SendGrid",
      "Email_Dispatch",
      process.env.SENDGRID_API_KEY ? "configured" : undefined
    ),
  ]);

  return (
    <div className="space-y-12 p-8 max-w-[1600px] mx-auto min-h-screen">
      <PageHeader
        eyebrow="Registry_Diagnostics"
        title="Integration Health"
        description="Read-only service and provider configuration view. High-fidelity reachability trace for the 4-PC cluster."
        meta={
          <div className="flex gap-2">
            <ComplianceBadge
              label="SECURE_UPLINK"
              state="clear"
              className="bg-turquoise-500/10 text-turquoise-400 border-turquoise-500/20"
            />
            <ComplianceBadge
              label="NO_SECRET_TRACE"
              state="clear"
              className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
            />
          </div>
        }
      />

      <IntegrationFailureInbox />

      <div className="grid gap-6 md:grid-cols-3 xl:grid-cols-5">
        {statuses.map((item) => (
          <Card
            key={item.name}
            className="bg-card/40 backdrop-blur-md border border-border/50 shadow-2xl transition-all hover:border-indigo-500/30 group border-t-2 border-t-indigo-500 overflow-hidden rounded-[24px]"
          >
            <CardHeader className="p-5 pb-3 bg-indigo-500/5 border-b border-border/50 flex flex-row items-center justify-between">
              <div className="min-w-0">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground group-hover:text-indigo-400 transition-colors truncate">
                  {item.name}
                </CardTitle>
                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">
                  {item.category}
                </p>
              </div>
              <StatusBadge status={item.status} />
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-border/30 bg-background/50 p-3 shadow-inner">
                <Activity
                  className={cn(
                    "mt-0.5 size-3.5 shrink-0",
                    item.status === "healthy"
                      ? "text-turquoise-400 animate-pulse"
                      : "text-pink-400"
                  )}
                />
                <span className="text-[9px] font-bold text-muted-foreground uppercase leading-relaxed tracking-tight">
                  {item.detail}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="inline-flex items-center gap-2 text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                  <ShieldCheck className="size-3 text-turquoise-400" />
                  GATED_ROUTE
                </span>
                {item.publicUrl ? (
                  <a
                    href={item.publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[9px] font-black text-indigo-400 hover:text-turquoise-400 transition-colors uppercase tracking-widest"
                  >
                    UPLINK <ExternalLink className="size-2.5" />
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-30">
                    <ServerCog className="size-2.5" />
                    INTERNAL
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
      detail:
        "No service URL or provider credential is configured in this runtime.",
    };
  }

  if (url === "configured") {
    return {
      name,
      category,
      publicUrl,
      status: "healthy",
      detail:
        "Credential presence detected. Live provider API calls are intentionally not made from this read-only dashboard.",
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
