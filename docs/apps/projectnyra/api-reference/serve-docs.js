#!/usr/bin/env node

/**
 * Simple HTTP server for viewing API documentation
 *
 * Usage:
 *   node serve-docs.js [port]
 *
 * Then open: http://localhost:3500
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.argv[2] || 3500;
const DOCS_DIR = __dirname;

const MIME_TYPES = {
  ".html": "text/html",
  ".yaml": "text/yaml",
  ".yml": "text/yaml",
  ".md": "text/markdown",
  ".json": "application/json",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const server = http.createServer((req, res) => {
  let filePath = req.url === "/" ? "/swagger-ui.html" : req.url;
  filePath = path.join(DOCS_DIR, filePath);

  // Security: prevent directory traversal
  if (!filePath.startsWith(DOCS_DIR)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("403 Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 Not Found");
      } else {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("500 Internal Server Error");
      }
      return;
    }

    const ext = path.extname(filePath);
    const mimeType = MIME_TYPES[ext] || "text/plain";

    res.writeHead(200, {
      "Content-Type": mimeType,
      "Access-Control-Allow-Origin": "*",
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log("🚀 API Documentation Server Started\n");
  console.log(`📖 Interactive Docs: http://localhost:${PORT}`);
  console.log(`📄 REST API:         http://localhost:${PORT}/REST-API.md`);
  console.log(`🔌 WebSocket API:    http://localhost:${PORT}/WEBSOCKET-API.md`);
  console.log(`🔧 MCP API:          http://localhost:${PORT}/MCP-API.md`);
  console.log(`📋 OpenAPI Spec:     http://localhost:${PORT}/openapi.yaml`);
  console.log("\n💡 Press Ctrl+C to stop the server\n");
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Error: Port ${PORT} is already in use`);
    console.error("   Try a different port: node serve-docs.js 3501");
  } else {
    console.error("❌ Server error:", err.message);
  }
  process.exit(1);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n\n👋 Shutting down server...");
  server.close(() => {
    console.log("✅ Server stopped");
    process.exit(0);
  });
});
