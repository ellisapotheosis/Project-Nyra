import { fileURLToPath } from "node:url";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

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
  reportPath?: string;
  now?: Date;
  fetchImpl?: FetchLike;
  log?: Pick<Console, "log" | "warn" | "error">;
};

export type LeadLifecycleSmokeReport = {
  schemaVersion: 1;
  mode: LeadLifecycleSmokeOptions["mode"];
  status: "passed" | "failed";
  startedAt: string;
  completedAt: string;
  crmApiUrl: string;
  traceId?: unknown;
  lead: unknown;
  crmWritePlan: {
    leadStage: unknown;
    campaignStatus: unknown;
    campaignEligible: boolean;
    auditEventCount: number;
  };
  steps: Array<{
    name: string;
    status: "passed" | "skipped" | "failed";
    detail?: unknown;
  }>;
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
  const steps: LeadLifecycleSmokeReport["steps"] = [
    {
      name: "lead-ingestion.normalize-and-plan",
      status: "passed",
      detail: {
        dedupeOutcome: ingestionResult.dedupeOutcome,
        campaignEligibility: ingestionResult.campaignEligibility,
      },
    },
  ];
  let reportStatus: LeadLifecycleSmokeReport["status"] = "passed";

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

  try {
    if (options.mode === "dry-run") {
      steps.push({
        name: "crm-api.live-write",
        status: "skipped",
        detail: "dry-run",
      });
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

    await assertHealth(fetchImpl, crmApiUrl, options.crmApiKey);
    steps.push({
      name: "crm-api.health",
      status: "passed",
    });

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

    steps.push({
      name: "crm-api.write-plan",
      status: "passed",
      detail: {
        leadId,
        resultSource: writePlanResponse.lead?.source,
        campaignEnrollment: Boolean(writePlanResponse.campaignEnrollment),
        auditEventCount: writePlanResponse.auditEvents?.length ?? 0,
      },
    });

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

    steps.push({
      name: "crm-api.campaign-stop-gate",
      status: "passed",
      detail: redactForLog(stoppedResponse),
    });

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
      steps.push({
        name: "optional-execution-webhook",
        status: "passed",
        detail: { webhookUrl: redactForLog(optionalWebhookUrl) },
      });
      log.log("Optional execution webhook notified", {
        webhookUrl: redactForLog(optionalWebhookUrl),
      });
    }
  } catch (error) {
    reportStatus = "failed";
    steps.push({
      name: "lead-lifecycle-smoke",
      status: "failed",
      detail: error instanceof Error ? error.message : String(error),
    });
    throw error;
  } finally {
    if (options.reportPath) {
      await writeSmokeReport(options.reportPath, {
        schemaVersion: 1,
        mode: options.mode,
        status: reportStatus,
        startedAt: now.toISOString(),
        completedAt: (options.now ?? new Date()).toISOString(),
        crmApiUrl,
        traceId: rawLead.metadata?.traceId,
        lead: redactForLog({
          externalId: rawLead.externalId,
          email: rawLead.email,
          phone: rawLead.phone,
          source: rawLead.source,
          campaignId: rawLead.campaignId,
        }),
        crmWritePlan: {
          leadStage: ingestionResult.crmWritePlan.lead.stage,
          campaignStatus:
            ingestionResult.crmWritePlan.lead.customFields?.campaignStatus,
          campaignEligible: ingestionResult.campaignEligibility.eligible,
          auditEventCount: ingestionResult.crmWritePlan.auditEvents.length,
        },
        steps: redactForLog(steps) as LeadLifecycleSmokeReport["steps"],
      });
    }
  }
}

function parseCliOptions(argv: string[], env: NodeJS.ProcessEnv) {
  const mode = argv.includes("--live") ? "live" : "dry-run";
  const crmApiUrl =
    getArgValue(argv, "--crm-api-url") ??
    env.CRM_API_URL ??
    DEFAULT_CRM_API_URL;
  const reportPath =
    getArgValue(argv, "--report") ??
    (argv.includes("--report-dir")
      ? buildDefaultReportPath(getArgValue(argv, "--report-dir"))
      : undefined);

  return {
    mode,
    crmApiUrl,
    crmApiKey: env.CRM_API_KEY,
    reportPath,
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
  crmApiUrl: string,
  crmApiKey?: string
): Promise<void> {
  const response = await fetchImpl(`${crmApiUrl}/health`, {
    headers: {
      ...(crmApiKey ? { "x-crm-api-key": crmApiKey } : {}),
    },
  });
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
  const parsed = parseJsonResponseBody(text);

  if (!response.ok) {
    throw new Error(
      `${method} ${url} failed with ${response.status}: ${formatResponseForLog(
        parsed,
        text
      )}`
    );
  }

  return parsed as T;
}

function parseJsonResponseBody(text: string): unknown {
  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function formatResponseForLog(parsed: unknown, text: string): string {
  if (parsed !== undefined) {
    return JSON.stringify(redactForLog(parsed));
  }

  return JSON.stringify({
    nonJsonBody: text.slice(0, 500),
  });
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function buildDefaultReportPath(reportDir: string | undefined): string {
  return join(reportDir ?? "tests/results/lead-lifecycle-smoke", "latest.json");
}

async function writeSmokeReport(
  reportPath: string,
  report: LeadLifecycleSmokeReport
): Promise<void> {
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
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
