# infra/docker modular compose wrappers

These wrappers mirror the orchestrator/worker compose layout so you can keep a single `infra/docker/*` command surface while still storing service-specific Dockerfiles under `infra/orchestrator` and `infra/worker-*`.
