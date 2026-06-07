import { NextResponse } from "next/server";

import {
  canUseMockFallback,
  productionReadUnavailable,
  productionWriteUnavailable,
} from "@/lib/api/config";
import { leads } from "@/lib/mock-data";

const CRM_API_URL = process.env.CRM_API_URL;
const CRM_API_KEY = process.env.CRM_API_KEY;
const LEAD_INGESTION_API_URL = process.env.LEAD_INGESTION_API_URL;
const LEAD_INGESTION_API_KEY = process.env.LEAD_INGESTION_API_KEY;
const LEAD_INGESTION_TIMEOUT_MS = 10_000;

export async function GET() {
  if (CRM_API_URL) {
    try {
      const response = await fetch(`${CRM_API_URL}/api/leads`, {
        headers: {
          ...(CRM_API_KEY ? { "x-crm-api-key": CRM_API_KEY } : {}),
        },
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch {}
  }

  if (!canUseMockFallback()) {
    return productionReadUnavailable(
      "CRM API",
      "CRM_API_URL must be configured for production lead reads"
    );
  }

  return NextResponse.json({ leads, source: "mock" });
}

export async function POST(request: Request) {
  const payload = await request.json();
  let upstreamError: unknown;

  if (LEAD_INGESTION_API_URL) {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      LEAD_INGESTION_TIMEOUT_MS
    );

    try {
      const response = await fetch(
        `${LEAD_INGESTION_API_URL}/api/leads/ingest`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(LEAD_INGESTION_API_KEY
              ? { "x-lead-ingestion-api-key": LEAD_INGESTION_API_KEY }
              : {}),
            ...(CRM_API_KEY ? { "x-crm-api-key": CRM_API_KEY } : {}),
          },
          body: JSON.stringify(payload),
          cache: "no-store",
          signal: controller.signal,
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        return NextResponse.json(data, { status: response.status });
      }

      return NextResponse.json(
        {
          error: "Lead ingestion failed",
          detail: data,
          source: "lead-ingestion",
        },
        { status: response.status }
      );
    } catch (error) {
      upstreamError = error;
    } finally {
      clearTimeout(timeout);
    }
  }

  if (!canUseMockFallback()) {
    return productionWriteUnavailable(
      "Lead ingestion",
      upstreamError
        ? "Configured lead ingestion service could not be reached"
        : "LEAD_INGESTION_API_URL must be configured for production lead writes"
    );
  }

  const now = new Date().toISOString();
  const lead = {
    id: `local-${Date.now()}`,
    firstName: payload.firstName ?? payload.name?.split(" ")[0] ?? "New",
    lastName:
      payload.lastName ?? payload.name?.split(" ").slice(1).join(" ") ?? "Lead",
    email: payload.email,
    phone: payload.phone,
    source: payload.source ?? "projectnyra-local",
    campaignStatus: payload.campaignId ? "PENDING_INGESTION" : "UNASSIGNED",
    loanPurpose: payload.loanPurpose ?? "General",
    loanAmount: Number(payload.loanAmount ?? 0),
    campaignId: payload.campaignId ?? "",
    lastTouch: "Not contacted",
    nextTouch: "Pending CRM write",
    location: payload.propertyState ?? "Unknown",
    creditBand: "Unknown",
    stage: "New",
    workspace: {
      crmWritePath: "mock",
      dedupeKey: payload.email
        ? `email:${String(payload.email).trim().toLowerCase()}`
        : undefined,
      auditRequired: true,
      createdAt: now,
    },
  };

  return NextResponse.json(
    {
      lead,
      source: "mock",
      warning: "LEAD_INGESTION_API_URL is not configured",
    },
    { status: 202 }
  );
}
