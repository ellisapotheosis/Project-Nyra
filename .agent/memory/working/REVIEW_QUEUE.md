# Review Queue

**Pending:** 3
**Oldest staged:** 2026-07-19T01:32:35.511750+00:00

Run `python .agent/tools/list_candidates.py` for detail, then:
- `python .agent/tools/graduate.py <id> --rationale "..."` to accept
- `python .agent/tools/reject.py <id> --reason "..."` to reject
- Review in a batch so cross-candidate contradictions are caught.

## Priority order (top 10)

- **e2a87704241d** (priority=448.97, size=30, rejections=0) — FAILURE in claude-code: Command failed: curl -s http://localhost:3001 2>&1 | hea
- **829d1928d3e6** (priority=308.67, size=11, rejections=0) — FAILURE in claude-code: High-stakes op FAILED (secret): export CF_ACCESS_CLIENT_
- **f9c910262e6a** (priority=18.00, size=2, rejections=0) — High-stakes op completed (secret): source ~/.zsh/99-secrets.zsh 2>/dev/null
