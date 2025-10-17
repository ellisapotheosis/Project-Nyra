# Project NYRA – Kilo Code Project Rules

## Safety & Approvals
- Never execute destructive terminal commands without explicit confirmation.
- Treat `.env*`, `secrets/**`, and cloud credentials as **never read**.
- Prefer PRs with checklists and linked issues over direct `main` commits.

## Coding Standards
- TypeScript: strict mode; ESLint + Prettier; no implicit `any`.
- Python: ruff, black, mypy (strict optional), pytest.
- Commit style: Conventional Commits.

## Testing
- Minimum unit test coverage: 80% for touched files.
- For bugfixes: add a failing test first, then fix.

## Docs & Memory
- Keep `docs/ADR-*.md` up to date.
- Update `./.kilocode/rules/memory-bank/brief.md` when architecture changes.

## Autopilot guardrails
- Long runs must checkpoint every ~10 steps with a short status.
- Always summarize what changed and why after tool runs.
