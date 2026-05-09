import { NextResponse } from "next/server";

async function probe(url: string, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
    });

    return {
      ok: response.ok,
      status: response.status,
      url,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      url,
      error: error instanceof Error ? error.message : "unknown error",
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET() {
  const nexusBaseUrl = process.env.NEXUS_BASE_URL ?? "http://127.0.0.1:6000";
  const liteLLMBaseUrl = process.env.LITELLM_BASE_URL ?? "http://127.0.0.1:4000";
  const liteLLMMasterKey = process.env.LITELLM_MASTER_KEY;
  const headers = liteLLMMasterKey ? { Authorization: `Bearer ${liteLLMMasterKey}` } : undefined;

  const [nexus, liteLLM] = await Promise.all([
    probe(new URL("/health", nexusBaseUrl).toString()),
    probe(new URL("/health/readiness", liteLLMBaseUrl).toString(), { headers }),
  ]);

  return NextResponse.json({ nexus, liteLLM, checkedAt: new Date().toISOString() });
}
