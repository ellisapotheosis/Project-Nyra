import { randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import http from "node:http";
import { promisify } from "node:util";

import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

const execFileAsync = promisify(execFile);

const DEFAULT_ALLOWLIST = [
  "activepieces",
  "agent-vault",
  "cadvisor",
  "campaign-engine",
  "clawteam",
  "codebase-index-mcp",
  "crm-api",
  "firecrawl-mcp",
  "falkordb",
  "gastown",
  "gitea",
  "gitea-mcp",
  "gitea-ssh",
  "git-mcp",
  "gitingest-mcp",
  "grafana-oracle",
  "infisical",
  "infisical-mcp",
  "infisical-postgres",
  "infisical-redis",
  "letta",
  "letta-mcp",
  "litellm",
  "loki-oracle",
  "magicui-mcp",
  "mem0",
  "mem0-rest",
  "memos",
  "memos-mcp",
  "n8n",
  "next-devtools-mcp",
  "nexus",
  "nexus-ui",
  "openmemory-mcp",
  "openlit",
  "openlit-clickhouse-http",
  "openlit-clickhouse-native",
  "openlit-otlp-grpc",
  "openlit-otlp-http",
  "openwebui",
  "playwright-mcp",
  "portainer",
  "portainer-secure",
  "portainer-tunnel",
  "projectnyra",
  "prometheus-oracle",
  "quote-api",
  "quote-engine",
  "qdrant",
  "sequential-thinking-mcp",
  "shadcn-mcp",
  "supabase-db",
  "supabase-kong",
  "tailscale-mcp",
  "tavily-mcp",
  "twenty-crm",
  "twenty-mcp",
  "wcgw-mcp",
  "webapp",
];

const env = {
  caddyfile:
    process.env.NYRA_CADDYFILE || "/workspace/infra/hosts/oracle-vps/Caddyfile",
  dockerSocket: process.env.DOCKER_SOCKET || "/var/run/docker.sock",
  tailscaleBin: process.env.TAILSCALE_BIN || "tailscale",
  tailnetSuffix: process.env.NYRA_TAILNET_SUFFIX || "trex-fiordland.ts.net",
  deviceDns:
    process.env.NYRA_TAILSCALE_DEVICE_DNS || "oracle-vps.trex-fiordland.ts.net",
  serviceAllowlist: (
    process.env.NYRA_TAILSCALE_SERVICE_ALLOWLIST || DEFAULT_ALLOWLIST.join(",")
  )
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),
};

function jsonText(value) {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(value, null, 2),
      },
    ],
  };
}

async function runTailscale(args, timeout = 8000) {
  try {
    const result = await execFileAsync(env.tailscaleBin, args, {
      timeout,
      maxBuffer: 2 * 1024 * 1024,
      env: {
        ...process.env,
        TS_SOCKET:
          process.env.TAILSCALE_SOCKET ||
          process.env.TS_SOCKET ||
          "/var/run/tailscale/tailscaled.sock",
      },
    });
    return {
      ok: true,
      stdout: result.stdout.trim(),
      stderr: result.stderr.trim(),
    };
  } catch (error) {
    return {
      ok: false,
      stdout: error.stdout?.toString().trim() || "",
      stderr: error.stderr?.toString().trim() || error.message,
      code: error.code || null,
    };
  }
}

function requestDocker(path) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        socketPath: env.dockerSocket,
        method: "GET",
        path,
      },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`Docker API ${res.statusCode}: ${body}`));
            return;
          }
          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(error);
          }
        });
      }
    );
    req.on("error", reject);
    req.setTimeout(8000, () => req.destroy(new Error("Docker API timeout")));
    req.end();
  });
}

function summarizeContainer(container) {
  const ports = (container.Ports || []).map((port) => ({
    privatePort: port.PrivatePort,
    publicPort: port.PublicPort || null,
    type: port.Type,
    ip: port.IP || null,
  }));
  return {
    id: container.Id.slice(0, 12),
    names: (container.Names || []).map((name) => name.replace(/^\//, "")),
    image: container.Image,
    state: container.State,
    status: container.Status,
    ports,
    labels: container.Labels || {},
  };
}

function parseCaddyfile(source) {
  const mappings = [];
  const lines = source.split(/\r?\n/);
  let currentHosts = null;
  let blockDepth = 0;

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+#.*$/, "").trim();
    if (!line || line.startsWith("#")) continue;

    if (line.endsWith("{") && blockDepth === 0) {
      const hostPart = line.slice(0, -1).trim();
      currentHosts = hostPart
        .split(",")
        .map((host) => host.trim())
        .filter(Boolean);
      blockDepth = 1;
      continue;
    }

    if (line.includes("{")) blockDepth += (line.match(/{/g) || []).length;
    if (line.includes("}")) {
      blockDepth -= (line.match(/}/g) || []).length;
      if (blockDepth <= 0) {
        currentHosts = null;
        blockDepth = 0;
      }
      continue;
    }

    if (currentHosts && line.startsWith("reverse_proxy ")) {
      const target = line.split(/\s+/)[1];
      for (const host of currentHosts) {
        mappings.push({
          host,
          target,
          tailnetServiceCandidate: host.endsWith(`.${env.tailnetSuffix}`)
            ? host.slice(0, -1 * `.${env.tailnetSuffix}`.length)
            : null,
        });
      }
    }
  }

  return mappings;
}

function serviceNamesFromServeConfig(config) {
  const text = typeof config === "string" ? config : JSON.stringify(config);
  return Array.from(
    new Set(text.match(/svc:[a-z0-9][a-z0-9-]*/g) || [])
  ).sort();
}

async function getServeConfig() {
  const status = await runTailscale(["serve", "status", "--json"]);
  const getConfig = await runTailscale(["serve", "get-config", "--all"]);
  let parsedStatus = null;
  if (status.ok && status.stdout) {
    try {
      parsedStatus = JSON.parse(status.stdout);
    } catch {
      parsedStatus = status.stdout;
    }
  }
  return {
    status,
    getConfig,
    parsedStatus,
    serviceNames: serviceNamesFromServeConfig(
      `${status.stdout}\n${getConfig.stdout}`
    ),
  };
}

async function endpointInventory() {
  const [containers, caddySource, status, serve] = await Promise.all([
    requestDocker("/containers/json?all=0").then((items) =>
      items.map(summarizeContainer)
    ),
    readFile(env.caddyfile, "utf8").catch(
      (error) => `# Caddyfile unavailable: ${error.message}`
    ),
    runTailscale(["status", "--json"]),
    getServeConfig(),
  ]);

  const caddyMappings = caddySource.startsWith("# Caddyfile unavailable")
    ? []
    : parseCaddyfile(caddySource);
  const publishedPorts = new Set(
    containers.flatMap((container) =>
      container.ports.map((port) => port.publicPort).filter(Boolean)
    )
  );

  const observations = caddyMappings.map((mapping) => {
    const portMatch = mapping.target.match(/:(\d+)$/);
    const port = portMatch ? Number(portMatch[1]) : null;
    const isPublished = port ? publishedPorts.has(port) : false;
    const activeService = mapping.tailnetServiceCandidate
      ? serve.serviceNames.includes(`svc:${mapping.tailnetServiceCandidate}`)
      : false;

    return {
      host: mapping.host,
      target: mapping.target,
      port,
      targetPortPublishedByDocker: isPublished,
      tailnetServiceCandidate: mapping.tailnetServiceCandidate,
      tailscaleServiceConfigured: activeService,
      magicDnsNote: mapping.tailnetServiceCandidate
        ? "Requires a Tailscale Service with this name, or separate DNS; MagicDNS does not create arbitrary host records."
        : null,
    };
  });

  return {
    oracleDeviceDns: env.deviceDns,
    tailnetSuffix: env.tailnetSuffix,
    tailscaleStatus: status.ok ? JSON.parse(status.stdout || "{}") : status,
    tailscaleServeServices: serve.serviceNames,
    containers,
    caddyMappings,
    observations,
  };
}

function createServer() {
  const server = new McpServer({
    name: "project-nyra-tailscale-mcp",
    version: "0.1.0",
  });

  server.tool(
    "tailscale_status",
    "Return Tailscale status for the Oracle host.",
    {},
    async () => {
      const result = await runTailscale(["status", "--json"]);
      if (!result.ok) return jsonText(result);
      return jsonText(JSON.parse(result.stdout || "{}"));
    }
  );

  server.tool(
    "tailscale_serve_status",
    "Return Tailscale Serve status and service names.",
    {},
    async () => {
      return jsonText(await getServeConfig());
    }
  );

  server.tool(
    "docker_containers",
    "List running Docker containers and published ports.",
    {},
    async () => {
      const containers = await requestDocker("/containers/json?all=0");
      return jsonText(containers.map(summarizeContainer));
    }
  );

  server.tool(
    "oracle_endpoint_inventory",
    "Compare Docker published ports, Caddy routes, and Tailscale Serve services.",
    {},
    async () => {
      return jsonText(await endpointInventory());
    }
  );

  server.tool(
    "probe_endpoint",
    "Probe an HTTP(S) endpoint from the MCP server container.",
    {
      url: z.string().url(),
      timeoutMs: z.number().int().min(1000).max(15000).default(5000),
    },
    async ({ url, timeoutMs }) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const started = Date.now();
        const response = await fetch(url, {
          method: "GET",
          redirect: "manual",
          signal: controller.signal,
        });
        return jsonText({
          url,
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          elapsedMs: Date.now() - started,
          contentType: response.headers.get("content-type"),
        });
      } catch (error) {
        return jsonText({ url, ok: false, error: error.message });
      } finally {
        clearTimeout(timer);
      }
    }
  );

  server.tool(
    "configure_tailscale_service",
    "Dry-run or apply a Tailscale Service forwarder. Use mode=https for browser/MCP HTTP services, or mode=tcp for SSH/database/native TCP services.",
    {
      service: z.string().regex(/^[a-z0-9][a-z0-9-]{0,62}$/),
      target: z
        .string()
        .regex(
          /^(https?:\/\/)?(127\.0\.0\.1|localhost|100\.64\.0\.3):[0-9]{2,5}$/
        ),
      mode: z.enum(["https", "tcp"]).default("https"),
      listenPort: z.number().int().min(1).max(65535).default(443),
      apply: z.boolean().default(false),
    },
    async ({ service, target, mode, listenPort, apply }) => {
      if (!env.serviceAllowlist.includes(service)) {
        return jsonText({
          ok: false,
          error: `Service '${service}' is not in NYRA_TAILSCALE_SERVICE_ALLOWLIST.`,
          allowlist: env.serviceAllowlist,
        });
      }

      const normalizedTarget =
        mode === "tcp" ? target.replace(/^https?:\/\//, "") : target;
      const args = [
        "serve",
        `--service=svc:${service}`,
        mode === "tcp" ? `--tcp=${listenPort}` : `--https=${listenPort}`,
        "--yes",
        normalizedTarget,
      ];
      if (!apply) {
        return jsonText({
          ok: true,
          dryRun: true,
          command: [env.tailscaleBin, ...args].join(" "),
          expectedHostname: `${service}.${env.tailnetSuffix}`,
        });
      }

      const result = await runTailscale(args, 15000);
      return jsonText({
        ...result,
        expectedHostname: `${service}.${env.tailnetSuffix}`,
        note: result.ok
          ? "If the service requires admin approval, approve it in the Tailscale admin console before relying on DNS."
          : "Tailscale Services must exist or be allowed in the tailnet policy before this command can activate them.",
      });
    }
  );

  return server;
}

async function startStdio() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

function startHttp() {
  const app = createMcpExpressApp({
    host: "0.0.0.0",
    allowedHosts: [
      "127.0.0.1",
      "localhost",
      "tailscale-mcp",
      "nyra-network-nyra-tailscale-mcp",
    ],
  });
  const transports = new Map();
  const port = Number(process.env.PORT || 8780);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "project-nyra-tailscale-mcp" });
  });

  app.all("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"];
    let transport = sessionId ? transports.get(sessionId) : undefined;

    if (!transport) {
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (id) => {
          transports.set(id, transport);
        },
      });

      transport.onclose = () => {
        if (transport.sessionId) transports.delete(transport.sessionId);
      };

      const server = createServer();
      await server.connect(transport);
    }

    await transport.handleRequest(req, res, req.body);
  });

  app.listen(port, "0.0.0.0", () => {
    console.log(
      `Project Nyra Tailscale MCP listening on http://0.0.0.0:${port}/mcp`
    );
  });
}

if (process.argv.includes("--http")) {
  startHttp();
} else {
  await startStdio();
}
