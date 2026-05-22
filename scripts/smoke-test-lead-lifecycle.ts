import { fileURLToPath } from "node:url";

import {
  InMemoryLeadIngestionStore,
  LeadIngestionService,
  type RawLeadPayload,
} from "../services/lead-ingestion/src/index.ts";

type FetchLike = typeof fetch;

export type LeadLifecycleSmokeOptions = {
  mode: "dry-run" | "live";
  crmApiUrl: string;
  crmApiKey?: string;
  now?: Date;
  fetchImpl?: FetchLike;
  log?: Pick<Console, "log" | "warn" | "error">;
};

type CrmWritePlanResponse = {
  lead?: {
    id?: string;
    source?: string;
  };
  campaignEnrollment?: unknown;
  auditEvents?: unknown[];
};

const DEFAULT_CRM_API_URL = "http://localhost:4001";
const DEFAULT_CAMPAIGN_ID = "smoke-lead-lifecycle";

export function buildSmokeLeadPayload(now = new Date()): RawLeadPayload {
  const stamp = now
    .toISOString()
    .replace(/[-:.TZ]/g, "")
    .slice(0, 14);

  return {
    externalId: `nyra-smoke-${stamp}`,
    firstName: "Smoke",
    lastName: "Lead",
    email: `smoke.lead.${stamp}@example.com`,
    phone: "+15551234567",
    source: "SMOKE_TEST",
    consentEmail: true,
    consentSms: true,
    consentVoice: false,
    campaignId: DEFAULT_CAMPAIGN_ID,
    loanPurpose: "PURCHASE",
    loanAmount: 450000,
    propertyState: "CA",
    metadata: {
      smokeTest: true,
      traceId: `lead-lifecycle-${stamp}`,
      expectedPath: "lead-ingestion->crm-api->twenty",
    },
  };
}

export function redactForLog(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactForLog(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => {
        if (isSensitiveKey(key)) {
          return [key, redactSensitiveScalar(item)];
        }

        if (isPublicTrackingKey(key)) {
          return [key, item];
        }

        return [key, redactForLog(item)];
      })
    );
  }

  return redactObservableScalar(value);
}

export function getRequiredLiveEnv(options: { crmApiKey?: string }): string[] {
  return options.crmApiKey ? [] : ["CRM_API_KEY"];
}

export async function runLeadLifecycleSmoke(
  options: LeadLifecycleSmokeOptions
): Promise<void> {
  const log = options.log ?? console;
  const fetchImpl = options.fetchImpl ?? fetch;
  const now = options.now ?? new Date();
  const crmApiUrl = trimTrailingSlash(options.crmApiUrl);
  const rawLead = buildSmokeLeadPayload(now);
  const ingestionService = new LeadIngestionService({
    store: new InMemoryLeadIngestionStore(),
    now: () => now,
    idFactory: () => buildDeterministicSmokeUuid(now),
  });
  const ingestionResult = await ingestionService.ingest(rawLead);

  log.log("Lead lifecycle smoke preflight", {
    mode: options.mode,
    crmApiUrl,
    lead: redactForLog({
      externalId: rawLead.externalId,
      email: rawLead.email,
      phone: rawLead.phone,
      source: rawLead.source,
      campaignId: rawLead.campaignId,
      traceId: rawLead.metadata?.traceId,
    }),
    crmWritePlan: {
      leadStage: ingestionResult.crmWritePlan.lead.stage,
      campaignStatus:
        ingestionResult.crmWritePlan.lead.customFields?.campaignStatus,
      campaignEligible: ingestionResult.campaignEligibility.eligible,
      auditEventCount: ingestionResult.crmWritePlan.auditEvents.length,
    },
  });

  if (options.mode === "dry-run") {
    log.log(
      "Dry run complete. Re-run with --live after CRM_API_URL and CRM_API_KEY are available from Infisical or the host environment."
    );
    return;
  }

  const missingEnv = getRequiredLiveEnv({ crmApiKey: options.crmApiKey });
  if (missingEnv.length > 0) {
    throw new Error(
      `Missing required live smoke env: ${missingEnv.join(", ")}`
    );
  }

  await assertHealth(fetchImpl, crmApiUrl);

  const writePlanResponse = await postJson<CrmWritePlanResponse>(
    fetchImpl,
    `${crmApiUrl}/api/crm/write-plan`,
    options.crmApiKey,
    { crmWritePlan: ingestionResult.crmWritePlan }
  );

  const leadId = writePlanResponse.lead?.id;
  if (!leadId) {
    throw new Error("CRM write-plan smoke did not return a lead id");
  }

  log.log("CRM write-plan accepted", {
    leadId,
    resultSource: writePlanResponse.lead?.source,
    campaignEnrollment: Boolean(writePlanResponse.campaignEnrollment),
    auditEventCount: writePlanResponse.auditEvents?.length ?? 0,
  });

  const stoppedResponse = await postJson(
    fetchImpl,
    `${crmApiUrl}/api/leads/${encodeURIComponent(leadId)}/campaign`,
    options.crmApiKey,
    { status: "STOPPED" },
    "PATCH"
  );

  log.log("Campaign stop gate verified through crm-api", {
    leadId,
    response: redactForLog(stoppedResponse),
  });

  const optionalWebhookUrl = trimTrailingSlash(
    process.env.LEAD_LIFECYCLE_OPTIONAL_WEBHOOK_URL ?? ""
  );
  if (optionalWebhookUrl) {
    await postJson(fetchImpl, optionalWebhookUrl, undefined, {
      type: "lead.lifecycle.smoke",
      leadId,
      traceId: rawLead.metadata?.traceId,
    });
    log.log("Optional execution webhook notified", {
      webhookUrl: redactForLog(optionalWebhookUrl),
    });
  }
}

function parseCliOptions(argv: string[], env: NodeJS.ProcessEnv) {
  const mode = argv.includes("--live") ? "live" : "dry-run";
  const crmApiUrl =
    getArgValue(argv, "--crm-api-url") ??
    env.CRM_API_URL ??
    DEFAULT_CRM_API_URL;

  return {
    mode,
    crmApiUrl,
    crmApiKey: env.CRM_API_KEY,
  } satisfies LeadLifecycleSmokeOptions;
}

function getArgValue(argv: string[], key: string): string | undefined {
  const index = argv.indexOf(key);
  if (index === -1) {
    return undefined;
  }

  return argv[index + 1];
}

async function assertHealth(
  fetchImpl: FetchLike,
  crmApiUrl: string
): Promise<void> {
  const response = await fetchImpl(`${crmApiUrl}/health`);
  if (!response.ok) {
    throw new Error(`CRM API health check failed with ${response.status}`);
  }
}

async function postJson<T = unknown>(
  fetchImpl: FetchLike,
  url: string,
  crmApiKey: string | undefined,
  body: unknown,
  method = "POST"
): Promise<T> {
  const response = await fetchImpl(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(crmApiKey ? { "x-crm-api-key": crmApiKey } : {}),
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  const parsed = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    throw new Error(
      `${method} ${url} failed with ${response.status}: ${JSON.stringify(
        redactForLog(parsed)
      )}`
    );
  }

  return parsed as T;
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function buildDeterministicSmokeUuid(now: Date): string {
  const suffix = String(now.getTime()).padStart(12, "0").slice(-12);
  return `00000000-0000-4000-8000-${suffix}`;
}

function isSensitiveKey(key: string): boolean {
  return /^(api[-_]?key|authorization|email|phone|secret|ssn|token)$/i.test(
    key
  );
}

function isPublicTrackingKey(key: string): boolean {
  return /^(correlationId|traceId)$/i.test(key);
}

function redactSensitiveScalar(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
    const [local, domain] = value.split("@");
    return `${local.slice(0, 1)}***@${domain}`;
  }

  const digits = value.replace(/\D/g, "");
  if (digits.length >= 10) {
    return `${value.startsWith("+") ? "+" : ""}${digits.slice(
      0,
      1
    )}******${digits.slice(-4)}`;
  }

  if (value.length > 8) {
    return `[redacted:${value.length}]`;
  }

  return "[redacted]";
}

function redactObservableScalar(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
    const [local, domain] = value.split("@");
    return `${local.slice(0, 1)}***@${domain}`;
  }

  const digits = value.replace(/\D/g, "");
  if (digits.length >= 10) {
    return `${value.startsWith("+") ? "+" : ""}${digits.slice(
      0,
      1
    )}******${digits.slice(-4)}`;
  }

  return value;
}

async function main(): Promise<void> {
  try {
    await runLeadLifecycleSmoke(
      parseCliOptions(process.argv.slice(2), process.env)
    );
  } catch (error) {
    console.error("Lead lifecycle smoke failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exitCode = 1;
  }
}

const isMainModule =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMainModule) {
  void main();
}
