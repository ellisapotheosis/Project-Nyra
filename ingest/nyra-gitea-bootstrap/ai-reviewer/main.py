import os
import hmac
import hashlib
import json
from typing import Any, Dict, Optional

import httpx
from fastapi import FastAPI, Header, HTTPException, Request

app = FastAPI(title="NYRA Gitea AI Reviewer")

GITEA_BASE_URL = os.getenv("GITEA_BASE_URL", "http://gitea:3000").rstrip("/")
GITEA_TOKEN = os.getenv("GITEA_TOKEN", "").strip()

WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "").strip()
WEBHOOK_AUTH_TOKEN = os.getenv("WEBHOOK_AUTH_TOKEN", "").strip()

OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://openrouter.ai/api/v1").rstrip("/")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()

REVIEW_MODEL = os.getenv("REVIEW_MODEL", "anthropic/claude-3.5-sonnet").strip()
REVIEW_MAX_CHARS = int(os.getenv("REVIEW_MAX_CHARS", "18000"))
REVIEW_POST_AS_REVIEW = os.getenv("REVIEW_POST_AS_REVIEW", "true").lower() in ("1", "true", "yes", "y")
REVIEW_LABEL = os.getenv("REVIEW_LABEL", "ai-reviewed").strip()

def _require_env(name: str, value: str) -> None:
    if not value:
        raise RuntimeError(f"Missing required env var: {name}")

def verify_webhook(raw_body: bytes, signature_hex: Optional[str], authorization: Optional[str]) -> None:
    # Optional Bearer token check (recommended)
    if WEBHOOK_AUTH_TOKEN:
        expected = f"Bearer {WEBHOOK_AUTH_TOKEN}"
        if authorization != expected:
            raise HTTPException(status_code=401, detail="Invalid Authorization header")

    # Optional HMAC signature check (recommended)
    if WEBHOOK_SECRET:
        if not signature_hex:
            raise HTTPException(status_code=400, detail="Missing X-Gitea-Signature header")
        mac = hmac.new(WEBHOOK_SECRET.encode("utf-8"), msg=raw_body, digestmod=hashlib.sha256)
        expected_hex = mac.hexdigest()
        if not hmac.compare_digest(expected_hex, signature_hex):
            raise HTTPException(status_code=401, detail="Invalid X-Gitea-Signature")

async def gitea_get(client: httpx.AsyncClient, path: str, accept: str = "application/json") -> httpx.Response:
    headers = {
        "Authorization": f"token {GITEA_TOKEN}",
        "Accept": accept,
    }
    return await client.get(f"{GITEA_BASE_URL}/api/v1{path}", headers=headers, timeout=60)

async def gitea_post(client: httpx.AsyncClient, path: str, payload: Dict[str, Any]) -> httpx.Response:
    headers = {
        "Authorization": f"token {GITEA_TOKEN}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
    return await client.post(f"{GITEA_BASE_URL}/api/v1{path}", headers=headers, json=payload, timeout=60)

async def openai_chat(client: httpx.AsyncClient, prompt: str) -> str:
    _require_env("OPENAI_API_KEY (OPENROUTER_API_KEY)", OPENAI_API_KEY)
    payload = {
        "model": REVIEW_MODEL,
        "messages": [
            {"role": "system", "content": "You are a strict senior code reviewer. Be concise, actionable, and point out correctness/security/perf risks."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2,
    }
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    r = await client.post(f"{OPENAI_BASE_URL}/chat/completions", headers=headers, json=payload, timeout=120)
    r.raise_for_status()
    data = r.json()
    return data["choices"][0]["message"]["content"]

def build_prompt(repo_full: str, pr_number: int, title: str, diff_text: str) -> str:
    diff_text = diff_text[:REVIEW_MAX_CHARS]
    return f"""Repo: {repo_full}
PR: #{pr_number}
Title: {title}

Review this diff. Output:
1) Summary (1-3 bullets)
2) High risk issues (bullets)
3) Suggestions (bullets)
4) Optional improvements (bullets)

DIFF:
{diff_text}
"""

@app.post("/webhook/gitea")
async def webhook(
    request: Request,
    x_gitea_event: Optional[str] = Header(default=None),
    x_gitea_signature: Optional[str] = Header(default=None),
    authorization: Optional[str] = Header(default=None),
):
    raw = await request.body()
    verify_webhook(raw_body=raw, signature_hex=x_gitea_signature, authorization=authorization)

    event = (x_gitea_event or "").lower()
    payload = json.loads(raw.decode("utf-8"))

    # We only care about PR events.
    if event != "pull_request":
        return {"ok": True, "ignored": event}

    action = payload.get("action")
    pr = payload.get("pull_request") or {}
    repo = payload.get("repository") or {}

    # Only review on open/update/reopen
    if action not in ("opened", "synchronized", "reopened", "edited"):
        return {"ok": True, "ignored_action": action}

    owner = (repo.get("owner") or {}).get("login") or repo.get("owner", {}).get("username") or ""
    repo_name = repo.get("name") or ""
    pr_number = pr.get("number") or pr.get("index")  # gitea uses index in API
    title = pr.get("title") or ""

    if not (owner and repo_name and pr_number):
        raise HTTPException(status_code=400, detail="Missing repo/pr fields in webhook payload")

    repo_full = f"{owner}/{repo_name}"

    _require_env("GITEA_TOKEN", GITEA_TOKEN)

    async with httpx.AsyncClient() as client:
        # Fetch diff via official endpoint (raw text/plain)
        # Endpoint: /repos/{owner}/{repo}/pulls/{index}.diff
        diff_resp = await client.get(
            f"{GITEA_BASE_URL}/api/v1/repos/{owner}/{repo_name}/pulls/{pr_number}.diff",
            headers={"Authorization": f"token {GITEA_TOKEN}", "Accept": "text/plain"},
            timeout=60,
        )
        if diff_resp.status_code >= 400:
            raise HTTPException(status_code=502, detail=f"Failed to fetch PR diff: {diff_resp.status_code} {diff_resp.text[:200]}")
        diff_text = diff_resp.text

        prompt = build_prompt(repo_full, int(pr_number), title, diff_text)
        review_text = await openai_chat(client, prompt)

        # Try to create a PR review (preferred). If that fails, fall back to issue comment.
        if REVIEW_POST_AS_REVIEW:
            review_payload = {"body": review_text, "event": "COMMENT"}
            r = await gitea_post(client, f"/repos/{owner}/{repo_name}/pulls/{pr_number}/reviews", review_payload)
            if r.status_code >= 400:
                # fallback to comment
                await gitea_post(client, f"/repos/{owner}/{repo_name}/issues/{pr_number}/comments", {"body": review_text})
        else:
            await gitea_post(client, f"/repos/{owner}/{repo_name}/issues/{pr_number}/comments", {"body": review_text})

        # Add a label if configured (ignore errors)
        if REVIEW_LABEL:
            try:
                await gitea_post(client, f"/repos/{owner}/{repo_name}/issues/{pr_number}/labels", {"labels": [REVIEW_LABEL]})
            except Exception:
                pass

    return {"ok": True, "reviewed": repo_full, "pr": pr_number}
