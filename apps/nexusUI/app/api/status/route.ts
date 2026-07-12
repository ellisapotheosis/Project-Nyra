import { NextResponse } from "next/server";

import { serviceProbes } from "@/lib/nexus-data";

type ProbeRecord = {
  id: string;
  status: "healthy" | "degraded" | "offline" | "unknown";
  httpStatus?: number;
  checkedAt?: string;
  latencyMs?: number;
  error?: string;
};

async function probe(url: string, path: string, timeoutMs = 2500) {
  const startedAt = performance.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(new URL(path, url), {
      signal: controller.signal,
      cache: "no-store",
    });

    const latencyMs = Math.round(performance.now() - startedAt);
    return {
      ok: response.ok,
      status: response.status,
      latencyMs,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      latencyMs: Math.round(performance.now() - startedAt),
      error: error instanceof Error ? error.message : "probe failed",
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET() {
  const probes: ProbeRecord[] = await Promise.all(
    serviceProbes.map(async (service) => {
      const result = await probe(service.url, service.path);

      return {
        id: service.id,
        status: result.ok
          ? "healthy"
          : result.status > 0
            ? "degraded"
            : "offline",
        httpStatus: result.status || undefined,
        checkedAt: new Date().toISOString(),
        latencyMs: result.latencyMs,
        error: result.error,
      };
    })
  );

  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    probes,
  });
}
