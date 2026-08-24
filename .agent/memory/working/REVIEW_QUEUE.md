# Review Queue

**Pending:** 39
**Oldest staged:** 2026-07-20T15:49:40.312690+00:00

Run `python .agent/tools/list_candidates.py` for detail, then:

- `python .agent/tools/graduate.py <id> --rationale "..."` to accept
- `python .agent/tools/reject.py <id> --reason "..."` to reject
- Review in a batch so cross-candidate contradictions are caught.

## Priority order (top 10)

- **2e64e61a3921** (priority=24516.00, size=908, rejections=0) — FAILURE in claude-code: High-stakes op FAILED (prod): set +x && infisical run --
- **e09c518f4231** (priority=14922.00, size=829, rejections=0) — FAILURE in claude-code: Command failed: docker --context orchestrator exec orche
- **8ae0551e159f** (priority=9892.80, size=687, rejections=0) — FAILURE in claude-code: Command failed: set +x; infisical secrets --json | jq '.
- **e01377698efe** (priority=4347.00, size=161, rejections=0) — High-stakes op completed (secret): chmod +x /home/ellisapotheosis/repos/project-
- **4f3952e03843** (priority=1026.00, size=38, rejections=0) — Wrote /home/ellisapotheosis/repos/project-nyra/infra/hosts/HERMES_GATEWAY_CONNEC
- **c5b2969b3a99** (priority=999.00, size=37, rejections=0) — Wrote /home/ellisapotheosis/repos/project-nyra/infra/hosts/HERMES_GATEWAY_CONNEC
- **831089d17679** (priority=648.00, size=24, rejections=0) — High-stakes op completed (secret): docker --context worker-rtx3060 inspect worke
- **2f0434f7bdbd** (priority=648.00, size=24, rejections=0) — High-stakes op completed (prod): python3 - << 'EOF'
- **de6815ac26fc** (priority=486.00, size=18, rejections=0) — High-stakes op completed (prod): python3 - << 'EOF'
- **c54fd301118c** (priority=486.00, size=18, rejections=0) — Wrote /home/ellisapotheosis/repos/project-nyra/docs/security/INFISICAL-CLOUD-AGE
