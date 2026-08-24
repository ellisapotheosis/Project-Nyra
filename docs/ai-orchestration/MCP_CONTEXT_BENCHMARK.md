# MCP context benchmark

Status: live transport probes completed 2026-08-24; full 20-call numerical benchmark is blocked by the Portal session exposing no connected upstream server.

| Path      | Discovery layer                                       | Decision                                                                |
| --------- | ----------------------------------------------------- | ----------------------------------------------------------------------- |
| A         | Portal normal mode → Nexus narrow search/execute      | Baseline and default candidate                                          |
| B         | Portal `?optimize_context=search_and_execute` → Nexus | Reject if it nests discovery or adds latency without better reliability |
| C         | Portal direct selected-server aggregation             | Use only for narrowly curated public tools; Nexus remains private       |
| Code Mode | Portal Code Mode → full-tool upstream                 | Opt-in only; reject nested Code Mode and debugging regressions          |

## Observed probes

| Probe                                         | Result                                                                                                            |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Direct Nexus with Access service token        | MCP initialize succeeded; Nexus exposed narrow `search` and `execute`; harmless `search` succeeded.               |
| Portal normal mode with Access service token  | MCP initialize succeeded; Portal built-ins appeared; `portal_list_servers` reported no connected upstream server. |
| Portal `?optimize_context=search_and_execute` | MCP initialize succeeded; Portal query/execute built-ins appeared; connected server set remained empty.           |
| Portal → `nyra-bearer` control-plane sync     | Cloudflare API reported `auth_type=bearer`, `authentication_status=connected`, `status=ready`, `on_behalf=false`. |

The live result supports the default decision: keep exactly one discovery layer per path. Direct private-agent requests use Nexus search/execute. The public Portal path is configured in normal mode, with Code Mode opt-in but not selected, until the linked-server session authorization issue is resolved and latency/context measurements can be collected.

Capture initial schema tokens, discovery success, tool-call success, p50/p95 latency, request/response context tokens, audit correlation, and boundary violations. Run at least 20 identical harmless calls per path and record tool names plus payload sizes, never sensitive values.

Decision: use one context-minimization layer per request path. Because Nexus is intended to expose narrow search/execute tools, Portal normal mode is the default until fresh measurements demonstrate a material B/C benefit. Cloudflare documents that Portal Code Mode cannot front an upstream that already has Code Mode enabled.
