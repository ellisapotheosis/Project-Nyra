from typing import Dict, Any
import httpx
def pipe(user_message: str, dify_base: str, dify_api_key: str) -> Dict[str, Any]:
    headers = {"Authorization": f"Bearer {dify_api_key}", "Content-Type":"application/json"}
    body = {"model": "dify", "messages":[{"role":"user","content":user_message}]}
    r = httpx.post(f"{dify_base.rstrip('/')}/v1/chat/completions", json=body, headers=headers, timeout=60)
    r.raise_for_status()
    data = r.json()
    try:
        text = data["choices"][0]["message"]["content"]
    except Exception:
        text = str(data)
    return {"text": text}
