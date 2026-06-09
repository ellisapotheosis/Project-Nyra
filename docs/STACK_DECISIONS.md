# Stack Decisions

- Twenty CRM is the system of record.
- Activepieces is primary for automation; n8n is a mortgage-only fallback.
- Quote terms come only from deterministic quote/rate services and require broker approval before borrower delivery.
- Worker inference endpoints remain private over Tailscale and gateway routing.
- RTX3060 runs the small utility lane: embeddings, extraction, summarization, and Ollama fallback.
- RTX3090Ti and RTX5090 run vLLM/LiteLLM/Redis/LMCache lanes.
- Gastown replaces Gastown as the active operator workspace.
- Infisical sidecars and mounted secret files are preferred over plaintext host envs.
- Grafana/Prometheus/Loki are centralized where practical; workers run exporters and promtail.
