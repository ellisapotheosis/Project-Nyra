import os
from typing import Optional
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

_client: Optional[Client] = None

def get_client() -> Client:
    global _client
    if _client is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise RuntimeError("SUPABASE_URL / SUPABASE_KEY not configured")
        _client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _client


def save_chat(session_id: str, role: str, content: str):
    sb = get_client()
    return sb.table("nyra_chats").insert({
        "session_id": session_id,
        "role": role,
        "content": content
    }).execute()
