# Codex Skills for Nyra Infra (Oracle VPS + Cloudflared + Gitea + LAN GPUs)

This guide maps currently available curated Codex skills to your target setup and documents a tested installer workflow.

## Best-Match Curated Skills

From the current curated registry, these are the most useful for your environment:

1. `cloudflare-deploy` - Helps with Cloudflare deployment workflows (useful for Cloudflared-adjacent ops).
2. `gh-fix-ci` - Useful for CI/CD troubleshooting and iteration (applies when integrating Gitea pipelines with mirrored GitHub or similar workflow checks).
3. `security-best-practices` - Hardening guidance for VPS, tunnels, agents, and exposed services.
4. `security-threat-model` - Threat modeling for your orchestrator + worker + VPS + tunnel topology.
5. `playwright` and `screenshot` - Helpful for end-to-end UI validation of your webapp/tunnel routes.

## Skills Not Present in Curated List (Current Session)

No curated skill currently exists (in this session registry) specifically for:

- Oracle VPS provisioning
- Tailscale mesh architecture
- Docker Desktop on Windows + WSL2 GPU workers
- Mem0 setup
- Grafbase/Nexus setup
- Gitea installation/admin
- n8n/LiteLLM/Ollama/vLLM orchestration

For those, use project setup docs plus direct implementation workflows.

## Installer Debug Notes (Tested)

### Symptom
Running repeated `--path` flags may only install one skill in some invocations.

### Cause
`install-skill-from-github.py` expects **one** `--path` flag followed by one-or-more path values.

### Working Command (tested)

```bash
python3 /opt/codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo openai/skills \
  --path \
  skills/.curated/cloudflare-deploy \
  skills/.curated/gh-fix-ci \
  skills/.curated/security-best-practices
```

### Verify Installed Skills

```bash
python3 /opt/codex/skills/.system/skill-installer/scripts/list-curated-skills.py
```

Look for `(already installed)` markers.

## Recommended Next Installs

```bash
python3 /opt/codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo openai/skills \
  --path \
  skills/.curated/playwright \
  skills/.curated/screenshot
```

After installing skills, restart Codex to load them.
