# Project Nyra Operator Tooling Plan

This plan executes prompt-package lane 10 against the current repository shape. It is intentionally additive and non-destructive: it documents the operator surfaces already present, names the gaps that block safe operations, and points scripts and workflows at validation-only checks.

## Current Inventory

- Gitea runtime compose: `infra/hosts/oracle-vps/docker-compose.gitea.yml`
- Gitea env template: `infra/environments/.env.gitea.template`
- Gitea runner config: `infra/configs/gitea/runner-config.oracle.yaml`
- Gitea health helper: `infra/hosts/oracle-vps/scripts/gitea-ci-health.sh`
- Paperclip runtime compose: `infra/hosts/oracle-vps/docker-compose.paperclip.yml`
- WaveTerm operator config: `infra/waveterm/waveai-orchestrator.json`
- Zellij operator layout: `infra/zellij/nyra-wave-ai.kdl`
- CI/workflow surface: `.gitea/workflows/*`
- Non-destructive validation scripts added for this lane:
  - `ops/scripts/nyra-validate-compose.sh`
  - `ops/scripts/nyra-smoke-checks.sh`

## Gitea Deployment Shape

The current Gitea source of truth is the Oracle host compose file. It already models Postgres, Gitea, an Actions runner, and GitHub mirror sync. Keep this deployment private or Cloudflare Access-gated.

Required secret sources must stay outside git:

- `POSTGRES_PASSWORD`
- `GITEA_DB_PASSWORD`
- `GITEA_SECRET_KEY`
- `GITEA_INTERNAL_TOKEN`
- `GITEA_JWT_SECRET`
- `GITEA_RUNNER_TOKEN`
- `GITHUB_TOKEN`
- `GITEA_TOKEN`

Recommended env alignment before deployment:

```bash
GITEA_HTTP_PORT=3100
GITEA_SSH_PORT=2222
GITEA_ROOT_URL=https://git.ratehunter.net/
```

The checked-in env template currently uses `GITEA_PORT=3100`, while the compose file reads `GITEA_HTTP_PORT`. Treat that as a hardening item: either export both names in the deploy env or update the runtime compose in a dedicated infra change.

Validation command:

```bash
bash ops/scripts/nyra-validate-compose.sh --host oracle-vps --file docker-compose.gitea.yml --env-file infra/environments/.env.gitea.template
```

## Actions Runner Policy

The runner must be isolated from production secrets by default.

- Use repo-scoped or org-scoped runner tokens, not administrator API tokens.
- Mount Docker only when a workflow needs image builds.
- Block workflows from printing env files.
- Run compose validation with placeholder env files in CI.
- Require Cloudflare Access or Tailscale for runner dashboards.

## AI Reviewer Webhook

Recommended endpoint:

```text
POST /webhooks/gitea/review
```

Expected flow:

1. Gitea emits pull request opened/synchronized events.
2. Webhook verifies HMAC signature with `GITEA_WEBHOOK_SECRET`.
3. Worker fetches diff through the Gitea API using `GITEA_REVIEW_TOKEN`.
4. Worker truncates to `REVIEW_MAX_CHARS`.
5. Worker calls the configured review model through an authorized provider route.
6. Worker posts a review comment and adds `REVIEW_LABEL`.

Required controls:

- Do not call provider subscription bypasses or unofficial account automation.
- Do not send secrets, `.env` content, private keys, or raw credentials to the model.
- Redact diff snippets that match known secret patterns before review.
- Log only pull request ids, file counts, and model metadata.

## WaveTerm Command Deck

WaveTerm should expose command buttons that run validation and status checks without mutating services:

```bash
bash ops/scripts/nyra-smoke-checks.sh --json
bash ops/scripts/nyra-validate-compose.sh --host oracle-vps --file docker-compose.gitea.yml --env-file infra/environments/.env.gitea.template
bash infra/hosts/oracle-vps/scripts/gitea-ci-health.sh
docker --context oracle ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
ssh worker-rtx5090.trex-fiordland.ts.net nvidia-smi
ssh worker-rtx3090ti.trex-fiordland.ts.net nvidia-smi
ssh worker-rtx3060.trex-fiordland.ts.net 'curl -fsS http://localhost:11434/api/tags'
```

Operational shortcuts should target MagicDNS names, not LAN IPs.

## Zellij Operator Layout

The existing layout has panes for agents, OpenClaw, GPU status, and ops. The next safe update should point its health panes at `ops/scripts/nyra-smoke-checks.sh` and `ops/scripts/nyra-validate-compose.sh`; avoid paths under the old root `scripts/` tree unless those scripts are restored.

Suggested tabs:

- `health`: smoke checks, compose validation, Gitea health
- `workers`: SSH-based GPU checks and private vLLM/Ollama health
- `logs`: read-only `docker logs --tail` commands
- `deploy`: dry-run validation and rollback checklist
- `incident`: campaign kill switch, compliance pause checklist, owner manual actions

## Paperclip Placement

Prompt package conflict notes allow either orchestrator or Oracle placement. Current repo state has Paperclip on Oracle at `infra/hosts/oracle-vps/docker-compose.paperclip.yml`.

Decision for now:

- Keep the existing Oracle compose as the documented deployed candidate.
- Use orchestrator placement only if Paperclip becomes a live operator dashboard tightly coupled to OpenClaw or Nerve UI.
- Avoid sharing port `3100` between Gitea and Paperclip on the same host. The current prompt env preference for Gitea and the Paperclip compose both use 3100, so deployment must explicitly choose one port map per host.

## Sentry to Paperclip Automation

Event path:

```text
Sentry issue -> webhook receiver -> dedupe key -> Paperclip task -> optional Gitea issue link
```

Minimum event fields:

- project slug
- environment
- issue id
- culprit
- stack trace url
- release sha
- first seen / last seen
- affected route or service

Do not attach request bodies or headers unless a redaction pass has completed.

## SearXNG and Browserless

Recommended Oracle placement:

- `searxng`: private metasearch for research workflows, Cloudflare Access-gated if exposed.
- `browserless`: internal browser automation for screenshot and QA capture, not public.

Required controls:

- No unauthenticated public Browserless endpoint.
- Rate limit browser sessions.
- Keep screenshots and traces out of git unless explicitly approved artifacts.
- Route external research through official sources when technology decisions depend on current docs.

## Troubleshooting

- If Gitea starts but Actions do not run, validate `GITEA_RUNNER_TOKEN`, runner registration state, and Docker socket access.
- If mirror sync fails, validate `GITHUB_TOKEN`, `GITEA_TOKEN`, and remote repo permissions.
- If the webhook posts empty reviews, check diff size against `REVIEW_MAX_CHARS` and secret redaction logs.
- If WaveTerm/Zellij panes fail, check for stale `scripts/` paths and switch to `ops/scripts/`.
- If both Gitea and Paperclip are on Oracle, resolve the `3100` port collision before startup.
