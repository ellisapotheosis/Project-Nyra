# Project Nyra LLxprt Runtime Instructions

You are running LLxprt Code inside Project Nyra.

Use this stack shape:

- Letta is the orchestrator and long-running memory manager.
- Nexus Router is the singular memory/tool/model endpoint.
- LLxprt Code profiles provide subscription-backed provider failover.
- LLxprt Jefe is the terminal control plane for multi-agent LLxprt sessions.
- WaveTerm and Zellij are the operator cockpit and durable pane layer.
- OpenClaw or PicoClaw instances on workers are assistant/runtime surfaces, not systems of record.

Hard constraints:

- Never commit secrets or export provider keys into shell history.
- Prefer LLxprt OAuth/keyring auth over environment variables.
- Keep worker inference endpoints private over Tailscale.
- Route high-risk CRM/database mutations through Nyra services, approvals, and audit logging.
- Use `@nyra/domain-models` for type contracts and `@nyra/integration-adapters` for third-party SDK boundaries.

Operational defaults:

- Use `nyra-subscription-ha` for long autonomous tasks.
- Use `nyra-subscription-spread` only for parallel short tasks where provider-side prompt cache locality is less important.
- Use `nyra-local-nexus` for private/local-heavy analysis and worker-backed tasks.
- Use `nyra-kimi-reasoning` for long-horizon planning when a Kimi keyring entry is configured.
- Prefer bounded subagents with clear work directories and verification commands.

