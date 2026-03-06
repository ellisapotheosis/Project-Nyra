const express = require("express");
const app = express();
app.use(express.json());
app.get("/health", (_, res) => res.json({ok:true, service:"n8n-mcp"}));
app.post("/mcp", (req, res) => res.json({ok:true, note:"Replace with real n8n MCP server package", body:req.body || null}));
app.listen(8071, "0.0.0.0");
