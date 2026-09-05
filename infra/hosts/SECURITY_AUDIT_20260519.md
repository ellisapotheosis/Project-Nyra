# Infrastructure Security Audit Report

**Date**: 2026-05-19
**Scope**: Secret handling, port exposure, and infrastructure hardening across all hosts.

---

## Audit Findings

### 1. **Secret Handling**

- **Infisical Integration**: Host primary compose stacks correctly use `secrets-init` and `infisical-agent` to inject secrets via volumes.
- **Environment Variables**: Primary configuration is driven by `.env` files which are correctly ignored by git.
- **Hardcoded Secrets**: No actual production secrets were found in the codebase.
- **Insecure Defaults**: Some compose files used insecure default values for passwords and API keys (`paperclip`, Grafana `admin`, OpenLIT `OPENLIT`, `dummy`).

### 2. **Port Exposure**

- **Oracle-VPS**: Several services (Twenty, n8n, Grafana, etc.) are bound to `0.0.0.0`, potentially exposing them to the public internet.
- **Recommendation**: Bind sensitive services to `127.0.0.1` (for Cloudflare Tunnel access) or the `Tailscale IP`.
  - _Status_: Pending live-host firewall/Tailscale verification before broad binding changes. Worker exposure is reported as a warning by `scripts/infra/audit-runtime-security.sh`.

### 3. **Resource Hardening**

- **Resource Limits**: Most containers lack `deploy.resources.limits` and `reservations`.
- **Recommendation**: Apply standard memory and CPU limits to prevent resource exhaustion and noisy-neighbor issues.
  - _Status_: Deferred to live-capacity tuning; release validation now includes runtime-security warnings so missing limits are visible before deploy.

---

## Remediation Steps

### 1. **Remove Insecure Password Defaults**

- [x] Refactor `docker-compose.paperclip.yml` to remove default `PAPERCLIP_DB_PASSWORD`.
- [x] Refactor orchestrator `docker-compose.observability.yml` to remove default `GRAFANA_ADMIN_PASSWORD`.
- [x] Refactor `_templates/docker-compose.worker-ai-common.yml` to remove default `GRAFANA_ADMIN_PASSWORD`.
- [x] Refactor Oracle OpenLIT and Paperclip MCP secrets to fail closed when missing.
- [x] Add required secret placeholders to host `.env.example` files.
- [x] Add `scripts/infra/audit-runtime-security.sh` for local runtime security validation.

### 2. **Tighten Port Binds (Oracle-VPS)**

- Deferred live-host action: Bind Twenty (3000), n8n (5678), and Grafana (3003) to Tailscale/localhost IPs or document live firewall controls that make the binds private.

### 3. **Standardize Resource Limits**

- Deferred live-host action: Apply service-specific limits to non-compute services after observing current production memory and CPU usage.

---

## Summary

| Item                  | Status                                |
| --------------------- | ------------------------------------- |
| Secrets Audit         | Complete                              |
| No Hardcoded Secrets  | Verified                              |
| Insecure Defaults     | Fixed for identified runtime blockers |
| Port Binding Strategy | Pending live-host verification        |
| Resource Limits       | Planned                               |
