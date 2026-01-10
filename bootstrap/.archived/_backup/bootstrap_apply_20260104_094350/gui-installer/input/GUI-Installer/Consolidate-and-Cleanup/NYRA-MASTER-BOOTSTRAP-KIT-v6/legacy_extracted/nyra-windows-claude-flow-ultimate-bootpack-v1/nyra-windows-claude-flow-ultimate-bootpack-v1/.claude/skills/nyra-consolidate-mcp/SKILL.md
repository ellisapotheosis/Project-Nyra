---
name: nyra-consolidate-mcp
description: Aggregate all MCP configs/servers via MetaMCP, standardize to a single windows JSON under nyra-infra/mcp, wire optional Casistack orchestrator.
tags: [mcp, metamcp, orchestrator, windows, stdio, http, sse]
category: ai-orchestration
---

# NYRA — MCP Consolidation

## Goal
Merge **all** MCP configuration fragments into `nyra-infra/mcp/mcp.windows.json` (single source of truth). Configure **MetaMCP** to proxy/aggregate them. Optionally prepare **Casistack** OpenWebUI MCP Orchestrator for containerized server management.

## Guardrails
- Prefer stdio for local servers; http/sse for remote gateways.
- Never check in secrets; use `${ENV}` expansion.
- Generate a health-check plan for each server.

## Steps
1. Inventory all MCP configs (JSON/TOML/YAML/JS). Produce a mapping table of server name → endpoint/command → transport.
2. Normalize into `nyra-infra/mcp/mcp.windows.json` and produce a `metamcp.config.json` that declares upstreams.
3. Create `nyra-infra/compose/compose.metamcp.yml` (or update) with port `12008`, external network `nyra-network`.
4. Optionally prepare Casistack: scripts to clone and docker-compose to run orchestrator.
5. Validate: ensure each stdio server can start (`--help`/`mcp start`) and each http/sse responds to `/health` or MCP handshake.
6. Create branch `infra/mcp-consolidation`, commit normalized configs and docs.

## Outputs
- `mcp.windows.json` and `metamcp.config.json`
- Validation transcript per server
- Final routing diagram
