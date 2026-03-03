# OpenClaw / ClawHub security reality check

OpenClaw is powerful, but the ecosystem has recently seen real supply-chain attacks via malicious Skills.
Treat Skills as untrusted code.

Rules:
- Prefer official/well-audited skills
- Read SKILL.md before install
- Scan before install (example: `uvx mcp-scan@latest --skills`)
- Never paste secrets into chats; prefer env refs / secret providers
- Keep sandboxing and allowlists tight

This bootstrap does **not** auto-install skills.

Use `infra/scripts/openclaw/skills_top20_downloads.sh` to fetch the real top-20 list on your machine.
