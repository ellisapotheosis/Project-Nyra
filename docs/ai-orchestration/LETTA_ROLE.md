# Letta role

Letta is the stateful memory-manager agent for long-term planning, consolidation, project state, handoff synthesis, and cross-session policy. It is callable through the restricted Letta MCP bridge or service API.

Letta is not an OpenClaw scheduler and must not spawn uncontrolled agents behind OpenClaw. OpenClaw/ClawTeam retain execution authority. Durable semantic facts are written through the normalized Mem0 path; Letta stores orchestration state and references rather than duplicating every Mem0 fact.

The live Oracle inventory shows `letta`, `letta-mcp`, and their Postgres dependency healthy/running. Validate the bridge with harmless health, search, and handoff calls before enabling it for general agents.
