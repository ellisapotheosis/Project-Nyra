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
import {
  TwentyCRMClient,
  type QuoteInput,
  type MortgageLeadInput,
} from "@nyra/crm-client";
import {
  AuditLogger,
  ClassificationService,
  TwentyIntegrationAdapter,
} from "@nyra/integration-adapters";

dotenv.config();

const {
  PORT = "4001",
  DATABASE_URL,
  TWENTY_CRM_URL,
  TWENTY_CRM_API_KEY,
  N8N_WEBHOOK_URL,
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

const auditLogger = new AuditLogger({
  service: "crm-api",
  environment: process.env.NODE_ENV || "development",
});

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ALLOWED_ORIGINS
      ? process.env.CORS_ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
      : ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Auth middleware — fail-closed: reject if no API key is configured or if it doesn't match
const authenticate = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (!CRM_API_KEY) {
    logger.error("CRM_API_KEY is not configured — rejecting request");
    return res.status(503).json({ error: "Service misconfigured" });
  }
  const rawKey = req.headers["x-api-key"] || req.headers["x-crm-api-key"];
  const apiKey = Array.isArray(rawKey) ? rawKey[0] : rawKey;
  if (!apiKey || apiKey !== CRM_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// CRM Proxy Routes
app.get("/api/leads", authenticate, async (req, res) => {
  try {
    const leads = await twentyClient.request<any>("findManyMortgageLeads", {});
    res.json(leads);
  } catch (error) {
    logger.error("Failed to fetch leads", { error });
    res.status(500).json({ error: "Failed to fetch leads from CRM" });
  }
});

app.post("/api/leads", authenticate, async (req, res) => {
  try {
    const input = req.body as MortgageLeadInput;
    const result = await twentyClient.request<any>("createOneMortgageLead", {
      data: input,
    });

    // Log audit event
    await auditLogger.log({
      action: "LEAD_CREATE",
      entityId: result.createOneMortgageLead.id,
      entityType: "LEAD",
      performer: "SYSTEM_API",
      riskLevel: "INTERNAL_MUTATION",
    });

    res.json(result);
  } catch (error) {
    logger.error("Failed to create lead", { error });
    res.status(500).json({ error: "Failed to create lead in CRM" });
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

  return response.json() as Promise<any>;
}

// ... rest of the server code ...

const server = app.listen(PORT, () => {
  logger.info(`CRM API listening on port ${PORT}`);
});

export default server;
