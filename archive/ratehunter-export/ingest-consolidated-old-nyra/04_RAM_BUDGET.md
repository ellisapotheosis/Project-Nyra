# Project Nyra – RAM Budget and Resource Planning

The orchestrator machine (Minisforum UH680 with 16 GB DDR5 RAM) runs all core services continuously.  To ensure stability we define conservative memory budgets for each component.  This document outlines our resource allocations and provides guidelines for tuning.

## Summary of Allocations (Orchestrator)

| Component | Allocation | Notes |
|---------|-----------|------|
| **Postgres + RuVector** | **4 GB** | Postgres uses a shared buffer pool capped at 2 GB; RuVector’s HNSW index is limited to 2 GB.  Autovacuum and background writer are tuned to minimise spikes. |
| **Redis** | **512 MB** | Enough to hold job queues and small caches.  Redis’s `maxmemory` is set to 512 MB with `allkeys-lru` eviction. |
| **AI Service (NestJS)** | **2 GB** | Includes process memory plus room for loaded model prompts and retrieved patterns.  CPU limited to 2 cores. |
| **LiteLLM** | **512 MB** | Lightweight router; caches small token usage counters. |
| **n8n** | **1 GB** | Handles a handful of concurrent workflows; scale up if more heavy automation is expected. |
| **Claude Code** | **2 GB** | The autonomous code agent (if running) uses Node; set memory limit to 2 GB in the systemd service. |
| **Other services (Prometheus, Grafana, etc.)** | **1 GB** | Monitoring stack. |
| **Operating system & overhead** | **2 GB** | Leaves headroom for OS, file cache and miscellaneous processes. |

**Total Reserved:** approximately **13 GB**.  This leaves roughly **3 GB** of free memory for transient peaks and OS caching.  If additional services are required (e.g. Dify UI, heavy analytics), they should run on a worker laptop or on the Oracle VPS VPS.

## Tuning Guidelines

1. **Monitor consumption** – Use Grafana dashboards or `htop` to observe memory usage over time.  The orchestrator’s Prometheus exporter collects metrics from Postgres and containers.
2. **Adjust Postgres** – If the vector store grows, increase `shared_buffers` and `ruvector.memory_limit` gradually.  A good rule of thumb is to allocate 25–30 % of total RAM to Postgres but avoid starving other services.
3. **Tune Redis** – Keep the `maxmemory` low; job payloads should be small.  BullMQ persists job results to Postgres, so Redis can evict old keys safely.
4. **Use workers for heavy loads** – Offload memory‑intensive tasks (embedding generation, large prompts) to the RTX 3090 Ti worker or to a Oracle VPS VPS.  Only schedule these tasks on the orchestrator if necessary.
5. **Consider RAM upgrade** – If additional features are added (e.g. more dashboards, large NLP models), upgrade the orchestrator to 32 GB RAM.  This provides a comfortable margin for growth.

## Worker Laptops

Workers run UI‑heavy components and local development tools.  They each have 24 GB+ RAM and can easily handle TwentyCRM’s frontend, Dify and a local Claude Code instance.  Because they connect to orchestrator services over Tailscale and Docker tunnels, they do not need to run heavy databases.

The RTX 3090 Ti worker should have at least 32 GB RAM (host) and a dedicated GPU with 24 GB VRAM.  Embedding generation and model fine‑tuning tasks run there.  Memory allocation is managed by the job scheduler; we avoid OOM by limiting concurrency.

## Conclusion

A 16 GB orchestrator is viable for the core AI stack given careful resource budgeting.  The provided allocations are a starting point; monitor your actual workload and adjust accordingly.  Additional services should run on workers or in the cloud to prevent oversubscription.  With this setup, Nyra delivers continuous AI assistance without overwhelming the hardware.