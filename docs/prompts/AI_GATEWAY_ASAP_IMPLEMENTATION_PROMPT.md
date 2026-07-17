# Project Nyra — ASAP AI Control Plane Implementation Prompt

You are the principal platform engineer responsible for making Project Nyra's
development environment operational immediately. Work from the repository root.
Inspect `AGENTS.md`, `infra/COMPOSE_SOURCE_OF_TRUTH.md`, all current host Compose
files, the uploaded development bootstrap package, and existing LiteLLM/Nexus
configuration before changing anything.

## Mission

Implement and validate the smallest coherent control plane that allows Ellis to
finish building the rest of Project Nyra:

1. One central, database-backed LiteLLM gateway on the always-on orchestrator.
2. LiteLLM MCP Gateway with Nexus private and downstream.
3. LiteLLM A2A Gateway with edge adapters for LLxprt, Hermes and OpenHarness.
4. Direct private registration of 5090, 3090Ti and 3060 inference endpoints.
5. Scoped virtual keys for development agents, the Hermes product assistant and
   memory workers.
6. Official-OAuth-only OmniRoute as an optional private upstream provider broker.
7. Wave Terminal + Herdr for human terminal control; Omnigent for interactive
   multi-agent coordination; Hermes for the always-on product assistant.

## Non-negotiable boundaries

- LiteLLM is the only client-facing model/MCP/A2A gateway.
- Nexus remains a downstream MCP aggregator until a measured migration proves it
  unnecessary.
- OmniRoute handles provider OAuth/account rotation only; do not expose its MCP
  or A2A surfaces as parallel Nyra gateways.
- Worker hosts expose vLLM/Ollama and explicit A2A adapters. Do not deploy another
  organization-wide LiteLLM gateway on every worker.
- The 3090Ti hosts stable product inference and Hermes because it stays online.
- The 5090 laptop hosts premium development CLIs, LLxprt, OpenHarness, Omnigent,
  and burst local inference.
- The 3060 handles embeddings, extraction, summarization and memory utilities.
- Personal Claude/Codex subscriptions are development capacity, not the only
  production mortgage-assistant backend.
- Use only official OAuth/API mechanisms. Disable cookie relays, fingerprint
  spoofing, geo-bypass and unverified unlimited-free routes.
- Never commit secrets.

## Use the provided fast-start files

- `infra/configs/litellm/config.faststart.yaml`
- `infra/hosts/orchestrator/docker-compose.ai-gateway-faststart.yml`
- `infra/hosts/orchestrator/ai-gateway.env.example`
- `services/agent-runtime/a2a-command-adapter/`
- `infra/systemd/user/nyra-a2a-adapter@.service`
- worker A2A environment examples
- bootstrap, key-generation and verification scripts

## Required execution

1. Create a backup branch and isolated worktree.
2. Validate current Docker Compose source-of-truth policy.
3. Correct actual worker model IDs and the inaccurate 5090 VRAM documentation.
4. Correct each worker's Infisical path from `/machines/oracle-vps` to its own host.
5. Render `/etc/projectnyra/secrets/ai-gateway.env` from Infisical.
6. Bring up Postgres + LiteLLM first.
7. Verify health, models and database persistence.
8. Register/test Nexus MCP through LiteLLM.
9. Generate scoped virtual keys and store them in Infisical.
10. Start Hermes on the 3090Ti using `nyra/product-assistant` through the central
    LiteLLM gateway; expose it through the A2A adapter.
11. Start LLxprt and OpenHarness A2A adapters on the 5090.
12. Verify A2A cards, message submission, task polling and cancellation through
    LiteLLM.
13. Add OmniRoute only after the local gateway works; connect official Claude,
    Codex, Gemini/Qwen/Kimi routes and expose them to LiteLLM.
14. Keep OpenRouter as an optional independent free/fallback source.
15. Configure Wave workspace presets and Herdr sessions for gateway, workers,
    agents and observability.
16. Install Omnigent in WSL2, but do not make completion depend on it.
17. Do not add AgentsMesh, Gas Town, Paperclip, ClawTeam, Nerve, Superset, Orca,
    Tutti or Kubernetes to the critical path.

## Definition of done

- One central LiteLLM endpoint works from all three workers over Tailscale.
- `nyra/product-assistant`, `nyra/dev-local`, `nyra/dev-premium`,
  `nyra/memory-chat` and `nyra/embeddings` resolve correctly.
- Nexus tools can be listed through LiteLLM MCP REST and unauthorized keys fail.
- Hermes, LLxprt and OpenHarness agent cards are discoverable through LiteLLM.
- At least Hermes and one development adapter complete a submitted task.
- Every runtime uses a scoped virtual key, never the master key.
- Secrets are loaded from Infisical or local mode-0600 rendered files.
- Worker-local LiteLLM instances are documented for removal after cutover.
- Runbooks show exact start, stop, verify and rollback commands.

Do not stop at documentation. Run the stack, repair errors, and leave a concise
report with working endpoints, generated key locations, unresolved manual OAuth
steps, and the next three implementation tasks.
