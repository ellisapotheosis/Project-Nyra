import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import {
  normalizeProviderCallback,
  shouldRunInboundCompliance,
} from "./index.js";
import { TwilioProvider } from "./providers/twilio.js";
import { SendGridProvider, OutlookProvider } from "./providers/adapters.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8022;
const CRM_API_URL = process.env.CRM_API_URL;
const CRM_API_KEY = process.env.CRM_API_KEY;

app.use(helmet());
app.use(cors());
app.use(express.json());

const twilio = new TwilioProvider();
const sendgrid = new SendGridProvider();
const outlook = new OutlookProvider();

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "healthy", service: "communication-service" });
});

// Outbound send endpoint
app.post("/api/communications/send", async (req, res) => {
  const { channel, ...options } = req.body;
  let result;

  try {
    switch (channel) {
      case "SMS":
        result = await twilio.send(options);
        break;
      case "EMAIL":
        result =
          options.provider === "OUTLOOK"
            ? await outlook.send(options)
            : await sendgrid.send(options);
        break;
      default:
        return res.status(400).json({ error: "Unsupported channel" });
    }

    // Log to CRM
    if (CRM_API_URL) {
      await fetch(`${CRM_API_URL}/api/crm/write-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(CRM_API_KEY ? { "x-crm-api-key": CRM_API_KEY } : {}),
        },
        body: JSON.stringify({
          lead: { id: options.leadId },
          communicationLogs: [
            {
              leadId: options.leadId,
              channel,
              direction: "OUTBOUND",
              contentPreview: options.body.slice(0, 160),
              providerMessageId: result.providerMessageId,
              sentAt: new Date().toISOString(),
            },
          ],
        }),
      }).catch((err) =>
        console.error("Failed to log communication to CRM", err)
      );
    }

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Twilio Webhook
app.post("/api/webhooks/twilio", async (req, res) => {
  // In real app, verify signature: x-twilio-signature
  const payload = {
    provider: "TWILIO" as const,
    providerMessageId: req.body.MessageSid,
    leadId: req.body.From, // Simplified
    channel: "SMS" as const,
    direction:
      req.body.SmsStatus === "received"
        ? ("INBOUND" as const)
        : ("OUTBOUND" as const),
    status: req.body.SmsStatus.toUpperCase(),
    body: req.body.Body,
    occurredAt: new Date().toISOString(),
  };

  const entry = normalizeProviderCallback(payload);

  if (CRM_API_URL) {
    await fetch(`${CRM_API_URL}/api/crm/write-plan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(CRM_API_KEY ? { "x-crm-api-key": CRM_API_KEY } : {}),
      },
      body: JSON.stringify({
        lead: { id: payload.leadId },
        communicationLogs: [entry.details],
        auditEvents: [entry],
      }),
    });
  }

  res.send("<Response></Response>");
});

app.listen(PORT, () => {
  console.log(`Communication Service listening on port ${PORT}`);
});
