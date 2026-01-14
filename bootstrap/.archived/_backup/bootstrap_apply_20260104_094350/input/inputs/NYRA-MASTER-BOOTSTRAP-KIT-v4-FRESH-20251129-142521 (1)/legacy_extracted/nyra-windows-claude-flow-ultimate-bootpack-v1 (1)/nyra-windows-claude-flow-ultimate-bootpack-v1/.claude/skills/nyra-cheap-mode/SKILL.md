---
name: nyra-cheap-mode
description: Route bulk to cheap providers (Vertex/Gemini via router), escalate to Sonnet only for heavy reasoning.
tags: [cost, routing, strategy, haiku, sonnet]
category: intelligence
---

## Policy
- Haiku for inventory/grep/diff/YAML edits and non-network steps.
- Escalate to Sonnet only if:
  - `docker compose config` fails twice for same file, or
  - single diff > 500 lines, or
  - merge conflict not auto-resolved on first pass.
- After escalation, drop back to Haiku and explain why.
