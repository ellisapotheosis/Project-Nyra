---
name: loop-constraints
description: Enforce configured loop path, approval, and file-count safety gates.
version: 2026-07-18
triggers: ["loop constraints", "loop safety"]
tools: [bash]
preconditions: [".agent/loops/constraints.json exists"]
constraints: ["read contracts and state before acting", "deny paths and approvals are fail-closed"]
category: engineering
---

# Loop constraints

Read constraints and the run checkpoint before assessing a change. Treat deny
paths, allowlists, file-count caps, and external-write approvals as hard gates.
