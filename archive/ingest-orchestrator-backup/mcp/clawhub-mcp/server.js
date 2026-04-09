const express = require("express");
const app = express();
app.use(express.json());
app.get("/health", (_, res) => res.json({ok:true, service:"clawhub-mcp"}));
app.post("/mcp", (req, res) => res.json({ok:true, note:"Adapter placeholder: wire OpenClaw/ClawHub APIs here", body:req.body || null}));
app.listen(8072, "0.0.0.0");
