import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { CampaignService, InMemoryCampaignEnrollmentStore } from "./index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8021;

app.use(helmet());
app.use(cors());
app.use(express.json());

const store = new InMemoryCampaignEnrollmentStore();
const service = new CampaignService(store);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "healthy", service: "campaign-service" });
});

// List campaigns
app.get("/api/campaigns", async (req, res) => {
  // Mock listing campaigns - in real app, fetch from DB
  res.json({
    campaigns: [
      {
        id: "speed-to-lead",
        name: "Speed to Lead",
        steps: [
          {
            id: "s1",
            channel: "SMS",
            delayMinutes: 5,
            templateId: "sms-intro",
          },
          {
            id: "s2",
            channel: "EMAIL",
            delayMinutes: 60,
            templateId: "email-followup",
          },
        ],
        loanPurpose: "PURCHASE",
        active: true,
      },
    ],
  });
});

// Enroll a lead in a campaign
app.post("/api/campaigns/enroll", async (req, res) => {
  try {
    const result = await service.enroll(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Transition enrollment state
app.post("/api/campaigns/enrollments/:id/transition", async (req, res) => {
  try {
    const result = await service.transitionEnrollment(
      req.params.id,
      req.body.event
    );
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Execute campaign steps (Cron or Webhook triggered)
app.post("/api/campaigns/execute-pending", async (req, res) => {
  // This would find all ACTIVE enrollments where nextTouchAt <= now
  // For each, it would evaluateSend and if eligible, emit an n8n job
  res.json({ message: "Not implemented: Cron-based execution" });
});

app.listen(PORT, () => {
  console.log(`Campaign Service listening on port ${PORT}`);
});
