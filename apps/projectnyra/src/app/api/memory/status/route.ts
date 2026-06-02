import { NextResponse } from "next/server";

type MemoryService = {
  name: string;
  role: string;
  urlEnv: string;
  url: string;
  status: "configured" | "online" | "degraded" | "unconfigured";
  latencyMs: number | null;
  detail: string;
};

const DEFAULT_TIMEOUT_MS = 2500;

const serviceTargets = [
  {
    name: "OpenMemory MCP",
    role: "visual memory manager",
    urlEnv: "OPENMEMORY_MCP_URL",
    fallbackEnv: "NEXT_PUBLIC_OPENMEMORY_URL",
    path: "/docs",
  },
  {
    name: "mem0",
    role: "primary memory API",
    urlEnv: "MEM0_API_URL",
    fallbackEnv: "NEXT_PUBLIC_MEM0_API_URL",
    path: "/health",
  },
  {
    name: "memOS",
    role: "experimental memory tensor layer",
    urlEnv: "MEMOS_API_URL",
    fallbackEnv: "NEXT_PUBLIC_MEMOS_API_URL",
    path: "/health",
  },
  {
    name: "Nexus Router",
    role: "singular AI/MCP endpoint",
    urlEnv: "NEXUS_ROUTER_URL",
    fallbackEnv: "NEXT_PUBLIC_NEXUS_ROUTER_URL",
    path: "/health",
  },
  {
    name: "Qdrant",
    role: "local vector backend",
    urlEnv: "QDRANT_URL",
    fallbackEnv: "NEXT_PUBLIC_QDRANT_URL",
    path: "/collections",
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
): Promise<MemoryService> {
  const url = process.env[target.urlEnv] || process.env[target.fallbackEnv] || "";

  if (!url) {
    return {
      name: target.name,
      role: target.role,
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
      role: target.role,
      urlEnv: `${target.urlEnv} / ${target.fallbackEnv}`,
      url,
      status: response.ok ? "online" : "degraded",
      latencyMs: Date.now() - startedAt,
      detail: `${response.status} ${response.statusText || "response"}`,
    };
  } catch (error) {
    return {
      name: target.name,
      role: target.role,
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
