import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";

const repoRoot = process.cwd();
const uploadsRoot = path.join(repoRoot, "templates/vercel-uploads");
const defaultZipDir = path.join(repoRoot, ".tmp/vercel-template-zips");
const zipDir = process.env.VERCEL_TEMPLATE_ZIP_DIR
  ? path.resolve(process.env.VERCEL_TEMPLATE_ZIP_DIR)
  : defaultZipDir;

const uploads = [
  {
    id: "frosted-authentication-page",
    displayName: "Frosted Authentication Page",
    zipName: "frosted-authentication-page.zip",
    previewPort: 4320,
    description: "Frosted-glass authentication template with sign-in, sign-up, social auth, and password-strength UI.",
  },
  {
    id: "frosted-glass-ui-crm-dashboard",
    displayName: "Frosted Glass CRM Dashboard",
    zipName: "frosted-glass-ui-crm-dashboard-ui-design.zip",
    previewPort: 4321,
    description: "Frosted-glass CRM dashboard template with dashboard shell and reusable shadcn UI components.",
  },
  {
    id: "mail-template-builder",
    displayName: "Mail Template Builder",
    zipName: "mail-template-builder-1.0.0.zip",
    previewPort: 4322,
    description: "Email template builder app with TinyMCE editor, template management screens, and display screenshots.",
  },
  {
    id: "sales-ops-dashboard",
    displayName: "Sales Ops Dashboard",
    zipName: "sales-ops-dashboard.zip",
    previewPort: 4323,
    description: "Sales operations dashboard with pipeline, customers, forecasting, reports, team, and settings sections.",
  },
  {
    id: "v0-sales-crm-design",
    displayName: "v0 Sales CRM Design",
    zipName: "v0-sales-crm-design-main.zip",
    previewPort: 4324,
    description: "v0-generated sales CRM design with deals, contacts, tasks, integrations, settings, tables, and app shell.",
  },
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function cleanDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  ensureDir(dir);
}

function copyDir(source, target) {
  ensureDir(path.dirname(target));
  fs.cpSync(source, target, { recursive: true, force: true });
}

function writeFileSafe(targetPath, contents) {
  ensureDir(path.dirname(targetPath));
  fs.writeFileSync(targetPath, contents);
}

function listFiles(dir, base = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(fullPath, base));
      continue;
    }
    files.push(path.relative(base, fullPath).replaceAll(path.sep, "/"));
  }

  return files.sort();
}

function summarizePaths(files) {
  return Array.from(new Set(files.map((file) => file.split("/")[0]).filter(Boolean))).sort();
}

function findProjectRoot(extractDir) {
  const directPackage = path.join(extractDir, "package.json");
  if (fs.existsSync(directPackage)) return extractDir;

  const children = fs
    .readdirSync(extractDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory());

  if (children.length === 1) {
    const nested = path.join(extractDir, children[0].name);
    if (fs.existsSync(path.join(nested, "package.json"))) return nested;
  }

  return extractDir;
}

function makePackReadme(entry, metadata) {
  return `# ${entry.displayName}

## Summary

${entry.description}

## Provenance

- Source type: uploaded zip from \`G:\\Shared drives\\GDrive_Shared\\Vercel_Templates\`
- Source zip: \`${entry.zipName}\`
- Template kind: \`uploaded-vercel-template\`

## Current Status

- Screenshot: ${metadata.screenshots.status === "captured" ? "[screenshots/home.png](./screenshots/home.png)" : metadata.screenshots.status}
- Preview: run locally on \`http://localhost:${entry.previewPort}\`

## Local Review

- Screenshots: [screenshots](./screenshots)
- Preview app: [preview](./preview)
- Source files: [source](./source)
- Metadata: [template-meta.json](./template-meta.json)

## Preview Commands

\`\`\`bash
cd templates/vercel-uploads/${entry.id}/preview
npm install --ignore-scripts --no-fund --no-audit --legacy-peer-deps
npm exec next dev -- -p ${entry.previewPort}
\`\`\`

Open: [http://localhost:${entry.previewPort}](http://localhost:${entry.previewPort})
`;
}

function makeUploadsReadme(indexEntries) {
  const rows = indexEntries
    .map(
      (item) =>
        `| \`${item.id}\` | ${item.displayName} | \`${item.source.zipName}\` | [README](./${item.id}/README.md) | [Preview](./${item.id}/preview) | [Screenshots](./${item.id}/screenshots) |`,
    )
    .join("\n");

  return `# Vercel Uploaded Templates

These packs came from the zip files supplied from \`G:\\Shared drives\\GDrive_Shared\\Vercel_Templates\`.

## Template Packs

| ID | Display Name | Source Zip | Guide | Preview | Screenshots |
| --- | --- | --- | --- | --- | --- |
${rows}

## Regeneration

\`\`\`bash
VERCEL_TEMPLATE_ZIP_DIR=.tmp/vercel-template-zips node scripts/templates/import-vercel-upload-zips.mjs
\`\`\`
`;
}

cleanDir(uploadsRoot);

const indexEntries = [];

for (const entry of uploads) {
  const zipPath = path.join(zipDir, entry.zipName);
  if (!fs.existsSync(zipPath)) {
    throw new Error(`Missing zip: ${zipPath}`);
  }

  const extractDir = fs.mkdtempSync(path.join(tmpdir(), `${entry.id}-`));
  execFileSync("unzip", ["-q", zipPath, "-d", extractDir], { cwd: repoRoot });

  const projectRoot = findProjectRoot(extractDir);
  const templateDir = path.join(uploadsRoot, entry.id);
  const sourceDir = path.join(templateDir, "source");
  const previewDir = path.join(templateDir, "preview");
  const screenshotsDir = path.join(templateDir, "screenshots");
  const files = listFiles(projectRoot);

  ensureDir(screenshotsDir);
  copyDir(projectRoot, sourceDir);
  copyDir(projectRoot, previewDir);
  writeFileSafe(path.join(previewDir, ".npmrc"), "legacy-peer-deps=true\n");

  const metadata = {
    id: entry.id,
    displayName: entry.displayName,
    source: {
      type: "uploaded-zip",
      originalPath: `G:\\Shared drives\\GDrive_Shared\\Vercel_Templates\\${entry.zipName}`,
      zipName: entry.zipName,
    },
    kind: "uploaded-vercel-template",
    description: entry.description,
    preview: {
      dir: `templates/vercel-uploads/${entry.id}/preview`,
      run: `cd templates/vercel-uploads/${entry.id}/preview && npm install --ignore-scripts --no-fund --no-audit --legacy-peer-deps && npm exec next dev -- -p ${entry.previewPort}`,
      port: entry.previewPort,
      url: `http://localhost:${entry.previewPort}`,
    },
    screenshots: {
      dir: `templates/vercel-uploads/${entry.id}/screenshots`,
      status: "not-captured-yet",
    },
    extractedTopLevelEntries: summarizePaths(files),
    extractedFileCount: files.length,
    generatedAt: new Date().toISOString(),
  };

  writeFileSafe(path.join(templateDir, "template-meta.json"), `${JSON.stringify(metadata, null, 2)}\n`);
  writeFileSafe(path.join(templateDir, "README.md"), makePackReadme(entry, metadata));

  indexEntries.push({
    ...metadata,
    readme: `templates/vercel-uploads/${entry.id}/README.md`,
  });

  fs.rmSync(extractDir, { recursive: true, force: true });
}

writeFileSafe(path.join(uploadsRoot, "index.json"), `${JSON.stringify(indexEntries, null, 2)}\n`);
writeFileSafe(path.join(uploadsRoot, "README.md"), makeUploadsReadme(indexEntries));
