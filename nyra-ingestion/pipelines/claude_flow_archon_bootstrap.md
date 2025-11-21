# Claude-Flow + Archon Document Cleaning Workflow

This guide wires Nyra's document cleaning into the Claude-Flow@alpha and Archon MCP stack while keeping Open WebUI as the shared surface for agents, pipelines, and UI add-ons. It leans on the existing MCP topology defined in [`mcp.json`](../../mcp.json) and the SPARC-first patterns documented in [`WARP.md`](../../WARP.md).

## Outcomes
- **Cleaning + inventory**: reuse `pipelines/bootstrap_ingest.py` as the canonical cleaner and inventory generator.
- **MCP-aware orchestration**: Claude-Flow handles swarm/task coordination; Archon provides complementary MCP services surfaced inside Open WebUI via MetaMCP/Archon proxy channels.
- **UI integration**: Open WebUI/OWUI hosts Claude-Flow UI modifiers (UI/analytics/enhanced/sparc/roo/flow-nexus) and embeds Archon panels.
- **Extensibility**: ready to experiment with agentic-flow, ONNX, agentdb, and other alpha/Future WIP features from the Claude-Flow ecosystem.

## Prerequisites
1. Node.js + npm available on the host.
2. Python 3.11+ for the local cleaners.
3. Anthropic/OpenAI/OpenRouter credentials exported as environment variables for Claude-Flow and Archon where applicable.
4. Open WebUI running with MCP proxy support (MetaMCP or Archon MCP proxy) enabled.

## Bootstrapping Claude-Flow@alpha
1. **Initialize with SPARC and UI modifiers** (executes in repo root):
   ```bash
   npx claude-flow@latest init --sparc --ui --analytics --enhanced --roo --flow-nexus
   ```
   - Use `--force` if you need to refresh an existing `.claude` tree.
2. **Register MCP servers** (matches [`mcp.json`](../../mcp.json)):
   ```bash
   claude mcp add claude-flow npx claude-flow@alpha mcp start
   claude mcp add archon uvx python -m ARCHON_MCP_MODULE start
   claude mcp add metamcp uvx metamcp start
   claude mcp add ruv-swarm npx ruv-swarm mcp start
   claude mcp add flow-nexus npx flow-nexus@latest mcp start
   ```
   - Keep optional servers (roo, sparc, hive-mind) aligned with the toggles already present in `mcp.json`.
3. **Hook SPARC workflows**
   - SPARC commands are documented in [`WARP.md`](../../WARP.md#quick-setup), e.g. `npx claude-flow sparc run <mode> "<task>"` or `npx claude-flow sparc pipeline "<task>"`.
   - Use Claude Code task tool for execution and MCP tools for topology (`mcp__claude-flow__swarm_init`, `mcp__claude-flow__agent_spawn`, etc.).
4. **Provider setup (Litellm/OpenRouter fallback)**
   - If Claude-Flow lacks native providers for your target model, configure `.claude/config.json` with `provider: "litellm"` or `provider: "openrouter"` and corresponding API keys. Keep the same default model values used by `NYRA_ANTHROPIC_MODEL` to minimize drift.

## Bootstrapping Archon alongside Claude-Flow
1. **Standalone Archon package**
   - Keep Archon MCP server startable via `uvx python -m ARCHON_MCP_MODULE start` as declared in [`mcp.json`](../../mcp.json).
   - Provide an OWUI/MetaMCP channel named `archon-core` that forwards to the Archon MCP endpoint, separate from Claude-Flow routing.
2. **Embed Archon UI in Open WebUI**
   - Add an Open WebUI plugin/panel that hits the Archon status endpoint; mirror the pattern from `integrations/claude-flow+archon-mcp/overlay/ui/panels/archon-status.tsx` if you extend the UI bundle.
3. **Routing policy**
   - Default to Claude-Flow for swarm coordination, route schema or structured knowledge calls to Archon when the task requires Archon-specialized tools.

## Document cleaning workflow (end-to-end)
1. **Prepare inputs**: Drop raw documents or `.zip` files into `ingest_input/` (or override `INGEST_INPUT`).
2. **Run cleaning/inventory**:
   ```bash
   python nyra-ingestion/pipelines/bootstrap_ingest.py
   ```
   - Outputs land in `ingest_output/` with `inventory.json` and normalized samples under `clean/`.
3. **Announce results to MCP stack**:
   - Publish `clean_index.json` via filesystem MCP (`@modelcontextprotocol/server-filesystem`) so Claude-Flow agents can pull cleaned artifacts.
   - Use an OWUI pipeline channel to trigger a Claude-Flow SPARC mode (e.g., `sparc pipeline "ingest-output triage"`) once cleaning succeeds.
4. **Archon enrichment**:
   - Forward `clean/` JSON documents to Archon MCP for any schema mapping/analytics required by downstream pipelines.
5. **Feedback + monitoring**:
   - Keep swarm/task monitoring in Claude-Flow (`npx claude-flow monitor`) and Archon UI panel for MCP health.

## OWUI channel layout (example)
Create an OWUI/MetaMCP routing file (for example `nyra-ingestion/pipelines/owui-mcp-routing.yaml`) that defines dedicated channels:
```yaml
channels:
  claude-flow-core:
    servers: [claude-flow, filesystem]
    intent: "Swarm coordination + SPARC entrypoint"
  archon-core:
    servers: [archon]
    intent: "Archon analytics/UI-backed tasks"
  metamcp-aggregate:
    servers: [metamcp, claude-flow, archon, filesystem]
    intent: "Proxy aggregator for Open WebUI pipelines"
  lobechat-experiments:
    servers: [claude-flow]
    intent: "Run lobechat or OWUI pipelines against cleaned docs"
```
Wire this file into Open WebUI/OWUI so each channel is selectable when launching a pipeline.

## Future work (alpha/WIP coverage)
- Track Claude-Flow agentic-flow, ONNX, and agentdb experimental branches. Keep them as optional MCP servers (enabled behind env flags) so they can be swapped in for archgw-mcp, Langfuse, TensorZero, Grafana/Loki/Prometheus if/when the Claude-Flow repo exposes replacements.
- Maintain Litellm/OpenRouter provider blocks until native drivers land; align secrets with existing `NYRA_*` environment conventions.
- Consider ruvnet/ruv-swarm MCP servers (`claude mcp add ruv-swarm npx ruv-swarm mcp start`) for enhanced swarm coordination alongside Claude-Flow, as outlined in [`WARP.md`](../../WARP.md#quick-setup).

## Operational checklist
- [ ] Claude-Flow initialized with UI/analytics/enhanced/sparc/roo/flow-nexus modifiers
- [ ] MCP servers registered per `mcp.json`
- [ ] Open WebUI channel file installed and enabled
- [ ] `bootstrap_ingest.py` run for the current document set
- [ ] Cleaned outputs exposed to Claude-Flow + Archon via filesystem/MetaMCP
- [ ] Monitoring tabs active in OWUI (Claude-Flow monitor + Archon status panel)
