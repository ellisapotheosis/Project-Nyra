import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const port = Number(process.env.NYRA_STATUS_BRIDGE_INTERNAL_PORT || 8787);
const registryPath =
  process.env.NYRA_SERVICE_REGISTRY_PATH || "/app/infra/service-registry.yaml";
const authToken = process.env.NYRA_STATUS_BRIDGE_TOKEN || "";

function parseScalar(value) {
  const trimmed = value.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "[]") return [];
  if (trimmed === "''" || trimmed === '""') return "";
  if (/^-?\d+$/.test(trimmed)) return Number(trimmed);
  return trimmed.replace(/^['"]|['"]$/g, "");
}

export function parseRegistryYaml(source) {
  const services = [];
  let current = null;
  let currentNestedKey = null;

  for (const line of source.split(/\r?\n/)) {
    const itemMatch = line.match(/^\s*-\s+id:\s*(.*)$/);
    if (itemMatch) {
      current = { id: parseScalar(itemMatch[1]) };
      services.push(current);
      currentNestedKey = null;
      continue;
    }

    if (!current) continue;

    const keyMatch = line.match(/^  ([a-zA-Z0-9_]+):(?:\s*(.*))?$/);
    if (keyMatch) {
      const [, key, rawValue = ""] = keyMatch;
      if (rawValue === "") {
        current[key] = key === "ports" ? [] : {};
        currentNestedKey = key;
      } else {
        current[key] = parseScalar(rawValue);
        currentNestedKey = null;
      }
      continue;
    }

    const nestedMatch = line.match(/^    ([a-zA-Z0-9_]+):\s*(.*)$/);
    if (nestedMatch && currentNestedKey) {
      const [, key, rawValue] = nestedMatch;
      current[currentNestedKey][key] = parseScalar(rawValue);
      continue;
    }

    const listMatch = line.match(/^  -\s*(.*)$/);
    if (
      listMatch &&
      currentNestedKey &&
      Array.isArray(current[currentNestedKey])
    ) {
      current[currentNestedKey].push(parseScalar(listMatch[1]));
    }
  }

  return services;
}

export async function loadServices() {
  const source = await readFile(registryPath, "utf8");
  return parseRegistryYaml(source);
}

export function summarize(services) {
  const hosts = new Map();
  for (const service of services) {
    const host = service.host || "unknown";
    hosts.set(host, (hosts.get(host) || 0) + 1);
  }

  return {
    generated_at: new Date().toISOString(),
    overall: "unknown",
    hosts: [...hosts.entries()].map(([id, service_count]) => ({
      id,
      status: "unknown",
      service_count,
    })),
    services: services.map((service) => ({
      id: service.id,
      name: service.name,
      status: "unknown",
      url: service.public_url,
      host: service.host,
      risk_level: service.risk_level,
      requires_auth: service.requires_auth,
      iframe_policy: service.iframe_policy,
    })),
    tunnels: [
      ...new Set(services.map((service) => service.host).filter(Boolean)),
    ]
      .filter((host) => ["oracle", "orchestrator"].includes(host))
      .map((id) => ({ id: `${id}-tunnel`, status: "unknown" })),
    workers: services
      .filter((service) => String(service.host || "").startsWith("worker-"))
      .map((service) => ({
        id: service.host,
        service: service.id,
        status: "unknown",
      })),
  };
}

function isAuthorized(request) {
  if (request.url === "/health") return true;
  if (!authToken) return false;
  const header = request.headers.authorization || "";
  return header === `Bearer ${authToken}`;
}

export const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", "http://localhost");

    if (!isAuthorized(request)) {
      response.writeHead(401, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: "unauthorized" }));
      return;
    }

    if (url.pathname === "/health") {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ status: "ok" }));
      return;
    }

    const services = await loadServices();
    const status = summarize(services);
    const routes = {
      "/api/status": status,
      "/api/status/services": status.services,
      "/api/status/hosts": status.hosts,
      "/api/status/tunnels": status.tunnels,
      "/api/status/workers": status.workers,
    };

    if (!(url.pathname in routes)) {
      response.writeHead(404, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: "not_found" }));
      return;
    }

    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(routes[url.pathname], null, 2));
  } catch (error) {
    response.writeHead(500, { "content-type": "application/json" });
    response.end(
      JSON.stringify({ error: "status_bridge_error", message: error.message })
    );
  }
});

if (import.meta.url === `file://${process.argv[1]}`) {
  server.listen(port, "0.0.0.0", () => {
    console.log(`nyra-status-bridge listening on ${port}`);
  });
}
