import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { rateLimit } from "express-rate-limit";
import pg from "pg";
const { Pool } = pg;
import fetch from "node-fetch";
import winston from "winston";
import { z } from "zod";
import { TwentyCRMClient, type QuoteInput } from "@nyra/crm-client";
import type { CrmWritePlan } from "@nyra/crm-types";
import { PostgresAuditLedgerSink } from "./auditProvider.js";
import { executeCrmWritePlan } from "./writePlan.js";

dotenv.config();

const {
  PORT = "4001",
  DATABASE_URL,
  TWENTY_CRM_URL,
  TWENTY_CRM_API_KEY,
  QUOTE_ENGINE_URL,
  CRM_API_KEY,
} = process.env;

if (!DATABASE_URL) throw new Error("DATABASE_URL is required");
if (!TWENTY_CRM_URL) throw new Error("TWENTY_CRM_URL is required");
if (!TWENTY_CRM_API_KEY) throw new Error("TWENTY_CRM_API_KEY is required");

const pool = new Pool({ connectionString: DATABASE_URL });
const REDACTED = "[REDACTED]";
const LOG_SECRET_PATTERNS = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  /\b\d{3}-?\d{2}-?\d{4}\b/g,
  /\b(?:api[_-]?key|token|secret|authorization|password)\b\s*[:=]\s*["']?[^"',\s}]+/gi,
  /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi,
];

function redactLogText(value: string): string {
  return LOG_SECRET_PATTERNS.reduce(
    (current, pattern) => current.replace(pattern, REDACTED),
    value
  );
}

function redactLogValue(value: unknown, depth = 0): unknown {
  if (depth > 4) return "[REDACTED_DEPTH]";
  if (typeof value === "string") return redactLogText(value);
  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    value == null
  ) {
    return value;
  }
  if (value instanceof Error) {
    return {
      name: value.name,
      message: redactLogText(value.message),
      stack: value.stack ? redactLogText(value.stack) : undefined,
    };
  }
  if (Array.isArray(value)) {
    return value.map((entry) => redactLogValue(entry, depth + 1));
  }
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        /api[_-]?key|token|secret|authorization|password/i.test(key)
          ? REDACTED
          : redactLogValue(entry, depth + 1),
      ])
    );
  }
  return REDACTED;
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format((info) => redactLogValue(info) as typeof info)(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

const twentyClient = new TwentyCRMClient({
  endpoint: `${TWENTY_CRM_URL.replace(/\/$/, "")}/graphql`,
  apiKey: TWENTY_CRM_API_KEY,
});

const auditLedger = new PostgresAuditLedgerSink(pool);

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter as unknown as express.RequestHandler);

// Auth middleware
const authenticate = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const apiKey = req.headers["x-api-key"] ?? req.headers["x-crm-api-key"];
  if (CRM_API_KEY && apiKey !== CRM_API_KEY) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
};

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// CRM Proxy Routes
app.get("/api/leads", authenticate, async (req, res) => {
  try {
    const limit = Number(req.query.limit ?? 50);
    const leads = await twentyClient.searchContacts({ limit });
    res.json({ leads });
  } catch (error) {
    logger.error("Failed to fetch leads", { error });
    res.status(500).json({ error: "Failed to fetch leads from CRM" });
  }
});

app.get("/api/leads/:id", authenticate, async (req, res) => {
  const id = parseIdParam(req.params.id);
  try {
    const lead = await twentyClient.getContact(id);
    if (!lead) {
      res.status(404).json({ error: "Lead not found" });
      return;
    }

    const [quotes, campaignEnrollments, auditEvents] = await Promise.all([
      twentyClient.getQuotesForLead(id).catch(() => []),
      twentyClient.getActiveCampaigns(id).catch(() => []),
      auditLedger.listForEntity("LEAD", id, 25).catch(() => []),
    ]);

    res.json({
      lead: {
        ...lead,
        quotes,
        campaignEnrollments,
        auditEvents,
      },
      source: "crm-api",
    });
  } catch (error) {
    logger.error("Failed to fetch lead", { error, leadId: id });
    res.status(500).json({ error: "Failed to fetch lead from CRM" });
  }
});

app.get("/api/leads/:id/conversation", authenticate, async (req, res) => {
  const id = parseIdParam(req.params.id);
  try {
    const [logs, auditEvents] = await Promise.all([
      twentyClient.timeline(id, 50).catch(() => []),
      auditLedger.listForEntity("LEAD", id, 50).catch(() => []),
    ]);

    res.json({
      logs,
      auditEvents,
      timeline: mergeTimeline(logs, auditEvents),
      source: "crm-api",
    });
  } catch (error) {
    logger.error("Failed to fetch lead conversation", {
      error,
      leadId: id,
    });
    res.status(500).json({ error: "Failed to fetch lead conversation" });
  }
});

app.get("/api/dashboard/pipeline", authenticate, async (req, res) => {
  try {
    const limit = Number(req.query.limit ?? 500);
    const leads = await twentyClient.searchContacts({ limit });
    const grouped = new Map<string, number>();

    for (const lead of leads) {
      const status = getPipelineStatus(lead);
      grouped.set(status, (grouped.get(status) ?? 0) + 1);
    }

    res.json({
      pipeline: Array.from(grouped.entries()).map(([status, total]) => ({
        campaign_name: "Mortgage workspace",
        status,
        total,
        next_touch: null,
      })),
      source: "crm-api",
    });
  } catch (error) {
    logger.error("Failed to fetch pipeline summary", { error });
    res.status(500).json({ error: "Failed to fetch pipeline from CRM" });
  }
});

app.post("/api/leads", authenticate, async (req, res) => {
  try {
    const input = z
      .object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(1),
        source: z.string().optional(),
        customFields: z.record(z.string(), z.unknown()).optional(),
      })
      .parse(req.body);
    const result = await twentyClient.createContact(input);

    // Log audit event
    await auditLedger.log({
      action: "LEAD_CREATE",
      entityId: result.id,
      entityType: "LEAD",
      performer: "SYSTEM_API",
      riskLevel: "INTERNAL_MUTATION",
      occurredAt: new Date().toISOString(),
    });

    res.status(201).json(result);
  } catch (error) {
    logger.error("Failed to create lead", { error });
    res.status(500).json({ error: "Failed to create lead in CRM" });
  }
});

async function handleCrmWritePlan(req: express.Request, res: express.Response) {
  try {
    const plan = getCrmWritePlan(req.body);
    if (!plan) {
      res.status(400).json({
        error: "CrmWritePlan is required",
        detail:
          "Submit the normalized lead-ingestion result as { crmWritePlan } or a raw CrmWritePlan.",
      });
      return;
    }

    const result = await executeCrmWritePlan(
      plan,
      {
        createContact: (payload) => twentyClient.createContact(payload as any),
        updateContact: (id, payload) => twentyClient.updateContact(id, payload),
        getContact: (id) => twentyClient.getContact(id),
        searchContacts: (options) => twentyClient.searchContacts(options),
        enrollCampaign: (input) => twentyClient.enrollCampaign(input),
        logCommunication: (input) =>
          twentyClient.logCommunication(input as any),
        createQuote: (input) => twentyClient.createQuote(input as any),
      },
      auditLedger
    );

    res.status(202).json(result);
  } catch (error) {
    logger.error("Failed to execute CRM write plan", { error });
    res.status(500).json({ error: "Failed to execute CRM write plan" });
  }
}

app.post("/api/leads/ingest", authenticate, handleCrmWritePlan);
app.post("/api/crm/write-plan", authenticate, handleCrmWritePlan);

app.patch("/api/leads/:id/campaign", authenticate, async (req, res) => {
  const id = parseIdParam(req.params.id);
  try {
    const status = z.string().min(1).parse(req.body?.status);
    const result = await twentyClient.updateContact(id, {
      customFields: {
        campaignStatus: status,
        campaignUpdatedAt: new Date().toISOString(),
      },
    });

    await auditLedger.log({
      action: "CAMPAIGN_STATUS_UPDATED",
      entityId: id,
      entityType: "LEAD",
      performer: "crm-api",
      riskLevel: "INTERNAL_MUTATION",
      details: { status },
      occurredAt: new Date().toISOString(),
    });

    res.json({ success: true, lead: result, source: "crm-api" });
  } catch (error) {
    logger.error("Failed to update lead campaign status", {
      error,
      leadId: id,
    });
    res.status(500).json({ error: "Failed to update lead campaign status" });
  }
});

// Quote Engine Proxy
app.post("/api/quotes/generate", authenticate, async (req, res) => {
  try {
    const input = req.body as QuoteInput;
    const quote = await fetchQuoteEngine(input);
    res.json(quote);
  } catch (error) {
    logger.error("Quote generation failed", { error });
    res.status(502).json({
      error: "Quote engine unavailable",
      detail:
        "Deterministic pricing shard is offline. Manual override required.",
    });
  }
});

app.post("/api/quotes/:id/approve", authenticate, async (req, res) => {
  const id = parseIdParam(req.params.id);
  try {
    const approvedBy =
      typeof req.body?.approvedBy === "string" ? req.body.approvedBy : "broker";
    const quote = await twentyClient.request("updateQuoteStatus", {
      id,
      input: {
        status: "APPROVED",
        approvedBy,
        approvedAt: new Date().toISOString(),
      },
    });

    await auditLedger.log({
      action: "QUOTE_APPROVED",
      entityId: id,
      entityType: "QUOTE",
      performer: approvedBy,
      riskLevel: "INTERNAL_MUTATION",
      occurredAt: new Date().toISOString(),
    });

    res.json({ quote, source: "crm-api" });
  } catch (error) {
    logger.error("Failed to approve quote", { error, quoteId: id });
    res.status(500).json({ error: "Failed to approve quote" });
  }
});

async function fetchQuoteEngine(input: QuoteInput) {
  // Fixed: Fail closed when the quote engine is unavailable.
  // Removed local calculation fallback to prevent AI-generated term fabrication.
  if (!QUOTE_ENGINE_URL) {
    throw new Error(
      "QUOTE_ENGINE_URL is not configured. Deterministic math required."
    );
  }

  const response = await fetch(
    `${QUOTE_ENGINE_URL.replace(/\/$/, "")}/api/quotes/generate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );

  if (!response.ok) {
    throw new Error(`Quote engine returned status ${response.status}`);
  }

  return response.json() as Promise<unknown>;
}

function getCrmWritePlan(body: unknown): CrmWritePlan | undefined {
  if (!body || typeof body !== "object") {
    return undefined;
  }

  const candidate = body as { crmWritePlan?: unknown; lead?: unknown };
  const plan = candidate.crmWritePlan ?? body;

  if (!plan || typeof plan !== "object" || !("lead" in plan)) {
    return undefined;
  }

  return plan as CrmWritePlan;
}

function parseIdParam(value: string | undefined): string {
  return z.string().min(1).parse(value);
}

function getPipelineStatus(lead: Record<string, unknown>): string {
  const customFields = lead.customFields;
  const customStatus =
    customFields &&
    typeof customFields === "object" &&
    "campaignStatus" in customFields
      ? (customFields as Record<string, unknown>).campaignStatus
      : undefined;

  return String(customStatus ?? lead.status ?? "UNASSIGNED");
}

function mergeTimeline(logs: unknown[], auditEvents: unknown[]) {
  return [
    ...logs.map((entry) => ({ type: "communication", entry })),
    ...auditEvents.map((entry) => ({ type: "audit", entry })),
  ];
}

const server = app.listen(PORT, () => {
  logger.info(`CRM API listening on port ${PORT}`);
});

export default server;
