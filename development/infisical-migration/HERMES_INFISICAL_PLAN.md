# Project Nyra - Infisical Consolidation & Hermes Secret Plan

> Re-baselined 2026-08-16 against the LIVE Infisical structure (project 8374cea9-e5e8-4050-bda4-b91f25ab30ef, envs: dev / staging / prod).
> Authoritative runbooks: skills `infisical-api` + `infisical-cli-headless` (loaded this session).

## 1. Live folder map (prod, discovered this session)

| Path                      | Count               | Notes                                                                                                         |
| ------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------- |
| /shared                   | 3                   | legacy                                                                                                        |
| /network                  | 131                 | all *_URL / BASE_URL / HOST_URL / ENDPOINT / SSH                                                              |
| /llm-providers/openrouter | 6                   | has valid OPENROUTER_API_KEY (free-only key, works direct + via litellm)                                      |
| /llm-providers/openai     | 8                   |                                                                                                               |
| /llm-providers/anthropic  | 6                   |                                                                                                               |
| /llm-providers/xai        | 1                   |                                                                                                               |
| /llm-providers/google     | 10                  |                                                                                                               |
| /llm-providers/mistral    | 2                   |                                                                                                               |
| /llm-providers/omniroute  | 4                   |                                                                                                               |
| /llm-providers/llxprt     | 9                   |                                                                                                               |
| /llm-providers/hermes     | 1                   |                                                                                                               |
| /infra/ai-profiles/hermes | 9                   | canonical Hermes profile (typo in brief: /infra/rara/ai-profiles/hermes -> real is /infra/ai-profiles/hermes) |
| /external/hermes          | 8 (+47 being added) | Hermes runtime secrets, where we store                                                                        |
| /hosts/oracle-vps         | 336                 |                                                                                                               |
| /hosts/worker-rtx5090     | 303                 |                                                                                                               |
| /hosts/worker-rtx3090ti   | 302                 |                                                                                                               |
| /hosts/orchestrator       | 325                 |                                                                                                               |

NOTE: earlier scan3.json referenced /providers/litellm, /clients - those paths NO LONGER EXIST.
Live canonical provider path is /llm-providers/_. The "189 conflicting keys" must be re-derived
from live /hosts/_ (336/303/302/302/325) - likely the same secret stored per-host.

## 2. Hermes secrets (active task)

- Canonical Hermes profile: /infra/ai-profiles/hermes (9 keys) - "has all the secrets Hermes uses."
- Runtime store: /external/hermes - user directive: "Hermes secrets go in /external/hermes."
- Action taken: all missing Hermes keys from local C:\Users\edane\AppData\Local\hermes\.env stored
  into /external/hermes for dev + staging + prod (idempotent per-key `infisical secrets set`).

### Dedup rule (AGENTS.md)

1 canonical source per secret; other locations use a pathed reference
${<env>.<canonical-folder>.<KEY>} (Infisical native secret reference), never a copied literal.
/external/hermes and /infra/ai-profiles/hermes overlap by design -> pick one canonical, other imports.
DECISION PENDING USER (sec 5).

## 3. litellm / OpenRouter (DONE this session)

- Oracle-vps .env had stale OPENROUTER_API_KEY; synced to valid Infisical /llm-providers/openrouter value
  (free-only key works direct + via litellm).
- Injected OPENROUTER_API_KEY into the litellm service environment: block (was missing - earlier edits
  landed in omniroute/nexus by mistake). Backups: docker-compose.yml.bak-openrouter-litellm-*.
- Remapped 7 dead :free OpenRouter models in configs/litellm/config.yaml to the 16 currently-free
  models (e.g. llama-4-scout:free -> gemma-4-26b-a4b-it:free). Backups: config.yaml.bak-openrouter-free*.
- Verified: openrouter/deepseek, openrouter/cohere, openrouter/llama4, openrouter/gemini-flash all
  return 200 with real completions through https://litellm.projectnyra.com.

## 4. Omniroute 503 (NOT fixed - needs upstream cred)

- omniroute service healthy & listening on :20128, but its upstream `theoldllm` proxy returns
  403 Forbidden / credential exhaustion ("THEOLDLLM | refresh failed").
- Root cause: omniroute's configured backend credential for theoldllm is expired/invalid.
  This is an omniroute config issue (its upstream API key), not litellm.
- Action: locate omniroute's upstream key (env var or config) and refresh it. OpenAI subscription is
  inactive -> subscription/* + free/* (llxprt) routes depending on paid OpenAI stay down (expected).

## 5. Open decisions for the user

1. Canonical Hermes location: /infra/ai-profiles/hermes (has 9) vs /external/hermes (runtime store).
   Which is canonical? The other imports via reference.
2. 189-conflict collapse: re-derive from live /hosts/* (336/303/302/302/325). Collapse to 1 canonical
   - per-host references. Gated: dev->staging->prod, backup first.
3. Provider keys in /llm-providers/_: real provider secrets. Confirm /external/hermes should also hold
   them or only reference /llm-providers/_.

## 6. Hard safety gates (from skill)

Backup exists - target exists in all 3 envs - value fingerprints match - all consumers updated -
validation passed -> only then any destructive delete. /shared retired only after consumers repoint.

## 7. Local mirror layout (Phase 0 backup target)

development/infisical-secrets/$env$path/.env - one file per folder boundary,
"# Infisical mirror - env=$env path=$p" header.

## 8. Canonical Hermes decision EXECUTED (2026-08-16)

- User chose: canonical Hermes source = /infra/ai-profiles/hermes.
- MERGED /external/hermes INTO canonical (ADD-only, 162 keys added; canonical GITHUB_TOKEN won the
  single conflict). Canonical now: dev=64, staging=64, prod=63 keys.
- /external/hermes CONVERTED to a thin reference layer: every value is now
  ${<env>.infra.ai-profiles.hermes.<KEY>} pointing at canonical (175 refs set; verified ANTHROPIC/
  OPENROUTER/GITHUB_TOKEN resolve to real values on read). No duplication; consumers of /external/hermes
  unchanged.
- Backups: /external/hermes pre-convert dumps in development/infisical-secrets/pre-convert-*/external/hermes.
- REMAINING (deferred, needs user): /hosts/* 189-ish duplicate collapse; /llm-providers/* vs
  /external/hermes provider-key dedup (those still duplicate real provider secrets).
