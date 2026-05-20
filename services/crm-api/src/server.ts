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
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
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

const server = app.listen(PORT, () => {
  logger.info(`CRM API listening on port ${PORT}`);
});

export default server;
