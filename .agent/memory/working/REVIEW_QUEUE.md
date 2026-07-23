# Review Queue

**Pending:** 7
**Oldest staged:** 2026-07-19T01:32:35.511750+00:00

Run `python .agent/tools/list_candidates.py` for detail, then:
- `python .agent/tools/graduate.py <id> --rationale "..."` to accept
- `python .agent/tools/reject.py <id> --reason "..."` to reject
- Review in a batch so cross-candidate contradictions are caught.

## Priority order (top 10)

- **9f83a785bd30** (priority=1166.26, size=89, rejections=0) — FAILURE in claude-code: Command failed: curl -s http://localhost:3001 2>&1 | hea
- **e2a87704241d** (priority=542.41, size=33, rejections=0) — FAILURE in claude-code: Command failed: curl -s http://localhost:3001 2>&1 | hea
- **829d1928d3e6** (priority=349.82, size=11, rejections=0) — FAILURE in claude-code: High-stakes op FAILED (secret): export CF_ACCESS_CLIENT_
- **56113ee28934** (priority=336.73, size=12, rejections=0) — FAILURE in claude-code: High-stakes op FAILED (prod): infisical secrets \ | THIS
- **8bbc4e00c311** (priority=84.18, size=6, rejections=0) — High-stakes op completed (prod): TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ
- **f9c910262e6a** (priority=19.34, size=2, rejections=0) — High-stakes op completed (secret): source ~/.zsh/99-secrets.zsh 2>/dev/null
- **3cb55e4bb4d9** (priority=18.00, size=2, rejections=0) — High-stakes op completed (secret): test -x .git/hooks/pre-commit && echo "Git ho
