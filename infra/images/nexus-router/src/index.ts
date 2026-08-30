import express from "express";

const app = express();
const PORT = process.env.PORT || 7000;

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "healthy", service: "nexus-router" });
});

app.get("/status", (req, res) => {
  res.json({
    status: "ready",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.post("/route", (req, res) => {
  const { path, method = "GET" } = req.body;
  res.json({
    path,
    method,
    routed: true,
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Nexus Router listening on port ${PORT}`);
});
