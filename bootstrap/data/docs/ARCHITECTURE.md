# Architecture (Nyra)

All LLM + MCP traffic routes through Nexus.

Borrower Dify app must only see minimal tools (Graphiti read + scheduling).

Internal ops Dify app can access Activepieces tools and CRM writeback (approval-gated).
