from typing import Dict, Any
import httpx
def pipe(user_message: str, webhook_url: str) -> Dict[str, Any]:
    r = httpx.post(webhook_url, json={"message": user_message}, timeout=60)
    r.raise_for_status()
    try:
        data = r.json()
        return {"text": data.get("text") or str(data)}
    except Exception:
        return {"text": r.text}
