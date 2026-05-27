import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { LeadIngestionService, validateRawLeadPayload } from "./index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8020;
const CRM_API_URL = process.env.CRM_API_URL;
const CRM_API_KEY = process.env.CRM_API_KEY;

app.use(helmet());
app.use(cors());
app.use(express.json());

const ingestionService = new LeadIngestionService();

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "healthy", service: "lead-ingestion" });
});

// Ingest endpoint
app.post("/api/leads/ingest", async (req, res) => {
  try {
    const rawPayload = validateRawLeadPayload(req.body);
    const result = await ingestionService.ingest(rawPayload);

    // If CRM_API_URL is configured, we can optionally trigger the persistence here
    // or return the crmWritePlan to the caller.
    // The webapp usually wants the write plan executed.

    if (CRM_API_URL) {
      const response = await fetch(`${CRM_API_URL}/api/crm/write-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(CRM_API_KEY ? { "x-crm-api-key": CRM_API_KEY } : {}),
        },
        body: JSON.stringify(result.crmWritePlan),
      });

      if (response.ok) {
        const crmResult = await response.json();
        return res.status(202).json({
          ...result,
          crmResult,
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        return res.status(502).json({
          error: "CRM API persistence failed",
          details: errorData,
          crmWritePlan: result.crmWritePlan,
        });
      }
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Lead ingestion error:", error);
    return res.status(400).json({
      error: "Validation failed or ingestion error",
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Lead Ingestion Service listening on port ${PORT}`);
});
