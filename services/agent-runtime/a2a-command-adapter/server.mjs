import http from "node:http";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const PORT = Number(process.env.PORT || 8762);
const HOST = process.env.HOST || "0.0.0.0";
const DRIVER = process.env.ADAPTER_DRIVER || "command";
const STATE_DIR = process.env.ADAPTER_STATE_DIR || path.join(process.env.HOME || "/tmp", ".local/state/nyra-a2a");
const AGENT_NAME = process.env.AGENT_NAME || "nyra-command-agent";
const AGENT_DESCRIPTION = process.env.AGENT_DESCRIPTION || "Project Nyra stateful command-backed agent";
const PUBLIC_URL = process.env.AGENT_PUBLIC_URL || `http://${HOST}:${PORT}`;
const MAX_BODY = Number(process.env.MAX_BODY_BYTES || 2_000_000);
const TIMEOUT_MS = Number(process.env.ADAPTER_TIMEOUT_MS || 900_000);
const tasks = new Map();
const children = new Map();

await mkdir(STATE_DIR, { recursive: true });

function now() { return new Date().toISOString(); }
function taskPath(id) { return path.join(STATE_DIR, `${id}.json`); }
function rpcResult(id, result) { return { jsonrpc: "2.0", id: id ?? null, result }; }
function rpcError(id, code, message, data) { return { jsonrpc: "2.0", id: id ?? null, error: { code, message, ...(data ? { data } : {}) } }; }
function textPart(text) { return { kind: "text", text: String(text ?? "") }; }

function publicTask(task) {
  return {
    kind: "task",
    id: task.id,
    contextId: task.contextId,
    status: { state: task.state, timestamp: task.updatedAt, ...(task.error ? { message: { role: "agent", parts: [textPart(task.error)] } } : {}) },
    artifacts: task.output == null ? [] : [{ artifactId: `${task.id}-result`, name: "response", parts: [textPart(task.output)] }],
    metadata: { agent: AGENT_NAME, traceId: task.traceId, sessionId: task.sessionId }
  };
}

async function persist(task) {
  tasks.set(task.id, task);
  await writeFile(taskPath(task.id), JSON.stringify(task, null, 2), { mode: 0o600 });
}

async function loadTask(id) {
  if (tasks.has(id)) return tasks.get(id);
  try {
    const task = JSON.parse(await readFile(taskPath(id), "utf8"));
    tasks.set(id, task);
    return task;
  } catch { return null; }
}

function extractText(params = {}) {
  const message = params.message || params;
  const parts = message.parts || message.content || [];
  if (typeof parts === "string") return parts;
  if (Array.isArray(parts)) return parts.map((part) => part?.text ?? part?.content ?? part?.root?.text ?? "").filter(Boolean).join("\n");
  return message.text || params.text || "";
}

async function runOpenAI(task, prompt, headers) {
  const base = (process.env.ADAPTER_OPENAI_BASE_URL || "").replace(/\/$/, "");
  const key = process.env.ADAPTER_OPENAI_API_KEY || "not-needed";
  const model = process.env.ADAPTER_OPENAI_MODEL || "default";
  if (!base) throw new Error("ADAPTER_OPENAI_BASE_URL is required for openai driver");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${key}`,
        ...(headers.traceId ? { "x-litellm-trace-id": headers.traceId } : {}),
        ...(headers.agentId ? { "x-litellm-agent-id": headers.agentId } : {})
      },
      body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], stream: false }),
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`upstream ${response.status}: ${await response.text()}`);
    const body = await response.json();
    return body?.choices?.[0]?.message?.content ?? JSON.stringify(body);
  } finally { clearTimeout(timer); }
}

function parseCommand() {
  const raw = process.env.ADAPTER_COMMAND_JSON;
  if (!raw) throw new Error("ADAPTER_COMMAND_JSON is required for command driver");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed) || parsed.length === 0 || parsed.some((x) => typeof x !== "string")) throw new Error("ADAPTER_COMMAND_JSON must be a non-empty JSON string array");
  return parsed;
}

async function runCommand(task, prompt) {
  const command = parseCommand();
  const mode = process.env.ADAPTER_PROMPT_MODE || "stdin";
  const [bin, ...baseArgs] = command;
  const args = mode === "arg" ? [...baseArgs, prompt] : baseArgs;
  return await new Promise((resolve, reject) => {
    const child = spawn(bin, args, { cwd: process.env.ADAPTER_WORKDIR || process.cwd(), env: { ...process.env, NYRA_TASK_ID: task.id }, stdio: ["pipe", "pipe", "pipe"] });
    children.set(task.id, child);
    let stdout = "";
    let stderr = "";
    const maxOutput = Number(process.env.ADAPTER_MAX_OUTPUT_BYTES || 4_000_000);
    child.stdout.on("data", (chunk) => { if (stdout.length < maxOutput) stdout += chunk; });
    child.stderr.on("data", (chunk) => { if (stderr.length < maxOutput) stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code, signal) => {
      children.delete(task.id);
      if (code === 0) resolve(stdout.trim() || stderr.trim());
      else reject(new Error(`command failed code=${code} signal=${signal ?? "none"}: ${stderr.trim() || stdout.trim()}`));
    });
    if (mode === "stdin") { child.stdin.end(prompt); } else { child.stdin.end(); }
    setTimeout(() => {
      if (!child.killed) { child.kill("SIGTERM"); setTimeout(() => !child.killed && child.kill("SIGKILL"), 5000).unref(); }
    }, TIMEOUT_MS).unref();
  });
}

async function execute(task, prompt, headers) {
  task.state = "working"; task.updatedAt = now(); await persist(task);
  try {
    task.output = DRIVER === "openai" ? await runOpenAI(task, prompt, headers) : await runCommand(task, prompt);
    task.state = "completed";
  } catch (error) {
    task.error = error?.message || String(error);
    task.state = task.cancelRequested ? "canceled" : "failed";
  }
  task.updatedAt = now(); await persist(task);
}

async function createTask(params, headers) {
  const prompt = extractText(params);
  if (!prompt.trim()) throw new Error("message contains no text");
  const task = {
    id: randomUUID(), contextId: params?.message?.contextId || params?.contextId || randomUUID(),
    sessionId: headers.sessionId || null, traceId: headers.traceId || null,
    state: "submitted", createdAt: now(), updatedAt: now(), output: null, error: null, cancelRequested: false
  };
  await persist(task);
  void execute(task, prompt, headers);
  return task;
}

const agentCard = {
  name: AGENT_NAME,
  description: AGENT_DESCRIPTION,
  url: PUBLIC_URL,
  version: "0.1.0",
  protocolVersion: "0.3",
  capabilities: { streaming: true, pushNotifications: false, stateTransitionHistory: true },
  defaultInputModes: ["text"], defaultOutputModes: ["text"],
  skills: [{ id: "execute", name: "Execute task", description: AGENT_DESCRIPTION, tags: ["project-nyra", "development"] }]
};

async function readJson(req) {
  let body = "";
  for await (const chunk of req) { body += chunk; if (body.length > MAX_BODY) throw new Error("request body too large"); }
  return body ? JSON.parse(body) : {};
}

function send(res, status, body, headers = {}) {
  const payload = typeof body === "string" ? body : JSON.stringify(body);
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers });
  res.end(payload);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    if (req.method === "GET" && ["/health", "/healthz", "/readyz"].includes(url.pathname)) return send(res, 200, { ok: true, agent: AGENT_NAME, driver: DRIVER, activeTasks: children.size });
    if (req.method === "GET" && ["/.well-known/agent.json", "/.well-known/agent-card.json"].includes(url.pathname)) return send(res, 200, agentCard);
    if (req.method !== "POST") return send(res, 404, { error: "not found" });

    const request = await readJson(req);
    const id = request.id;
    const method = request.method;
    const params = request.params || {};
    const headers = {
      traceId: req.headers["x-litellm-trace-id"] || req.headers["x-litellm-session-id"] || null,
      sessionId: req.headers["x-litellm-session-id"] || null,
      agentId: req.headers["x-litellm-agent-id"] || null
    };

    if (method === "message/send" || method === "SendMessage") {
      const task = await createTask(params, headers);
      return send(res, 200, rpcResult(id, publicTask(task)));
    }
    if (method === "message/stream" || method === "SendStreamingMessage") {
      const task = await createTask(params, headers);
      res.writeHead(200, { "content-type": "application/x-ndjson", "cache-control": "no-store", connection: "keep-alive" });
      while (true) {
        const current = await loadTask(task.id);
        res.write(`${JSON.stringify(rpcResult(id, publicTask(current)))}\n`);
        if (["completed", "failed", "canceled"].includes(current.state)) break;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      return res.end();
    }
    if (method === "tasks/get") {
      const task = await loadTask(params.id);
      return task ? send(res, 200, rpcResult(id, publicTask(task))) : send(res, 200, rpcError(id, -32001, "task not found"));
    }
    if (method === "tasks/list") {
      const result = [];
      for (const file of await readdir(STATE_DIR)) if (file.endsWith(".json")) { const task = await loadTask(file.slice(0, -5)); if (task && (!params.contextId || task.contextId === params.contextId)) result.push(publicTask(task)); }
      return send(res, 200, rpcResult(id, { tasks: result }));
    }
    if (method === "tasks/cancel") {
      const task = await loadTask(params.id);
      if (!task) return send(res, 200, rpcError(id, -32001, "task not found"));
      task.cancelRequested = true;
      const child = children.get(task.id);
      if (child && !child.killed) child.kill("SIGTERM");
      task.state = "canceled"; task.updatedAt = now(); await persist(task);
      return send(res, 200, rpcResult(id, publicTask(task)));
    }
    return send(res, 200, rpcError(id, -32601, `unsupported method: ${method}`));
  } catch (error) {
    return send(res, 400, rpcError(null, -32602, error?.message || String(error)));
  }
});

server.listen(PORT, HOST, () => console.log(JSON.stringify({ level: "info", msg: "nyra A2A adapter listening", host: HOST, port: PORT, driver: DRIVER, agent: AGENT_NAME })));

for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => {
  for (const child of children.values()) if (!child.killed) child.kill("SIGTERM");
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000).unref();
});
