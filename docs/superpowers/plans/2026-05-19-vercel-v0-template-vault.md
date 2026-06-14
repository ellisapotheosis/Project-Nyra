# Vercel v0 Template Vault Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `/templates` review vault that extracts Vercel-style UI templates from the repo's `v0/*` branches, preserves provenance, and provides both screenshots and runnable previews.

**Architecture:** Use a Git-driven extraction script to materialize curated template packs under `/templates/vercel-v0/`. Each pack contains a trimmed source copy, metadata, static screenshots, and a local preview folder. Add top-level documentation and an index so agents can review the vault without re-discovering the branches.

**Tech Stack:** Bash, Git, Node.js, Next.js template previews, Playwright screenshots, JSON metadata, Markdown docs

---

### Task 1: Create the design and plan docs

**Files:**
- Create: `docs/superpowers/specs/2026-05-19-vercel-v0-template-vault-design.md`
- Create: `docs/superpowers/plans/2026-05-19-vercel-v0-template-vault.md`

- [ ] **Step 1: Write the design doc**

Write a concise spec covering branch inventory, output structure, preview strategy, metadata requirements, and acceptance criteria.

- [ ] **Step 2: Write the implementation plan**

Document the extraction, preview, screenshot, and README work as discrete tasks.

- [ ] **Step 3: Review both docs for scope drift**

Confirm the docs describe curated UI extraction rather than raw repo dumps.

### Task 2: Build a regenerable extraction pipeline

**Files:**
- Create: `scripts/templates/extract-vercel-v0.sh`
- Create: `scripts/templates/vercel-v0-manifest.json`

- [ ] **Step 1: Define the template source manifest**

List the branch, commit intent, template ID, display name, source paths, preview type, and notes for each pack.

- [ ] **Step 2: Write the extraction script**

Implement a Bash script that removes and recreates `templates/vercel-v0`, exports the configured source paths from Git, writes metadata/readmes, and generates `index.json`.

- [ ] **Step 3: Run the extraction script and verify output**

Run: `bash scripts/templates/extract-vercel-v0.sh`
Expected: `templates/vercel-v0` is rebuilt with one folder per configured template and a root index file.

### Task 3: Add preview support per template

**Files:**
- Create: `scripts/templates/write-vercel-v0-preview.js`
- Modify: `scripts/templates/extract-vercel-v0.sh`

- [ ] **Step 1: Implement preview generation**

Add a Node helper that can create lightweight preview wrappers or preserve standalone app roots depending on template type.

- [ ] **Step 2: Wire preview generation into extraction**

Update the Bash pipeline so every template pack receives a `preview/` folder and a clear local run command in metadata.

- [ ] **Step 3: Smoke-check preview package shape**

Run: `find templates/vercel-v0 -maxdepth 3 -name package.json | sort`
Expected: each previewable template has a local package descriptor where needed.

### Task 4: Generate screenshots

**Files:**
- Create: `scripts/templates/capture-vercel-v0-screenshots.mjs`
- Modify: `templates/vercel-v0/*/template-meta.json`

- [ ] **Step 1: Implement screenshot capture**

Create a Playwright-based capture script that can iterate configured preview targets, open the template home page, and save PNGs into each `screenshots/` directory.

- [ ] **Step 2: Run screenshot capture for templates that boot successfully**

Run: `node scripts/templates/capture-vercel-v0-screenshots.mjs`
Expected: each runnable preview that starts successfully gets at least one screenshot.

- [ ] **Step 3: Record screenshot status in metadata**

Mark templates that produced screenshots and note any preview boot gaps instead of hiding them.

### Task 5: Write the user-facing vault documentation

**Files:**
- Create: `templates/README.md`
- Create: `templates/vercel-v0/README.md`

- [ ] **Step 1: Write the root README**

Explain what was extracted, how to browse screenshots, how to run previews, how metadata works, and how to mine components safely.

- [ ] **Step 2: Write the vault README**

Describe the pack layout, template IDs, source provenance, and common preview commands.

- [ ] **Step 3: Verify the docs match the generated output**

Check that commands, paths, and filenames in the READMEs match the actual generated tree.

### Task 6: Validate end-to-end

**Files:**
- Modify: `templates/**` as generated

- [ ] **Step 1: Run the extraction pipeline from a clean state**

Run: `bash scripts/templates/extract-vercel-v0.sh`
Expected: no missing-path errors for configured templates.

- [ ] **Step 2: Run a lightweight tree verification**

Run: `find templates/vercel-v0 -maxdepth 2 -type f | sort | sed -n '1,200p'`
Expected: each pack has `README.md`, `template-meta.json`, and generated content directories.

- [ ] **Step 3: Run targeted preview verification**

Run the smallest available preview check per pack, and where runtime is not practical, document the gap explicitly in metadata and the root README.
