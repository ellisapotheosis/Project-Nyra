# \# AGENTS.md — Unified Multi-Harness Brain Configuration

# 

# This file establishes the workspace identity and directs all active coding harnesses (Codex, Copilot CLI, Hermes, and OpenClaw) to the shared portable brain layer in `.agent/`.

# 

# > \*\*Environment Note\*\*: All internal tooling calls default to `python3`. Adjust variables if operating across mismatched runtime environments.

# 

# \---

# 

# \## 1. Startup \& Mapping Sequence (Read in order)

# 1\. `.agent/AGENTS.md` — The global structural map

# 2\. `.agent/memory/personal/PREFERENCES.md` — User and workspace style conventions

# 3\. `.agent/memory/semantic/LESSONS.md` — Distilled engineering lessons

# 4\. `.agent/protocols/permissions.md` — Hard system boundaries (Read prior to tool/CLI invocation)

# 

# \*Harness Priority Note (Copilot CLI)\*: This file functions as primary instructions, overriding any localized `.github/instructions/` arrays.

# 

# \---

# 

# \## 2. Shared Skills Ecosystem

# \- \*\*Ecosystem Standard\*\*: Underlined by the `agentskills.io` standard format. 

# \- \*\*Triggers\*\*: Read `.agent/skills/\_index.md` first. Progressively disclose and fully load a target `SKILL.md` only when its execution triggers match the current workspace task.

# \- \*\*Mirrors\*\*: Specialized directory copies (like `.agents/skills/` or `.github/skills/`) are auto-synchronized mirrors. Always perform structural skill edits directly inside `.agent/skills/` to prevent overwrites.

# 

# \---

# 

# \## 3. Recall Protocol Before Non-Trivial Tasks

# For critical pipeline updates—specifically deploy, ship, database migration, schema mutation, timestamp generation, date operations, failing tests, debugging sequences, or deep refactors—you MUST first execute:

# 

# ```bash

# python3 .agent/tools/recall.py "<description of the task or system state>"

# Always surface your diagnostic findings in a visible Consulted lessons before acting: response block and adhere to those patterns closely.

# 

# 4\. Memory Discipline \& Reflection Loops

# Actively maintain and adjust .agent/memory/working/WORKSPACE.md as files change.

# 

# Following major task milestones or pipeline outcomes, immediately execute the reflection loop:

# python3 .agent/tools/memory\_reflect.py <skill> <action> <outcome>

# 

# No Deletions: Never purge historical memory entries entirely; utilize structural archiving tags instead.

# 

# Snapshot State: Inspect the current active context state at any time via python3 .agent/tools/show.py.

# 

# In-Context Learning: Teach the brain a permanent rule instantly using:

# python3 .agent/tools/learn.py "<rule>" --rationale "<why>"

# 

# 5\. Hard System Rules

# Strict Prohibition: No force pushes (-f, --force) permitted to main, production, or staging branches.

# 

# Integrity Boundary: Never modify or attempt to subvert instructions within .agent/protocols/permissions.md.

# 

# Automation Guard: Never hand-edit .agent/memory/semantic/LESSONS.md manually—always cycle adjustments through graduate.py.

## Evidence-based skill progression: 2026-07-20

These three progression vectors come only from observed Project Nyra pull-request and review telemetry. Treat the evidence and graduation checks as executable contributor criteria, not general reading topics. Refresh this dated evidence snapshot on each progression-map run while preserving the higher-level practice and graduation contracts until newer telemetry disproves them.

### 1. Provenance-aware recovery and review-budget decomposition

**Repository evidence:** PR #773 added the prior skill blueprint to `AGENTS.md`, but PR #789 later rewrote that file with 51 additions and 1,161 deletions while synchronizing 671 files (`+76,395/-24,942`). Sourcery declined after its 500,000 weekly diff-character limit was exhausted, Greptile declined because 671 files exceeded its 100-file limit, and CodeRabbit reported that 571 reviewable files exceeded its 100-file limit. The merged snapshot therefore removed canonical guidance while simultaneously exceeding the available automated review budget that could have detected it.

**Practice steps:**

1. Before a recovery or synchronization PR, record the base SHA and classify every changed path as canonical guidance, `/apps`, `/infra`, generated/runtime state, or unrelated work.
2. Diff canonical files such as `AGENTS.md`, `.agent/AGENTS.md`, app manifests, deployment configuration, and `infra/hosts/<host-name>/` independently; flag replacement-scale deletions and source-of-truth conflicts before staging.
3. Split work before any review provider's observed file or diff ceiling is crossed. Keep a machine-readable manifest of intentionally replaced canonical files and their selected provenance.
4. Graduate only after a recovery exercise preserves all intended `/apps` and `/infra` behavior, introduces no unexplained canonical-document deletion, and receives an actual automated or human review for every slice.

### 2. Fail-closed exact-head release governance and late-review ownership

**Repository evidence:** PR #773 was merged at exact head `144cd529` with 3 failed, 10 skipped, 2 neutral, and 1 cancelled check runs; Cloudflare Pages (`projectnyra-app` and `projectnyra-nexus`) and CircleCI `ci` were failed. PR #790 was merged at `16:41:19Z` with CircleCI `ci`, lint, and typecheck failed and CodeQL `Analyze` skipped; Sourcery then submitted an actionable review at `16:42:01Z`, after the merge. The active main ruleset requires a PR, resolved threads, and squash merging, but has no required-status-check rule, so GitHub's merge permission is weaker than this repository's stated completion contract.

**Practice steps:**

1. Create and maintain the explicit context allowlist in `.github/required-checks.yml`, validated against `.github/workflows/*.yml`, `.circleci/config.yml`, and provider contexts observed on the PR. Evaluate the exact candidate SHA against it; treat failed, missing, skipped, neutral, cancelled, or pending contexts as blocking unless that policy names an exception.
2. Prove protected work executed: a successful availability/detector job does not substitute for a skipped CodeQL `Analyze`, test, security, build, or deployment job.
3. Exhaust paginated review threads and wait for each configured asynchronous reviewer to reach a terminal state before merging. If feedback arrives after merge, assign an owner and ship a follow-up or revert before calling the loop closed.
4. Graduate only after one `/apps` or `/infra` PR shows every required exact-head context successful, all review pages exhausted with zero unresolved threads, and no late feedback left without a tracked disposition.

### 3. App-to-deployment contract parity and fail-closed trust-boundary forensics

**Repository evidence:** PR #789's Docker matrix failed specifically on `Build crm-api`, which made `All Docker Builds Complete` fail while CI test, security, and build jobs were skipped. Its log reported `ERR_PNPM_OUTDATED_LOCKFILE` at `services/crm-api/Dockerfile:16` because root `package.json` versions for Prettier, TypeScript, and Vitest did not match `pnpm-lock.yaml`. PR #773's final head independently failed both Cloudflare Pages targets for `projectnyra-app` and `projectnyra-nexus`. On PR #771, a human architecture review identified unresolved P0 deployment boundaries including fail-closed private-model routing, authenticated/private A2A binding, bounded concurrency, output redaction, immutable images, resource limits, rollback, and outage verification; the PR merged without a post-review commit. These are recurring contract and trust-boundary failures—not evidence that application or infrastructure behavior passed merely because unrelated checks were green.

**Practice steps:**

1. Create and maintain `infra/hosts/app-deployment-parity.yml` as the machine-readable parity matrix for each affected app/service: workspace package and lockfile, install/build command, expected output, Dockerfile and build context, provider root/output settings, required secrets, workflow job, network/auth boundary, and owning `infra/hosts/<host-name>/` deployment.
2. Reproduce the first failing boundary locally or in an isolated CI job, then preserve the exact command and error as regression evidence. Validate frozen-lockfile installs in every Docker consumer; do not mask a failing build by skipping downstream test, security, build, or deploy jobs.
3. Validate the same artifact through package build, container build, and Cloudflare/Vercel preview paths where configured. For gateways and adapters, add unauthorized, privacy-route, saturation, upstream-outage, redaction, and rollback tests that prove fail-closed behavior.
4. Graduate only after a targeted `/apps` or `/infra` change passes its package checks, Docker build, provider preview, trust-boundary probes, and exact-head aggregate gates with no skipped downstream validation or unresolved P0 review item.

<!-- TODO: Awaiting further telemetry on closed /apps and /infra issues -->
