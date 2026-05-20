import { NextResponse } from "next/server";

import { campaigns } from "@/lib/mock-data";

export function GET() {
  return NextResponse.json({ campaigns, source: "mock" });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const steps: Array<Record<string, unknown>> = Array.isArray(payload.steps)
    ? payload.steps
    : [];

  return NextResponse.json(
    {
      success: true,
      campaign: {
        id: `campaign-${Date.now()}`,
        ...payload,
        active: payload.active ?? payload.status === "ACTIVE",
        status: payload.status ?? "DRAFT",
        steps: steps.map((step, index) => ({
          id: step.id ?? `step-${index + 1}`,
          channel: step.channel ?? "SMS",
          delayMinutes: Number(step.delayMinutes ?? 0),
          templateId: step.templateId ?? `template-${index + 1}`,
          requiresApproval: step.requiresApproval === true,
        })),
        contract: {
          sourceOfTruth: "campaign-service",
          stateMachine: "nyra-campaign-v1",
          sendEligibilityRequiresCompliance: true,
        },
      },
      source: "mock",
    },
    { status: 201 }
  );
}
