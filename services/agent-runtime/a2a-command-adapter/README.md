# Nyra A2A Command Adapter

A deliberately thin edge adapter that turns a fixed local CLI command or an
OpenAI-compatible agent endpoint into an A2A task service. It preserves task
IDs, cancellation, persisted status, artifacts, and LiteLLM trace headers.

This is an ASAP bridge, not the final rich PTY/session adapter. The initial
wire contract is pinned to A2A 0.3 because the task implementation is compact
and inspectable. LiteLLM can normalize the integrated messaging methods for
1.0 clients. Upgrade to the official A2A SDK before treating task API shapes as
a long-term public contract.

## Fixed command/CLI driver

```bash
export PORT=8762
export AGENT_NAME=llxprt-dev
export ADAPTER_DRIVER=command
export ADAPTER_PROMPT_MODE=arg
export ADAPTER_COMMAND_JSON='["llxprt","--profile-load","nyra-codex-orchestrator","--output-format","text"]'
node server.mjs
```

The command is configured as a JSON string array. User text is never evaluated
as shell syntax. With `ADAPTER_PROMPT_MODE=arg`, it is appended as one argument;
with `stdin`, it is sent to stdin.

## OpenAI-compatible agent API driver

```bash
export PORT=8763
export AGENT_NAME=hermes-product
export ADAPTER_DRIVER=openai
export ADAPTER_OPENAI_BASE_URL=http://127.0.0.1:8642/v1
export ADAPTER_OPENAI_API_KEY=not-needed
export ADAPTER_OPENAI_MODEL=default
node server.mjs
```

Use the systemd template under `infra/systemd/user/` for persistent WSL2 user
services after manually confirming the real LLxprt/OpenHarness CLI invocation.
