const express = require("express");
const app = express();
app.use(express.json());
app.get("/health", (_, res) => res.json({ok:true, service:"twenty-mcp"}));
app.post("/mcp", (req, res) => res.json({ok:true, note:"Replace with jezweb/twenty-mcp-server or twenty-crm-mcp-server image", body:req.body || null}));
app.listen(8070, "0.0.0.0");
