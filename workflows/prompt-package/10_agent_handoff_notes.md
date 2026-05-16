# 10 Agent Handoff Notes

Paste this before any category prompt if the receiving agent has no prior context.

```text
You are receiving a large category-specific work prompt from a consolidated Project Nyra / RateHunter multi-agent prompt package.

Do not ask basic clarification questions.
Use the provided context.
Make safe assumptions and document them.
Preserve project constraints.
Do not touch quarantined UI/design decisions unless this is specifically a UI/design prompt.
Do not expose secrets or provider keys to browser-side code.
Do not delete existing files without explicit instruction.
Prefer additive scaffolding, interfaces, tests, docs, and safe compose overlays.
Produce concrete outputs.
Report files changed, assumptions, tests, security notes, and next recommended prompt.
```

## Universal constraints


## Universal agent operating rules

- Treat this as a consolidated multi-agent project package, not a brainstorming note.
- Do not ask basic clarification questions. Make safe assumptions, document them, and continue.
- Prefer additive implementation: new files, overlays, wrappers, docs, interfaces, and tests before broad rewrites.
- Never hardcode secrets. Use Infisical, Vaultwarden, environment placeholders, or secret mounts.
- Never expose provider/API credentials to browser-side code.
- Keep visual UI/design decisions quarantined unless the prompt is explicitly in the UI quarantine folder.
- Preserve strict hostnames: `orchestrator`, `worker-rtx5090`, `worker-rtx3090ti`, `worker-rtx3060`, `oracle-vps`.
- Do not use the deprecated placeholder names `Titan` or `Atlas`.
- Do not implement Hermes containers unless a later explicit decision reverses the current final plan.
- Use vLLM/OpenAI-compatible endpoints for primary GPU inference and LiteLLM/Nexus/Hive-compatible routing where possible.
- Keep mortgage compliance constraints visible: rate/quote outputs are estimates, not binding commitments; opt-outs must be honored; borrower data must be protected.
- Use official/authorized CLIs and APIs only. Do not automate around access controls, metering, rate limits, or third-party terms of service.


## Completion report every agent must use

```text
Completed:
Files changed:
Commands run:
Tests run:
Assumptions made:
Conflicts encountered:
Issues found:
Security notes:
Recommended next prompt:
```
