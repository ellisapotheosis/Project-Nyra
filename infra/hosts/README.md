# Infra Hosts Scaffolding

This folder defines host ownership boundaries for infrastructure assets.

## Hosts

- `oracle-host/`
Cloud VPS role (public ingress, shared platform services, backup/control plane as needed).
- `orchestrator-host/`
Primary orchestrator node role (core app orchestration, CI/runtime coordination, internal gateways).
- `worker-pc-hosts/`
GPU worker host roles (one folder per worker class/host).
- `homeassistant-host/`
Home Assistant Green role (home lab operations plane, local service integrations, selected add-ons).

## Rule

When adding or moving infra assets, keep active runtime ownership documented in one of these host folders before merging.
