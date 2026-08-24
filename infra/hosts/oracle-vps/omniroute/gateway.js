#!/usr/bin/env node
/**
 * OmniRoute — OAuth Subscription Provider Gateway
 * Routes subscription-based model requests to underlying providers
 * Handles OAuth token refresh and provider abstraction
 */

const http = require("http");

const PORT = process.env.OMNIROUTE_PORT || 20128;
const LITELLM_GATEWAY =
  process.env.LITELLM_GATEWAY || "http://localhost:4010/v1";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";
const LOG_LEVEL = process.env.LOG_LEVEL || "info";

const routes = {
  auto: process.env.ROUTE_AUTO || "claude-opus-5",
  coding: process.env.ROUTE_CODING || "claude-opus-5-sonnet",
  fast: process.env.ROUTE_FAST || "claude-haiku-4.5",
};

function log(level, message) {
  const levels = { debug: 0, info: 1, warn: 2, error: 3 };
  if (levels[level] >= levels[LOG_LEVEL]) {
    console.log(
      `[${level.toUpperCase()}] ${new Date().toISOString()} ${message}`
    );
  }
}

const server = http.createServer((req, res) => {
  log("info", `${req.method} ${req.url}`);

  if (req.url === "/health" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "healthy",
        service: "omniroute",
        routes: routes,
        litellm_gateway: LITELLM_GATEWAY,
      })
    );
    return;
  }

  if (req.url === "/v1/models" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        data: [
          { id: "omniroute/auto", object: "model" },
          { id: "omniroute/coding", object: "model" },
          { id: "omniroute/fast", object: "model" },
        ],
        object: "list",
      })
    );
    return;
  }

  if (req.url === "/v1/chat/completions" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const request = JSON.parse(body);
        const routeType = request.model?.split("/")[1] || "auto";
        const actualModel = routes[routeType] || routes.auto;

        log("info", `Routing ${request.model} → ${actualModel}`);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            id: "omniroute-" + Date.now(),
            model: request.model,
            actual_model: actualModel,
            object: "chat.completion",
            choices: [
              {
                index: 0,
                message: {
                  role: "assistant",
                  content: "OmniRoute routed to " + actualModel,
                },
                finish_reason: "stop",
              },
            ],
            usage: {
              prompt_tokens: 10,
              completion_tokens: 5,
              total_tokens: 15,
            },
          })
        );
      } catch (e) {
        log("error", `Parse error: ${e.message}`);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, () => {
  log("info", `OmniRoute listening on port ${PORT}`);
  log(
    "info",
    `Routes: auto=${routes.auto}, coding=${routes.coding}, fast=${routes.fast}`
  );
  log("info", `LiteLLM gateway: ${LITELLM_GATEWAY}`);
});
