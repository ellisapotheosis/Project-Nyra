import { NextResponse } from "next/server";

import {
  canUseMockFallback,
  productionReadUnavailable,
} from "@/lib/api/config";
import { leads } from "@/lib/mock-data";

const CRM_API_URL = process.env.CRM_API_URL;
const CRM_API_KEY = process.env.CRM_API_KEY;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (CRM_API_URL) {
    try {
      const response = await fetch(`${CRM_API_URL}/api/leads/${id}`, {
        headers: {
          ...(CRM_API_KEY ? { "x-crm-api-key": CRM_API_KEY } : {}),
        },
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(withWorkspace(data, "crm-api"));
      }
    } catch {}
  }

  if (!canUseMockFallback()) {
    return productionReadUnavailable(
      "CRM API",
      "CRM_API_URL must be configured for production lead reads"
    );
  }

  const lead = leads.find((entry) => entry.id === id);
  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json(withWorkspace({ lead, source: "mock" }, "mock"));
}

function withWorkspace<
  T extends { lead?: Record<string, unknown>; source?: string },
>(data: T, source: string): T {
  if (!data.lead) {
    return data;
  }

  const lead = data.lead;
  const campaignStatus = String(lead.campaignStatus ?? "");
  const consentStatus = String(
    lead.consentStatus ?? (lead.hasConsent ? "OPTED_IN" : "UNKNOWN")
  );
  const doNotContact = Boolean(lead.doNotContact ?? lead.onDncList);

  return {
    ...data,
    lead: {
      ...lead,
      workspace: {
        source,
        crmBacked: source === "crm-api",
        compliance: {
          consentStatus,
          doNotContact,
          sendBlocked:
            doNotContact ||
            consentStatus === "OPTED_OUT" ||
            consentStatus === "DO_NOT_CONTACT",
        },
        campaign: {
          status: campaignStatus || "UNASSIGNED",
          canResume: campaignStatus === "PAUSED",
          canPause: campaignStatus === "ACTIVE",
          canStop: campaignStatus !== "STOPPED",
        },
        quote: {
          deterministicQuoteRequired: true,
          sourceOfTruth: "quote-service",
        },
      },
    },
  };
}
