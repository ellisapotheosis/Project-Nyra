from typing import Any, Dict, List, Optional

class OpenMemoryClient:
    def __init__(self, endpoint: str = "http://localhost:8765", api_key: Optional[str] = None):
        self.endpoint = endpoint
        self.api_key = api_key

    def add_memory(self, text: str, embedding: Optional[List[float]] = None, metadata: Optional[Dict[str, Any]] = None):
        # TODO: implement MCP SSE or REST call per OpenMemory docs
        return {"status": "queued", "text": text, "metadata": metadata or {}}

    def search(self, query: str, top_k: int = 5):
        # TODO: implement
        return []
