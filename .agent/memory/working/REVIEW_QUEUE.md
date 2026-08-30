# Review Queue

**Pending:** 12
**Oldest staged:** 2026-07-23T02:26:11.126458+00:00

Run `python .agent/tools/list_candidates.py` for detail, then:

- `python .agent/tools/graduate.py <id> --rationale "..."` to accept
- `python .agent/tools/reject.py <id> --reason "..."` to reject
- Review in a batch so cross-candidate contradictions are caught.

## Priority order (top 10)

- **8328a16f536d** (priority=48141.00, size=1783, rejections=0) — FAILURE in claude-code: Command failed: ssh oracle "docker exec oracle-vps-supab
- **874148d31555** (priority=43041.37, size=1635, rejections=0) — FAILURE in claude-code: High-stakes op FAILED (prod): set +x && infisical run --
- **4a6d6211ee0c** (priority=378.00, size=14, rejections=0) — High-stakes op completed (deploy): git add -A && git commit -m "feat(security):
- **2b32f246715f** (priority=324.00, size=12, rejections=0) — Wrote /home/ellisapotheosis/repos/project-nyra/infra/agent-vault/scripts/create-
- **7396396f185f** (priority=229.50, size=17, rejections=0) — High-stakes op completed (deploy): python3 .agent/tools/recall.py "deploy ratehu
- **3eb3141d6c73** (priority=108.00, size=8, rejections=0) — High-stakes op completed (production): cd ~/repos/project-nyra && git add WINDOW
- **f858b5631f0c** (priority=104.76, size=7, rejections=0) — High-stakes op completed (deploy): git add infra/scripts/deploy-all-phases.sh &&
- **b50e1e4cfd41** (priority=92.57, size=6, rejections=0) — High-stakes op completed (deployment): cat > /home/ellisapotheosis/repos/project
- **05fc96009e48** (priority=81.00, size=3, rejections=0) — High-stakes op completed (deploy): # Fix CRLF line endings in scripts
- **cc24e1293107** (priority=45.82, size=3, rejections=0) — High-stakes op completed (secret): cat > /tmp/infisical_keys.sh << 'EOF'
