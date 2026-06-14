import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const repoRoot = process.cwd();
const manifestPath = path.join(repoRoot, "scripts/templates/vercel-v0-manifest.json");
const outRoot = path.join(repoRoot, "templates/vercel-v0");
const templatesRoot = path.join(repoRoot, "templates");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

function sh(cmd, args, options = {}) {
  return execFileSync(cmd, args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function cleanDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  ensureDir(dir);
}

function listFiles(branch, sourcePath) {
  if (sourcePath === ".") {
    return sh("git", ["ls-tree", "-r", "--name-only", `origin/${branch}`])
      .trim()
      .split("\n")
      .filter(Boolean);
  }

  return sh("git", ["ls-tree", "-r", "--name-only", `origin/${branch}:${sourcePath}`])
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((item) => `${sourcePath}/${item}`);
}

function readGitFile(branch, filePath) {
  return execFileSync("git", ["show", `origin/${branch}:${filePath}`], {
    cwd: repoRoot,
    encoding: "buffer",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function writeFileSafe(targetPath, contents) {
  ensureDir(path.dirname(targetPath));
  fs.writeFileSync(targetPath, contents);
}

function maybeLocalizeTsconfig(previewDir) {
  const tsconfigPath = path.join(previewDir, "tsconfig.json");
  if (!fs.existsSync(tsconfigPath)) return;

  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8"));
  if (tsconfig.extends === "../../tsconfig.base.json") {
    tsconfig.extends = "./tsconfig.base.json";
    writeFileSafe(tsconfigPath, `${JSON.stringify(tsconfig, null, 2)}\n`);
    writeFileSafe(
      path.join(previewDir, "tsconfig.base.json"),
      fs.readFileSync(path.join(repoRoot, "tsconfig.base.json")),
    );
  }
}

function writePreviewNpmrc(previewDir) {
  writeFileSafe(path.join(previewDir, ".npmrc"), "legacy-peer-deps=true\n");
}

function copyTrackedFiles(branch, sourcePath, destDir) {
  const files = listFiles(branch, sourcePath);
  const prefix = sourcePath === "." ? "" : `${sourcePath}/`;

  for (const file of files) {
    const rel = prefix ? file.slice(prefix.length) : file;
    const target = path.join(destDir, rel);
    writeFileSafe(target, readGitFile(branch, file));
  }

  return files.map((file) => (prefix ? file.slice(prefix.length) : file));
}

function summarizePaths(files) {
  const roots = new Set();

  for (const file of files) {
    const top = file.split("/")[0];
    if (top) roots.add(top);
  }

  return Array.from(roots).sort();
}

function makeTemplateReadme(entry, commitSha, copiedFiles) {
  const sourcePaths = summarizePaths(copiedFiles);
  const related = entry.relatedBranches?.length
    ? entry.relatedBranches
        .map(
          (item) =>
            `- \`${item.branch}\` @ \`${item.commit}\` — ${item.note}`,
        )
        .join("\n")
    : "- None recorded";

  return `# ${entry.displayName}

## Summary

${entry.description}

## Provenance

- Primary branch: \`${entry.sourceBranch}\`
- Primary commit: \`${commitSha}\`
- Extracted path: \`${entry.sourcePath}\`
- Template kind: \`${entry.kind}\`

### Related branches

${related}

## Extracted Source Layout

Top-level extracted directories/files:

${sourcePaths.map((item) => `- \`${item}\``).join("\n")}

## Local Review

- Screenshots: [screenshots](./screenshots)
- Preview app: [preview](./preview)
- Source files: [source](./source)
- Metadata: [template-meta.json](./template-meta.json)

## Preview Commands

\`\`\`bash
cd templates/vercel-v0/${entry.id}/preview
npm install --ignore-scripts --no-fund --no-audit --legacy-peer-deps
npm exec next dev -- -p ${entry.previewPort}
\`\`\`

Open: [http://localhost:${entry.previewPort}](http://localhost:${entry.previewPort})

## Notes

${entry.notes.map((note) => `- ${note}`).join("\n")}
`;
}

function makeVaultReadme(indexEntries) {
  const rows = indexEntries
    .map(
      (item) =>
        `| \`${item.id}\` | ${item.displayName} | \`${item.sourceBranch}\` | [README](./${item.id}/README.md) | [Preview](./${item.id}/preview) | [Screenshots](./${item.id}/screenshots) |`,
    )
    .join("\n");

  return `# Vercel v0 Template Vault

This vault consolidates the Vercel-style UI template material currently recoverable from the repo's live \`v0/*\` Git branches.

## What is included

- curated source extracts for each UI surface
- provenance metadata for branch and commit lineage
- local preview app folders
- screenshot output folders for quick visual review

## Template Packs

| ID | Display Name | Primary Branch | Guide | Preview | Screenshots |
| --- | --- | --- | --- | --- | --- |
${rows}

## Regeneration

\`\`\`bash
bash scripts/templates/extract-vercel-v0.sh
\`\`\`

## Screenshot Capture

\`\`\`bash
node scripts/templates/capture-vercel-v0-screenshots.mjs
\`\`\`
`;
}

function makeRootReadme(indexEntries) {
  const bullets = indexEntries
    .map(
      (item) =>
        `- [${item.displayName}](./vercel-v0/${item.id}/README.md) — source \`${item.sourceBranch}\`, preview port \`${item.preview.port}\``,
    )
    .join("\n");

  return `# Templates

This folder is the repo-local review vault for reusable UI templates recovered from Project Nyra's Vercel-style \`v0/*\` branches.

## Purpose

Use this area to inspect older Vercel-derived UI work without merging those branches directly into the active apps. Each template pack is designed for agent review and selective component mining.

## Structure

- [vercel-v0](./vercel-v0/README.md) — curated packs extracted from live \`v0/*\` branches

Each template pack contains:

- \`source/\` — extracted UI files
- \`preview/\` — local runnable preview app
- \`screenshots/\` — static image review artifacts
- \`template-meta.json\` — branch, commit, path, and notes
- \`README.md\` — pack-specific guidance

## Current Packs

${bullets}

## How To View

### 1. Quick visual scan

Browse the \`screenshots/\` directory inside each pack first. This is the fastest way to compare layouts without installing anything.

### 2. Open a local preview

\`\`\`bash
cd templates/vercel-v0/<template-id>/preview
npm install --ignore-scripts --no-fund --no-audit --legacy-peer-deps
npm exec next dev -- -p <port-from-template-meta>
\`\`\`

Then open \`http://localhost:<port>\`.

### 3. Review provenance before mining code

Open each pack's \`template-meta.json\` and \`README.md\` to confirm:

- which branch it came from
- which path was extracted
- whether there were related duplicate branches
- what caveats apply to the preview

## Recommended Workflow

1. Start in [vercel-v0/index.json](./vercel-v0/index.json) or [vercel-v0/README.md](./vercel-v0/README.md)
2. Compare screenshots across candidate packs
3. Launch the preview for the most promising pack
4. Mine reusable components from \`source/\`, not from the original branch
5. Port useful patterns into real apps selectively instead of wholesale copying

## What This Vault Intentionally Omits

- full monorepo snapshots
- backend services and infra
- CI and deployment scaffolding that is irrelevant to UI review
- any claim that these previews are production-authoritative app sources

## Refresh / Rebuild

Regenerate the vault from Git:

\`\`\`bash
bash scripts/templates/extract-vercel-v0.sh
\`\`\`

Attempt screenshot capture:

\`\`\`bash
node scripts/templates/capture-vercel-v0-screenshots.mjs
\`\`\`
`;
}

cleanDir(outRoot);
ensureDir(templatesRoot);

const indexEntries = [];

for (const entry of manifest) {
  const commitSha = sh("git", ["rev-parse", `origin/${entry.sourceBranch}`]).trim();
  const templateDir = path.join(outRoot, entry.id);
  const sourceDir = path.join(templateDir, "source");
  const previewDir = path.join(templateDir, "preview");
  const screenshotsDir = path.join(templateDir, "screenshots");

  ensureDir(sourceDir);
  ensureDir(previewDir);
  ensureDir(screenshotsDir);

  const copiedFiles = copyTrackedFiles(entry.sourceBranch, entry.sourcePath, sourceDir);
  copyTrackedFiles(entry.sourceBranch, entry.sourcePath, previewDir);
  maybeLocalizeTsconfig(previewDir);
  writePreviewNpmrc(previewDir);

  const metadata = {
    id: entry.id,
    displayName: entry.displayName,
    sourceBranch: entry.sourceBranch,
    sourceCommit: commitSha,
    sourcePath: entry.sourcePath,
    kind: entry.kind,
    description: entry.description,
    relatedBranches: entry.relatedBranches,
    notes: entry.notes,
    preview: {
      dir: `templates/vercel-v0/${entry.id}/preview`,
      run: `cd templates/vercel-v0/${entry.id}/preview && npm install --ignore-scripts --no-fund --no-audit --legacy-peer-deps && npm exec next dev -- -p ${entry.previewPort}`,
      port: entry.previewPort,
      url: `http://localhost:${entry.previewPort}`,
    },
    screenshots: {
      dir: `templates/vercel-v0/${entry.id}/screenshots`,
      status: "not-captured-yet",
    },
    extractedTopLevelEntries: summarizePaths(copiedFiles),
    extractedFileCount: copiedFiles.length,
    generatedAt: new Date().toISOString(),
  };

  writeFileSafe(
    path.join(templateDir, "template-meta.json"),
    `${JSON.stringify(metadata, null, 2)}\n`,
  );
  writeFileSafe(
    path.join(templateDir, "README.md"),
    makeTemplateReadme(entry, commitSha, copiedFiles),
  );

  indexEntries.push({
    ...metadata,
    readme: `templates/vercel-v0/${entry.id}/README.md`,
  });
}

writeFileSafe(
  path.join(outRoot, "index.json"),
  `${JSON.stringify(indexEntries, null, 2)}\n`,
);
writeFileSafe(path.join(outRoot, "README.md"), makeVaultReadme(indexEntries));
writeFileSafe(path.join(templatesRoot, "README.md"), makeRootReadme(indexEntries));
