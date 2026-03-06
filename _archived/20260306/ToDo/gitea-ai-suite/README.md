
# Gitea + AI Supercharged Stack

## What This Gives You
- Gitea with PostgreSQL (best reliability + performance)
- Claude-powered PR reviewer webhook service
- Directory ready for further Claude Flow agents and pipelines
- Windows‑friendly startup scripts

## How to Run
1. Install Docker Desktop on Windows 11.
2. Place your Anthropic API key and Gitea API token in `docker-compose.yml`.
3. Run:
   ```
   ./start.ps1
   ```

## AI Reviewer
`ai-reviewer/reviewer.py` listens for PR webhooks from Gitea and uses Claude to generate comments, suggestions, and perform code-quality scoring.
