# Agentic‑Flow: `start`, `federation start`, QUIC

## Do I need a separate terminal for `agentic-flow start`?
If the command starts a **server** (proxy/MCP/federation), yes — it stays running until stopped.
If you only run one‑shot commands (like `agentic-flow run ...`), no.

## What is `agentic-flow federation start`?
Federation is “hub‑and‑spoke” execution:
- run the **hub** on your orchestrator PC
- workers join as participants
- tasks can be dispatched across machines

## QUIC Transport
QUIC = UDP + TLS 1.3 + multiplexed streams. Great for high‑frequency coordination, but on a LAN the bottleneck is usually LLM inference, not TCP.

### Starter setup (LAN)
1) Open UDP 4433 on the orchestrator
2) Generate a self‑signed cert+key (WSL):
```bash
mkdir -p ~/nyra-certs
openssl req -x509 -newkey rsa:2048 -nodes   -keyout ~/nyra-certs/quic.key   -out ~/nyra-certs/quic.crt   -days 365   -subj "/CN=nyra-quic.local"
```
3) Set env vars in PowerShell:
```powershell
$env:QUIC_PORT="4433"
$env:QUIC_CERT_PATH="\\wsl$\Ubuntu\home\<you>\nyra-certs\quic.crt"
$env:QUIC_KEY_PATH="\\wsl$\Ubuntu\home\<you>\nyra-certs\quic.key"
```

Recommendation: get federation working over TCP first; add QUIC only if coordination becomes a measured bottleneck.
