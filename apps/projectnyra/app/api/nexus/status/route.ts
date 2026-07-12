import { NextResponse } from "next/server";

type NexusService = {
  name: string;
  urlEnv: string;
  url: string;
  status: "configured" | "online" | "degraded" | "unconfigured";
  latencyMs: number | null;
  detail: string;
};

const DEFAULT_TIMEOUT_MS = 2500;

const serviceTargets = [
  {
    name: "Nexus Router",
    urlEnv: "NEXUS_ROUTER_URL",
    fallbackEnv: "NEXT_PUBLIC_NEXUS_ROUTER_URL",
    path: "/health",
  },
  {
    name: "LiteLLM",
    urlEnv: "LITELLM_PROXY_URL",
    fallbackEnv: "NEXT_PUBLIC_LITELLM_URL",
    path: "/health",
  },
  {
    name: "Grafbase",
    urlEnv: "GRAFBASE_URL",
    fallbackEnv: "NEXT_PUBLIC_GRAFBASE_URL",
    path: "/health",
  },
  {
    name: "Grafana",
    urlEnv: "GRAFANA_URL",
    fallbackEnv: "NEXT_PUBLIC_GRAFANA_URL",
    path: "/api/health",
  },
  {
    name: "Twenty CRM",
    urlEnv: "TWENTY_CRM_URL",
    fallbackEnv: "NEXT_PUBLIC_TWENTY_URL",
    path: "/health",
  },
  {
    name: "OpenClaw",
    urlEnv: "OPENCLAW_PUBLIC_BASE_URL",
    fallbackEnv: "NEXT_PUBLIC_OPENCLAW_URL",
    path: "/health",
  },
];

export const dynamic = "force-dynamic";

export async function GET() {
  const services = await Promise.all(serviceTargets.map(checkService));
  const online = services.filter((service) => service.status === "online");
  const configured = services.filter(
    (service) => service.status !== "unconfigured"
  );

  return NextResponse.json({
    services,
    summary: {
      total: services.length,
      configured: configured.length,
      online: online.length,
      generatedAt: new Date().toISOString(),
    },
  });
}

async function checkService(
  target: (typeof serviceTargets)[number]
): Promise<NexusService> {
  const url =
    process.env[target.urlEnv] || process.env[target.fallbackEnv] || "";

  if (!url) {
    return {
      name: target.name,
      urlEnv: `${target.urlEnv} / ${target.fallbackEnv}`,
      url: "",
      status: "unconfigured",
      latencyMs: null,
      detail: "Set one of the URL env vars to enable live monitoring.",
    };
  }

  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(`${url.replace(/\/$/, "")}${target.path}`, {
      cache: "no-store",
      signal: controller.signal,
    });

    return {
      name: target.name,
      urlEnv: `${target.urlEnv} / ${target.fallbackEnv}`,
      url,
      status: response.ok ? "online" : "degraded",
      latencyMs: Date.now() - startedAt,
      detail: `${response.status} ${response.statusText || "response"}`,
    };
  } catch (error) {
    return {
      name: target.name,
      urlEnv: `${target.urlEnv} / ${target.fallbackEnv}`,
      url,
      status: "degraded",
      latencyMs: Date.now() - startedAt,
      detail: error instanceof Error ? error.message : "Health check failed",
    };
  } finally {
    clearTimeout(timeout);
  }
}
