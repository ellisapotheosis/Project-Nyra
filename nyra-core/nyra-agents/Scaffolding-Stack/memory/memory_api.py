import chromadb, pathlib
from chromadb.config import Settings

ROOT = pathlib.Path(__file__).resolve().parents[1]
PERSIST = ROOT / "memory" / "chroma"
PERSIST.mkdir(parents=True, exist_ok=True)

_client = chromadb.PersistentClient(path=str(PERSIST), settings=Settings(allow_reset=True))

def collection(name="nyra-notes"):
    try: return _client.get_collection(name)
    except Exception: return _client.create_collection(name)

def add_note(text: str, metadata: dict | None = None):
    col = collection()
    existing = col.get()
    next_id = len(existing.get('ids', [])) + 1
    _id = f"id-{next_id}"
    col.add(documents=[text], metadatas=[metadata or {}], ids=[_id])
    return _id

def query(q: str, n=5):
    col = collection()
    return col.query(query_texts=[q], n_results=n)

if __name__ == "__main__":
    print(add_note("Hello memory", {"tag":"seed"}))
    print(query("Hello"))
