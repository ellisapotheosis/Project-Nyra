# Project Nyra AI Gateway Fast Start

## Immediate objective

Stand up enough of the AI control plane to finish building the rest of Nyra
without first deploying every planned orchestrator, dashboard, memory service,
or swarm framework.

## ASAP topology

```text
Wave Terminal + VS Code + Codex Desktop
                 |
        Omnigent (interactive only)
                 |
   LLxprt / Claude Code / Codex / OpenHarness
                 |
        worker-local A2A adapters
                 |
       Central LiteLLM on orchestrator
       /v1 models | /mcp | /a2a
         /                \
OmniRoute private       Nexus private
provider/OAuth broker   MCP aggregator
         \                /
        5090 | 3090Ti | 3060 endpoints
```

## Machine roles

### worker-rtx3090ti — always-on product inference

- Host the stable local model used by `nyra/product-assistant`.
- Run Hermes as the Project Nyra product/mortgage assistant.
- Expose Hermes through the A2A adapter, not directly to every client.
- Remain available while the 5090 laptop travels or sleeps.

### worker-rtx5090 — interactive development and burst inference

- Run Claude Code, Codex CLI, LLxprt, OpenHarness and Omnigent.
- Host the strongest local development model that fits its actual 24 GB VRAM.
- Run the LLxprt and OpenHarness A2A adapters.
- Do not make the production chat surface depend on this laptop.

### worker-rtx3060 — memory utility node

- Embeddings, extraction, summarization, document preprocessing and small chat.
- Do not add Hermes/OpenClaw until those utility jobs are stable and measured.

### orchestrator — authoritative local control plane

- Central LiteLLM model/MCP/A2A gateway.
- Nexus remains a private downstream MCP aggregator during migration.
- OmniRoute is a private official-OAuth/provider broker.
- Optional NATS/JetStream after the gateway works.
- Cloudflared is ingress transport; LiteLLM virtual keys remain application auth.

## Development control

- **Wave Terminal:** human terminal/SSH/log cockpit.
- **Herdr:** persistent terminal panes and emergency attachment inside Wave.
- **Omnigent:** interactive heterogeneous-agent coordination after the gateway is healthy.
- **LLxprt/native CLIs:** execute coding work.
- **Hermes:** always-on product and operations agent, not the global dev scheduler.
- **Letta:** selected long-term memory, not the system orchestrator.
- **Gas Town:** later, only for isolated repo-wide campaigns.

## Bring-up

```bash
cd ~/projects/project-nyra
sudo install -d -m 0700 /etc/projectnyra/secrets
sudo cp infra/hosts/orchestrator/ai-gateway.env.example /etc/projectnyra/secrets/ai-gateway.env
sudo chmod 0600 /etc/projectnyra/secrets/ai-gateway.env
sudoedit /etc/projectnyra/secrets/ai-gateway.env

bash scripts/bootstrap/ai-gateway-faststart.sh
source /etc/projectnyra/secrets/ai-gateway.env
bash scripts/litellm/bootstrap-faststart-access.sh
bash scripts/verify/verify-ai-gateway-faststart.sh
```

Enable optional components only after the base gateway passes:

```bash
bash scripts/bootstrap/ai-gateway-faststart.sh --with-omniroute
bash scripts/bootstrap/ai-gateway-faststart.sh --with-mesh
```

## Cloudflare

Attach the token-managed orchestrator tunnel to the same external Docker
network and route approved hostnames to `http://nyra-litellm-gateway:4000`.
Use separate DNS hostnames for model, MCP, A2A and admin traffic when practical,
but they may share one origin. Do not place a browser-only Access challenge in
front of MCP OAuth discovery or machine A2A traffic. Use Cloudflare service
tokens plus LiteLLM virtual keys for machines.

## Worker-local LiteLLM

The existing 5090 and 3090Ti Compose files contain local LiteLLM proxies. Do
not expand that pattern. Once clients use the central gateway, remove or disable
worker-local LiteLLM and expose only vLLM/Ollama plus explicit agent adapters.
