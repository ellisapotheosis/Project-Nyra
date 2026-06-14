import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const repoRoot = process.cwd();
const indexPath = path.join(repoRoot, "templates/vercel-uploads/index.json");

if (!fs.existsSync(indexPath)) {
  console.error("Missing templates/vercel-uploads/index.json. Run the upload import first.");
  process.exit(1);
}

const templates = JSON.parse(fs.readFileSync(indexPath, "utf8"));

async function waitForServer(url, maxAttempts = 60) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch {}
    await delay(1000);
  }
  return false;
}

function rewriteMetadata(template, patch) {
  const metaPath = path.join(repoRoot, "templates/vercel-uploads", template.id, "template-meta.json");
  const current = JSON.parse(fs.readFileSync(metaPath, "utf8"));
  const next = {
    ...current,
    screenshots: {
      ...current.screenshots,
      ...patch,
    },
  };
  fs.writeFileSync(metaPath, `${JSON.stringify(next, null, 2)}\n`);
  rewriteIndex(template, patch);
}

function rewriteIndex(template, patch) {
  const current = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  const next = current.map((entry) => {
    if (entry.id !== template.id) return entry;
    return {
      ...entry,
      screenshots: {
        ...entry.screenshots,
        ...patch,
      },
    };
  });
  fs.writeFileSync(indexPath, `${JSON.stringify(next, null, 2)}\n`);
}

function spawnLogged(command, args, options) {
  return spawn(command, args, {
    ...options,
    stdio: ["ignore", "pipe", "pipe"],
    detached: options.detached ?? false,
    shell: false,
  });
}

async function waitForExit(child) {
  let output = "";
  child.stdout.on("data", (chunk) => {
    output += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    output += chunk.toString();
  });

  const code = await new Promise((resolve) => child.on("close", resolve));
  return { code, output };
}

async function captureTemplate(template) {
  const previewDir = path.join(repoRoot, template.preview.dir);
  const screenshotsDir = path.join(repoRoot, template.screenshots.dir);

  fs.mkdirSync(screenshotsDir, { recursive: true });

  const install = spawnLogged(
    "npm",
    ["install", "--ignore-scripts", "--no-fund", "--no-audit", "--legacy-peer-deps"],
    { cwd: previewDir },
  );
  const installResult = await waitForExit(install);

  if (installResult.code !== 0) {
    rewriteMetadata(template, {
      status: "install-failed",
      note: installResult.output.split("\n").slice(-12).join("\n").trim(),
      lastAttemptAt: new Date().toISOString(),
    });
    return;
  }

  const server = spawnLogged("npm", ["exec", "next", "dev", "--", "-p", String(template.preview.port)], {
    cwd: previewDir,
    detached: true,
  });
  let serverOutput = "";
  server.stdout.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });
  server.stderr.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });

  const isReady = await waitForServer(template.preview.url);
  if (!isReady) {
    stopServer(server);
    rewriteMetadata(template, {
      status: "preview-start-failed",
      note: serverOutput.split("\n").slice(-20).join("\n").trim() || "Preview server did not become ready in time.",
      lastAttemptAt: new Date().toISOString(),
    });
    return;
  }

  const screenshotPath = path.join(screenshotsDir, "home.png");
  const capture = spawnLogged(
    "npx",
    ["playwright", "screenshot", "--device=Desktop Chrome", template.preview.url, screenshotPath],
    { cwd: previewDir },
  );
  const captureResult = await waitForExit(capture);
  stopServer(server);
  await delay(1000);

  if (captureResult.code !== 0) {
    rewriteMetadata(template, {
      status: "capture-failed",
      note: captureResult.output.split("\n").slice(-12).join("\n").trim() || "Playwright screenshot command failed.",
      lastAttemptAt: new Date().toISOString(),
    });
    return;
  }

  rewriteMetadata(template, {
    status: "captured",
    files: ["home.png"],
    note: "Homepage screenshot captured successfully.",
    lastAttemptAt: new Date().toISOString(),
  });
}

function stopServer(server) {
  try {
    process.kill(-server.pid, "SIGTERM");
  } catch {
    server.kill("SIGTERM");
  }
}

for (const template of templates) {
  console.log(`Capturing ${template.id}`);
  // eslint-disable-next-line no-await-in-loop
  await captureTemplate(template);
}
