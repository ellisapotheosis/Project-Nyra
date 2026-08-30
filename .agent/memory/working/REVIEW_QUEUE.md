# Review Queue

**Pending:** 18
**Oldest staged:** 2026-07-23T02:26:11.126458+00:00

Run `python .agent/tools/list_candidates.py` for detail, then:

- `python .agent/tools/graduate.py <id> --rationale "..."` to accept
- `python .agent/tools/reject.py <id> --reason "..."` to reject
- Review in a batch so cross-candidate contradictions are caught.

## Priority order (top 10)

- **262cb7c2362a** (priority=62424.00, size=2312, rejections=0) — FAILURE in claude-code: Command failed: ssh ubuntu@100.64.0.3 "cd /opt/nyra/infr
- **8328a16f536d** (priority=50206.23, size=1917, rejections=0) — FAILURE in claude-code: Command failed: ssh oracle "docker exec oracle-vps-supab
- **4a6d6211ee0c** (priority=378.00, size=14, rejections=0) — High-stakes op completed (deploy): git add -A && git commit -m "feat(security):
- **2b32f246715f** (priority=324.00, size=12, rejections=0) — Wrote /home/ellisapotheosis/repos/project-nyra/infra/agent-vault/scripts/create-
- **fe895832d4f3** (priority=243.00, size=18, rejections=0) — High-stakes op completed (deploy): python3 .agent/tools/recall.py "deploy 12 MCP
- **7396396f185f** (priority=215.73, size=17, rejections=0) — High-stakes op completed (deploy): python3 .agent/tools/recall.py "deploy ratehu
- **b50e1e4cfd41** (priority=104.14, size=6, rejections=0) — High-stakes op completed (deployment): cat > /home/ellisapotheosis/repos/project
- **3eb3141d6c73** (priority=101.52, size=8, rejections=0) — High-stakes op completed (production): cd ~/repos/project-nyra && git add WINDOW
- **a62a7a83574d** (priority=94.50, size=7, rejections=0) — High-stakes op completed (migration): \
- **05fc96009e48** (priority=81.00, size=3, rejections=0) — High-stakes op completed (deploy): # Fix CRLF line endings in scripts
