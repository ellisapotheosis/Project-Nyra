# NYRA Gitea AI Reviewer

This is a small webhook receiver that:
- verifies `Authorization: Bearer <token>` (optional)
- verifies `X-Gitea-Signature` HMAC SHA256 (optional)
- on PR events, fetches the PR diff and posts an AI review back to Gitea.

It speaks OpenAI-compatible chat completions, so it works with OpenRouter and LiteLLM.

Env vars are passed from the root `.env.gitea`.
