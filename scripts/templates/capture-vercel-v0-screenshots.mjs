import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const repoRoot = process.cwd();
const indexPath = path.join(repoRoot, "templates/vercel-v0/index.json");

if (!fs.existsSync(indexPath)) {
  console.error("Missing templates/vercel-v0/index.json. Run the extraction first.");
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
  const metaPath = path.join(repoRoot, "templates/vercel-v0", template.id, "template-meta.json");
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

async function captureTemplate(template) {
  const previewDir = path.join(repoRoot, template.preview.dir);
  const screenshotsDir = path.join(repoRoot, template.screenshots.dir);

  fs.mkdirSync(screenshotsDir, { recursive: true });

  const install = spawn("npm", ["install", "--ignore-scripts", "--no-fund", "--no-audit", "--legacy-peer-deps"], {
    cwd: previewDir,
    stdio: "inherit",
    shell: false,
  });

  const installCode = await new Promise((resolve) => install.on("close", resolve));
  if (installCode !== 0) {
    rewriteMetadata(template, {
      status: "install-failed",
      note: "npm install --ignore-scripts --no-fund --no-audit --legacy-peer-deps failed during screenshot capture",
      lastAttemptAt: new Date().toISOString(),
    });
    return;
  }

  const server = spawn("npm", ["exec", "next", "dev", "--", "-p", String(template.preview.port)], {
    cwd: previewDir,
    stdio: "inherit",
    detached: true,
    shell: false,
  });

  const isReady = await waitForServer(template.preview.url);
  if (!isReady) {
    stopServer(server);
    rewriteMetadata(template, {
      status: "preview-start-failed",
      note: "Preview server did not become ready in time",
      lastAttemptAt: new Date().toISOString(),
    });
    return;
  }

  const screenshotPath = path.join(screenshotsDir, "home.png");
  const capture = spawn("npx", ["playwright", "screenshot", "--device=Desktop Chrome", template.preview.url, screenshotPath], {
    cwd: previewDir,
    stdio: "inherit",
    shell: false,
  });

  const captureCode = await new Promise((resolve) => capture.on("close", resolve));
  stopServer(server);
  await delay(1000);

  if (captureCode !== 0) {
    rewriteMetadata(template, {
      status: "capture-failed",
      note: "Playwright screenshot command failed",
      lastAttemptAt: new Date().toISOString(),
    });
    return;
  }

  rewriteMetadata(template, {
    status: "captured",
    files: ["home.png"],
    note: "Homepage screenshot captured successfully",
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
  console.log(`\n=== Capturing ${template.id} ===`);
  // eslint-disable-next-line no-await-in-loop
  await captureTemplate(template);
}
