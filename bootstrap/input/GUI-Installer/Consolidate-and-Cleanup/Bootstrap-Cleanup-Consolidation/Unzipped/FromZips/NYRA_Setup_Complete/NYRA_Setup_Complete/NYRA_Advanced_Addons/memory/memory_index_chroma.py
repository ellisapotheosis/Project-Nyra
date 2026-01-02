import os, json
from pathlib import Path
from chromadb import Client
from chromadb.config import Settings

CLEANED = Path("memory/cleaned")
INDEX_DIR = Path("memory/chroma")
INDEX_DIR.mkdir(parents=True, exist_ok=True)

client = Client(Settings(chroma_db_impl="duckdb+parquet", persist_directory=str(INDEX_DIR)))
col = client.get_or_create_collection("nyra_memory")

def load_jsonl(fp: Path):
    with fp.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line: continue
            yield json.loads(line)

def main():
    ids, docs, metas = [], [], []
    for fp in CLEANED.glob("*.jsonl"):
        for rec in load_jsonl(fp):
            rid = f"{fp.stem}-{rec['chunk']}"
            ids.append(rid)
            docs.append(rec["text"])
            metas.append({"source": fp.name, "chunk": rec["chunk"]})
    if not ids:
        print("No cleaned chunks found. Run claude_cleanup.py first.")
        return
    # reset collection
    try:
        client.delete_collection("nyra_memory")
    except Exception:
        pass
    col = client.get_or_create_collection("nyra_memory")
    col.add(ids=ids, documents=docs, metadatas=metas)
    client.persist()
    print(f"✅ Indexed {len(ids)} chunks into {INDEX_DIR.resolve()}")

if __name__ == "__main__":
    main()
