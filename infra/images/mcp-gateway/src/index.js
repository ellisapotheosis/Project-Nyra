const express = require("express");

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "healthy", service: "mcp-gateway" });
});

app.post("/mcp/call", (req, res) => {
  const { method, params } = req.body;
  res.json({
    method,
    params,
    result: { success: true },
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`MCP Gateway listening on port ${PORT}`);
});
