# INCIDENT_RESPONSE_RUNBOOK.md

## 1. Service Down
**Symptom**: `scripts/healthcheck.sh` reports RED.
**Action**:
1. Check container logs: `docker logs <container_name>`.
2. Check resource usage: `docker stats`.
3. Restart service: `docker compose restart <service>`.

## 2. Worker Offline
**Symptom**: LLM requests failing or timing out.
**Action**:
1. Verify Tailscale connectivity: `tailscale status`.
2. Verify vLLM/Ollama process: `nvidia-smi` on the worker host.
3. Check LiteLLM logs on Orchestrator for routing failures.

## 3. Compliance Breach
**Symptom**: Automated message sent to a DNC-flagged lead.
**Action**:
1. PAUSE all Activepieces campaigns immediately.
2. Inspect `AuditEvent` logs to find the performer/source.
3. Verify `ComplianceService` unit tests.
4. Manually update CRM record.

## 4. Secret Leak
**Symptom**: Credentials found in source control or logs.
**Action**:
1. Revoke the key in the provider dashboard (Twilio, SendGrid).
2. Update Infisical with a new key.
3. Force a redeploy of all services using that secret.
