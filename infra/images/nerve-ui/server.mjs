import http from "node:http";

const port = Number(process.env.NERVE_PORT || process.env.PORT || 18789);
const openclawUrl = process.env.OPENCLAW_URL || "";
const mode = process.env.NERVE_MODE || "worker-interface";
const workerName =
  process.env.WORKER_NAME || process.env.OPENCLAW_WORKER_NAME || "nyra-worker";

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(body);
}

function sendHtml(res) {
  const escapedOpenClawUrl = openclawUrl
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;");
  const body = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Nyra Nerve UI</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #080b14;
        --panel: #111827;
        --text: #e5e7eb;
        --muted: #94a3b8;
        --indigo: #6366f1;
        --seafoam: #2dd4bf;
        --pink: #f472b6;
      }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: var(--bg);
        color: var(--text);
        display: grid;
        place-items: center;
      }
      main {
        width: min(720px, calc(100vw - 32px));
        border: 1px solid rgba(148, 163, 184, 0.22);
        border-radius: 8px;
        background: var(--panel);
        padding: 28px;
      }
      h1 {
        margin: 0 0 8px;
        font-size: 28px;
        line-height: 1.1;
      }
      p {
        color: var(--muted);
        line-height: 1.6;
      }
      dl {
        display: grid;
        grid-template-columns: 140px 1fr;
        gap: 12px;
        margin: 24px 0;
      }
      dt {
        color: var(--seafoam);
      }
      dd {
        margin: 0;
        overflow-wrap: anywhere;
      }
      a {
        color: var(--seafoam);
      }
      .status {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: var(--text);
      }
      .dot {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        background: var(--seafoam);
        box-shadow: 0 0 16px var(--seafoam);
      }
    </style>
  </head>
  <body>
    <main>
      <div class="status"><span class="dot"></span><span>Nerve UI online</span></div>
      <h1>${workerName}</h1>
      <p>This lightweight Nerve UI surface is running from the Project Nyra repo image and points at the local OpenClaw worker endpoint.</p>
      <dl>
        <dt>Mode</dt><dd>${mode}</dd>
        <dt>OpenClaw</dt><dd>${escapedOpenClawUrl ? `<a href="${escapedOpenClawUrl}">${escapedOpenClawUrl}</a>` : "not configured"}</dd>
        <dt>Health</dt><dd><a href="/health">/health</a></dd>
      </dl>
    </main>
  </body>
</html>`;

  res.writeHead(200, {
    "content-type": "text/html; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    sendJson(res, 200, {
      status: "healthy",
      mode,
      worker: workerName,
      openclawUrl,
    });
    return;
  }

  if (req.url === "/metadata") {
    sendJson(res, 200, {
      name: "nyra-nerve-ui",
      mode,
      worker: workerName,
      openclawUrl,
    });
    return;
  }

  sendHtml(res);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`nyra nerve ui listening on ${port}`);
});
