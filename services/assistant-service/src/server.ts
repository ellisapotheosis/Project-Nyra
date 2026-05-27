import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { decideAssistantToolAccess } from "./index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8023;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "healthy", service: "assistant-service" });
});

// Tool access decision endpoint
app.post("/api/assistant/tools/decide", async (req, res) => {
  try {
    const decision = decideAssistantToolAccess(req.body);
    res.json(decision);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Assistant Service listening on port ${PORT}`);
});
