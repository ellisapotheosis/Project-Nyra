import hashlib
import hmac
import os
from pathlib import Path
from typing import Any, Dict, Optional

import httpx
from fastapi import FastAPI, Header, HTTPException, Request

app = FastAPI(title="NYRA Gitea AI Reviewer")


def read_secret(name: str, default: str = "") -> str:
    fp = os.getenv(f"{name}_FILE")
    if fp:
        p = Path(fp)
        if p.exists():
            return p.read_text(encoding="utf-8").strip()
    return os.getenv(name, default).strip()


def require_bearer(auth_header: Optional[str], expected_token: str) -> None:
    if not expected_token:
        return
    if not auth_header or not auth_header.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Authorization must be Bearer")
    got = auth_header.split(" ", 1)[1].strip()
    if not hmac.compare_digest(got, expected_token):
        raise HTTPException(status_code=403, detail="Invalid Authorization token")


def verify_gitea_signature(raw_body: bytes, header_sig: Optional[str], secret: str) -> None:
    if not secret:
        return
    if not header_sig:
        raise HTTPException(status_code=401, detail="Missing X-Gitea-Signature")
    digest = hmac.new(secret.encode("utf-8"), raw_body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(digest, header_sig.strip()):
        raise HTTPException(status_code=403, detail="Invalid signature")


async def gitea_api(method: str, url: str, token: str, **kwargs: Any) -> httpx.Response:
    headers = kwargs.pop("headers", {})
    headers["Authorization"] = f"token {token}"
    headers["Accept"] = "application/json"
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.request(method, url, headers=headers, **kwargs)
        r.raise_for_status()
        return r


async def openai_chat(base_url: str, api_key: str, model: str, prompt: str) -> str:
    url = base_url.rstrip("/") + "/chat/completions"
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You are a senior code reviewer. Be direct, concrete, and actionable."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2,
    }
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    async with httpx.AsyncClient(timeout=120) as client:
        r = await client.post(url, json=payload, headers=headers)
        r.raise_for_status()
        data = r.json()
        return (data.get("choices", [{}])[0].get("message", {}) or {}).get("content", "").strip()


def extract_pr_index(payload: Dict[str, Any]) -> Optional[int]:
    pr = payload.get("pull_request") or payload.get("pullRequest") or {}
    for key in ("number", "index", "id"):
        value = pr.get(key)
        if isinstance(value, int):
            return value
        if isinstance(value, str) and value.isdigit():
            return int(value)
    issue = payload.get("issue") or {}
    value = issue.get("number")
    if isinstance(value, int):
        return value
    return None


@app.get("/healthz")
async def healthz() -> Dict[str, bool]:
    return {"ok": True}


@app.post("/webhook/gitea")
async def webhook_gitea(
    request: Request,
    x_gitea_event: Optional[str] = Header(default=None),
    x_gitea_signature: Optional[str] = Header(default=None),
    authorization: Optional[str] = Header(default=None),
) -> Dict[str, Any]:
    raw = await request.body()

    require_bearer(authorization, read_secret("WEBHOOK_AUTH_TOKEN"))
    verify_gitea_signature(raw, x_gitea_signature, read_secret("WEBHOOK_SECRET"))

    payload = await request.json()
    if (x_gitea_event or "").lower().strip() != "pull_request":
        return {"ok": True, "ignored": True}

    base_url = os.getenv("GITEA_BASE_URL", "http://gitea:3000").rstrip("/")
    token = read_secret("GITEA_TOKEN")
    if not token:
        raise HTTPException(status_code=500, detail="Missing GITEA_TOKEN")

    repo = payload.get("repository") or {}
    owner = (repo.get("owner") or {}).get("login") or (repo.get("owner") or {}).get("username") or repo.get("owner_name")
    name = repo.get("name")
    if not owner or not name:
        raise HTTPException(status_code=400, detail="Cannot determine owner/repo")

    pr_index = extract_pr_index(payload)
    if pr_index is None:
        raise HTTPException(status_code=400, detail="Cannot determine PR index")

    diff_url = f"{base_url}/api/v1/repos/{owner}/{name}/pulls/{pr_index}.diff"
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.get(diff_url, headers={"Authorization": f"token {token}"})
        r.raise_for_status()
        diff_text = r.text

    max_chars = int(os.getenv("REVIEW_MAX_CHARS", "18000"))
    diff_text = diff_text[:max_chars]

    review = await openai_chat(
        os.getenv("OPENAI_BASE_URL", "https://openrouter.ai/api/v1"),
        read_secret("OPENAI_API_KEY"),
        os.getenv("REVIEW_MODEL", "anthropic/claude-3.5-sonnet"),
        (
            "Review this Gitea pull request diff. Focus on correctness, security, and maintainability.\n"
            "- Give a short summary\n"
            "- List concrete issues with file/line context when possible\n"
            "- Suggest fixes\n\n"
            f"DIFF:\n{diff_text}\n"
        ),
    )

    comment_url = f"{base_url}/api/v1/repos/{owner}/{name}/issues/{pr_index}/comments"
    await gitea_api("POST", comment_url, token, json={"body": f"### 🤖 AI Review\n\n{review}\n"})

    return {"ok": True, "posted": True, "repo": f"{owner}/{name}", "pr": pr_index}
