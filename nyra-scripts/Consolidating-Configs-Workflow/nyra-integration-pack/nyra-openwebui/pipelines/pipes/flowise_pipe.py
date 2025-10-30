from typing import Dict, Any
import httpx
def pipe(user_message: str, flowise_url: str, api_key: str='') -> Dict[str, Any]:
    headers = {"Authorization": f"Bearer {api_key}"} if api_key else {}
    r = httpx.post(f"{flowise_url}/api/v1/prediction", json={"question": user_message}, headers=headers, timeout=60)
    r.raise_for_status()
    data = r.json()
    return {"text": data.get("text") or str(data)}
