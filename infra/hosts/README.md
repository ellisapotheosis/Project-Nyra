# Infra Hosts Scaffolding

This folder defines host ownership boundaries for infrastructure assets.

## Canonical host folders (Portainer-ready)

- `orchestrator/`
  Primary orchestrator node role (core app orchestration, CI/runtime coordination, internal gateways).
- `worker-hosts/`
  GPU worker host roles (one folder per worker node).
- `oracle-vps/`
  Cloud VPS role (public ingress, shared platform services, backup/control plane as needed).
- `homeassistant/`
  Home Assistant role (home lab operations plane, local service integrations, selected add-ons, and UI dashboard links).

## Legacy compatibility folders

The following folders are retained so existing references do not break while transition to Portainer stack folders is in progress:

- `orchestrator-host/` → maps to `orchestrator/`
- `worker-pc-hosts/` → maps to `worker-hosts/`
- `oracle-host/` → maps to `oracle-vps/`
- `homeassistant-host/` → maps to `homeassistant/`

## Rule

When adding or moving infra assets, keep active runtime ownership documented in one of these host folders before merging.
