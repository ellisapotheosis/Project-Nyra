from fastmcp import FastMCP, resource, tool
import json, os, re
from pathlib import Path

mcp = FastMCP("nyra-memory")
NODES_PATH = Path(os.getenv("NYRA_NODES_PATH","ingest/outputs/nodes.jsonl"))

@resource("nodes_jsonl")
def nodes_jsonl():
    return NODES_PATH.read_text(encoding="utf-8") if NODES_PATH.exists() else ""

@tool
def search_nodes(q:str, limit:int=20) -> list[dict]:
    if not NODES_PATH.exists(): return []
    rx = re.compile(re.escape(q), re.IGNORECASE)
    out = []
    with open(NODES_PATH, "r", encoding="utf-8") as f:
        for line in f:
            if len(out)>=limit: break
            try: row = json.loads(line)
            except: continue
            text = row.get("text","")
            if rx.search(text):
                md = row.get("metadata",{})
                out.append({
                    "id": row.get("id"),
                    "chunk_id": md.get("chunk_id"),
                    "source_path": md.get("source_path"),
                    "page_number": md.get("page_number"),
                    "section": md.get("section"),
                    "tags": md.get("tags"),
                    "snippet": text[:400]
                })
    return out

if __name__ == "__main__":
    mcp.run()
