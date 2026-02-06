# One‑Hop Nexus Router Integration

## Purpose

The **one‑hop Nexus Router** included in this repository is a self‑contained
deployment of the open‑source Nexus gateway that consolidates both LLM
provider proxying and MCP server aggregation behind a **single endpoint**.  It
is designed to eliminate the need for chained proxies like LiteLLM or
OpenRouter by providing cost–aware model selection, tool discovery and
automatic service registration all in one place.  This integration is
packaged in the `infra/nexus-one-hop` folder and can be started alongside
the rest of the Project Nyra stack using a dedicated compose file.

### Key Features

– **Unified Endpoint** — Exposes OpenAI‑compatible and Anthropic‑compatible
  APIs as well as an `/mcp` endpoint under a single port (`6000` in this
  updated configuration), avoiding double‑hops through multiple proxies.
- **Cost‑Tier Aliases** — Provides friendly aliases such as
  `claude/economy`, `claude/standard`, `claude/premium`, `google/economy` and
  `google/premium` that map to specific upstream models.  In this version
  of the configuration these resolve to `claude-fast`, `claude-sonnet`,
  `claude-opus`, `gemini-cheap` and `gemini-pro`, respectively.  Applications
  can choose a tier up front without worrying about individual model IDs or
  provider differences.
- **Tool Aggregation** — Proxies any MCP servers you configure in
  `nexus-one-hop/config/nexus.toml` (for example, GitHub or local
  file system MCP servers) behind the same `/mcp` endpoint.
- **Automatic Nyra Discovery** — Docker labels register the service with
  the existing Project Nyra service mesh for health checks, routing and
  fuzzy tool search.
- **Self‑hostable** — Comes with scripts for both Linux (`up.sh`) and
  PowerShell (`up.ps1`) that pull the official Nexus image and run it
  locally.

### What’s New in the One‑Hop Integration

In addition to the core capabilities listed above, the one‑hop router
builds on the upstream Nexus project with several enhancements inspired
by the full Project Nyra deployment:

- **Cost‑Aware Routing** — The included configuration enables a
  built‑in `cost_aware` routing strategy that automatically picks the
  cheapest model capable of satisfying a request and gracefully falls
  back on timeout or errors.  This behaviour approximates LiteLLM’s
  cost‑based routing without the need for a separate proxy.
- **Prometheus Metrics** — A lightweight Prometheus exporter runs on
  port `6011` so you can monitor request latency, token usage, model
  distribution and error rates out of the box.  If you already use
  Prometheus/Grafana with Project Nyra, simply scrape the new port to
  integrate the metrics.  See the `observability.*` section in
  `infra/nexus-one-hop/config/nexus.toml` for details.
- **LLM Response Cache** — A small in‑memory cache stores recent
  completions keyed by prompt and model.  This reduces repeated
  requests for identical prompts and can lower both latency and cost.
  Tune `llm.downstream_cache` in the configuration as needed.

All of these features are optional and can be disabled or modified by
editing `infra/nexus-one-hop/config/nexus.toml`.

## Getting Started

1. **Copy the environment file**:

   ```bash
   cd infra/nexus-one-hop
   cp .env.example .env
   ```

   Populate `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY` and any optional keys
   (e.g. `GITHUB_TOKEN`) in `.env`.  If you plan to proxy MCP servers that
   require authentication (GitHub, Bitwarden, etc.), add the relevant
   tokens here as well.

2. **Start the service** alongside the existing stack:

   ```bash
   # Assuming you are in the infra/ directory
   docker compose -f docker-compose.base.yml \
                  -f docker-compose.nexus-one-hop.yml up -d nexus_onehop
   ```

   The service will start on port 6000 and automatically register itself
   with the Nyra mesh.  Prometheus metrics are exposed on port 6011.

3. **Test the LLM gateway**:

   ```bash
   curl http://localhost:6000/llm/openai/v1/models | jq
   
   # Chat completion using Claude economy tier
   curl -s http://localhost:6000/llm/openai/v1/chat/completions \
     -H "Content-Type: application/json" \
     -d '{
       "model": "claude/economy",
       "messages": [{"role": "user", "content": "Summarize the purpose of Project Nyra."}]
     }'
   ```

4. **Access MCP tools**:

   ```bash
   curl http://localhost:6000/mcp -H "Authorization: Bearer $NEXUS_JWT_TOKEN"
   ```

## Customizing the Configuration

The Nexus configuration for the one‑hop router lives in
`infra/nexus-one-hop/config/nexus.toml`.  Some common customizations include:

- **Adding or removing models**:  Under `[llm.providers.<provider>.models]` you
  can define which upstream models are available.  If you remove a model or
  its alias from this file, requests for that tier will result in a 404,
  effectively hard‑disabling it.
- **Adding additional MCP servers**:  Under `[mcp.servers]` you can
  register any number of HTTP or STDIO MCP servers.  See
  [`nexus-one-hop/config/nexus.toml`](../nexus-one-hop/config/nexus.toml)
  for an example of adding GitHub as an MCP server via `@modelcontextprotocol/server-github`.
- **Environment variables in the configuration**:  Use the `{{ env.VAR }}` syntax
  in the TOML to reference keys defined in your `.env` file.  Secrets should
  never be baked into the configuration directly.

### Adding Local GPU Workers

If you operate local GPU workers (for example via
[Ollama](https://ollama.ai)) and want the one‑hop router to favour them
before falling back to cloud providers, you can extend the configuration
to add your workers as additional providers.  Each worker is defined
under `[llm.providers.<name>]` with `type = "openai"` (Nexus uses the
OpenAI API to communicate with custom LLM backends) and a
`base_url_env` that references an environment variable containing the
worker’s URL.  For example:

```toml
[llm.providers.worker_5090]
type = "openai"
base_url_env = "WORKER_5090_URL"
models = ["ollama/deepseek-r1:236b", "ollama/qwen2.5:72b"]
priority = 1  # Lower numbers are tried first

[llm.providers.worker_3090]
type = "openai"
base_url_env = "WORKER_3090_URL"
models = ["ollama/llama3.1:70b"]
priority = 2

[llm.providers.worker_3060]
type = "openai"
base_url_env = "WORKER_3060_URL"
models = ["ollama/codellama:34b"]
priority = 3
```

Then set the corresponding environment variables in your `.env` file,
for example:

```env
WORKER_5090_URL=http://worker-5090.tail-net.ts.net:11434
WORKER_3090_URL=http://worker-3090.tail-net.ts.net:11434
WORKER_3060_URL=http://worker-3060.tail-net.ts.net:11434
```

With this setup the one‑hop router will attempt to satisfy requests
using your most powerful local GPU first, then fall back to less
capable GPUs, and only reach out to cloud providers if all workers
fail or time out.  You can adjust the `priority` values and model
lists to match your hardware.

## Extending the Image

The stock Nexus image does not include Node.js or Python, which are
required by some MCP servers that run as `cmd = [...]` processes.  To
support these servers without running them externally you can build a
custom image:

```Dockerfile
FROM ghcr.io/grafbase/nexus:stable
# Install Node.js (example using Debian base)
RUN apt-get update && apt-get install -y nodejs npm python3 python3-pip && rm -rf /var/lib/apt/lists/*
# Install MCP servers globally or via package manager
RUN npm install -g @modelcontextprotocol/server-filesystem
```

Build and reference this image in `docker-compose.nexus-one-hop.yml` instead
of the default `ghcr.io/grafbase/nexus:stable` if you need to embed
standalone servers.

## Leveraging Tier Aliases in Agents

When writing prompts or constructing requests for agents, prefer the
alias form `<provider>/<tier>` rather than the raw model ID.  This
encapsulates the cost/performance choice in one place and prevents
accidental downgrades or upgrades when the underlying model IDs change.

For example, to guarantee that a high‑stakes strategic planning task
always uses Anthropic’s most capable model you would set:

```json
{
  "model": "claude/premium",
  "messages": [ ... ]
}
```

Conversely, for lightweight classification or summarization you might use
`google/economy` to minimize cost and latency.

## Differences from the Primary Nexus Router

Project Nyra already includes a comprehensive Nexus configuration under
`infra/configs/nexus/nexus.toml` with advanced rate limiting, RBAC,
distributed health checks and a wide variety of MCP servers.  The one‑hop
router serves as a **minimal, standalone gateway** that can be deployed
independently or alongside the primary router.  Key differences include:

- No Redis‑backed rate limiting or RBAC (simpler config).  Use the primary
  router for production environments requiring cluster‑wide controls.
- Simplified LLM provider list focusing on Claude and Gemini; remove
  providers you are not using by editing `config/nexus.toml`.
- Designed to run on a single host; multi‑PC health checks and circuit
  breakers are not configured by default.

You can still mount additional configuration fragments (e.g. `infra/configs/nexus/llm-tiers.toml`)
into the one‑hop router to merge certain features from the primary
configuration, such as Redis rate limits or advanced routing rules.

---

**Maintainer**: Project Nyra Team  
**Last Updated**: {{ date }}