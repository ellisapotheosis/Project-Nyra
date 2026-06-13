#!/usr/bin/env node
import http from "node:http";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

const host = process.env.LLXPRT_BRIDGE_HOST || "0.0.0.0";
const port = Number(process.env.LLXPRT_BRIDGE_PORT || 8090);
const timeoutMs = Number(process.env.LLXPRT_BRIDGE_TIMEOUT_MS || 120000);
const apiKey = process.env.LLXPRT_BRIDGE_API_KEY || "";
const npmPrefix =
  process.env.NYRA_LLXPRT_NPM_PREFIX ||
  path.join(process.env.HOME || "/tmp", ".cache/nyra-llxprt-code");
const llxprtPackage =
  process.env.NYRA_LLXPRT_PACKAGE || "@vybestack/llxprt-code";
const cwd = process.env.LLXPRT_BRIDGE_WORKDIR || repoRoot;

const modelMap = {
  "llxprt-codex": {
    backend: process.env.LLXPRT_CODEX_BACKEND || "codex-cli",
    provider: process.env.LLXPRT_CODEX_PROVIDER || "codex",
    model: process.env.LLXPRT_CODEX_MODEL || "",
    profile: process.env.LLXPRT_CODEX_PROFILE || "",
  },
  "llxprt-gemini": {
    backend: process.env.LLXPRT_GEMINI_BACKEND || "llxprt",
    provider: process.env.LLXPRT_GEMINI_PROVIDER || "google",
    model: process.env.LLXPRT_GEMINI_MODEL || "gemini-2.5-pro",
    profile: process.env.LLXPRT_GEMINI_PROFILE || "",
  },
  "llxprt-claude": {
    backend: process.env.LLXPRT_CLAUDE_BACKEND || "llxprt",
    provider: process.env.LLXPRT_CLAUDE_PROVIDER || "anthropic",
    model: process.env.LLXPRT_CLAUDE_MODEL || "claude-sonnet-4-20250514",
    profile: process.env.LLXPRT_CLAUDE_PROFILE || "",
  },
};

function json(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function checkAuth(req) {
  if (!apiKey) return true;
  const auth = req.headers.authorization || "";
  return auth === `Bearer ${apiKey}` || req.headers["x-api-key"] === apiKey;
}

function messagesToPrompt(messages) {
  const body = messages
    .map((message) => {
      const role = String(message.role || "user").toUpperCase();
      const content = Array.isArray(message.content)
        ? message.content
            .map((part) => (typeof part === "string" ? part : part?.text || ""))
            .filter(Boolean)
            .join("\n")
        : String(message.content || "");
      return `${role}:\n${content}`;
    })
    .join("\n\n");

  return [
    "You are being called through Project Nyra's LLxprt subscription bridge.",
    "Return only the requested assistant response. Do not edit files, run shell commands, or start an interactive workflow.",
    "",
    body,
  ].join("\n");
}

function runLlxprt({ model, messages }) {
  return new Promise((resolve, reject) => {
    const selected = modelMap[model] || modelMap["llxprt-codex"];
    const args = [
      "exec",
      "--yes",
      "--prefix",
      npmPrefix,
      "--package",
      llxprtPackage,
      "--",
      "llxprt",
      "--provider",
      selected.provider,
      "--model",
      selected.model,
      "--output-format",
      "text",
    ];

    if (selected.profile) {
      args.push("--profile-load", selected.profile);
    }

    args.push(messagesToPrompt(messages));

    let stdout = "";
    let stderr = "";

    fs.mkdir(npmPrefix, { recursive: true })
      .then(() => {
        const child = spawn("npm", args, {
          cwd,
          env: {
            ...process.env,
            NO_COLOR: "1",
          },
          detached: true,
          stdio: ["ignore", "pipe", "pipe"],
        });

        const timer = setTimeout(() => {
          try {
            process.kill(-child.pid, "SIGTERM");
          } catch {
            child.kill("SIGTERM");
          }
          setTimeout(() => {
            try {
              process.kill(-child.pid, "SIGKILL");
            } catch {
              child.kill("SIGKILL");
            }
          }, 5000).unref();
          reject(new Error(`llxprt timed out after ${timeoutMs}ms`));
        }, timeoutMs);

        child.stdout.on("data", (chunk) => {
          stdout += chunk.toString("utf8");
        });
        child.stderr.on("data", (chunk) => {
          stderr += chunk.toString("utf8");
        });
        child.on("error", (error) => {
          clearTimeout(timer);
          reject(error);
        });
        child.on("close", (code) => {
          clearTimeout(timer);
          if (code === 0) {
            resolve(stdout.trim());
          } else {
            reject(
              new Error(
                `llxprt exited ${code}: ${stderr.trim() || stdout.trim()}`
              )
            );
          }
        });
      })
      .catch((error) => {
        try {
          fs.rm(npmPrefix, { force: true });
        } catch {}
        reject(error);
      });
  });
}

async function runCodexCli({ model, messages }) {
  const selected = modelMap[model] || modelMap["llxprt-codex"];
  const outputFile = path.join(
    os.tmpdir(),
    `llxprt-bridge-codex-${randomUUID()}.txt`
  );

  try {
    return await new Promise((resolve, reject) => {
      const args = [
        "exec",
        "--ignore-user-config",
        "--sandbox",
        "read-only",
        "--skip-git-repo-check",
        "--ephemeral",
        "--color",
        "never",
        "--output-last-message",
        outputFile,
        "-",
      ];

      if (selected.model) {
        args.splice(2, 0, "--model", selected.model);
      }

      const child = spawn("codex", args, {
        cwd,
        env: {
          ...process.env,
          NO_COLOR: "1",
        },
        detached: true,
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";
      let settled = false;
      const finish = (fn) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        fn();
      };

      const timer = setTimeout(() => {
        try {
          process.kill(-child.pid, "SIGTERM");
        } catch {
          child.kill("SIGTERM");
        }
        setTimeout(() => {
          try {
            process.kill(-child.pid, "SIGKILL");
          } catch {
            child.kill("SIGKILL");
          }
        }, 5000).unref();
        finish(() =>
          reject(new Error(`codex exec timed out after ${timeoutMs}ms`))
        );
      }, timeoutMs);

      child.stdout.on("data", (chunk) => {
        stdout += chunk.toString("utf8");
      });
      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString("utf8");
      });
      child.on("error", (error) => {
        finish(() => reject(error));
      });
      child.on("close", async (code) => {
        finish(async () => {
          if (code !== 0) {
            reject(
              new Error(
                `codex exec exited ${code}: ${stderr.trim() || stdout.trim()}`
              )
            );
            return;
          }

          try {
            const content = (await fs.readFile(outputFile, "utf8")).trim();
            resolve(content || stdout.trim());
          } catch {
            resolve(stdout.trim());
          }
        });
      });

      child.stdin.end(messagesToPrompt(messages));
    });
  } finally {
    await fs.rm(outputFile, { force: true }).catch(() => {});
  }
}

function runModel({ model, messages }) {
  const selected = modelMap[model] || modelMap["llxprt-codex"];
  if (selected.backend === "codex-cli") {
    return runCodexCli({ model, messages });
  }
  return runLlxprt({ model, messages });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(
      req.url || "/",
      `http://${req.headers.host || "localhost"}`
    );

    if (req.method === "GET" && url.pathname === "/health") {
      return json(res, 200, { status: "healthy" });
    }

    if (req.method === "GET" && url.pathname === "/v1/models") {
      return json(res, 200, {
        object: "list",
        data: Object.keys(modelMap).map((id) => ({
          id,
          object: "model",
          owned_by: "llxprt-bridge",
        })),
      });
    }

    if (req.method === "POST" && url.pathname === "/v1/chat/completions") {
      if (!checkAuth(req)) {
        return json(res, 401, {
          error: { message: "Unauthorized", type: "auth_error" },
        });
      }

      const request = await readJson(req);
      if (request.stream) {
        return json(res, 400, {
          error: {
            message: "Streaming is not supported by llxprt-bridge yet.",
            type: "unsupported",
          },
        });
      }

      const model = request.model || "llxprt-codex";
      const content = await runModel({
        model,
        messages: request.messages || [],
      });
      return json(res, 200, {
        id: `chatcmpl-${randomUUID()}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model,
        choices: [
          {
            index: 0,
            message: { role: "assistant", content },
            finish_reason: "stop",
          },
        ],
      });
    }

    json(res, 404, { error: { message: "Not found", type: "not_found" } });
  } catch (error) {
    json(res, 500, {
      error: { message: error.message, type: "llxprt_bridge_error" },
    });
  }
});

server.listen(port, host, () => {
  console.log(`llxprt-bridge listening on http://${host}:${port}`);
});
