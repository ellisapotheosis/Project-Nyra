import os, sys, json, glob
from pathlib import Path
from typing import List
import yaml

ROOT = Path(__file__).resolve().parents[2]
PIPELINE_PATH = ROOT / 'ingestion' / 'pipelines' / 'default.pipeline.yml'
CONFIG_DIR = ROOT / 'ingestion' / 'config' / 'storage'
CLEANERS = ROOT / 'ingestion' / 'cleaners'

sys.path.append(str(CLEANERS))
from __init__ import normalize_whitespace  # noqa

try:
    import tiktoken  # optional for token-aware chunking
except Exception:
    tiktoken = None

def load_files(base: Path, include: List[str]) -> List[Path]:
    files = []
    for pattern in include:
        files.extend(base.glob(pattern))
    return [f for f in files if f.is_file()]

def chunk_text(text: str, size=1200, overlap=180):
    chunks = []
    i = 0
    while i < len(text):
        chunk = text[i:i+size]
        chunks.append(chunk)
        i += max(1, size - overlap)
    return chunks

def embed_chunks(chunks: List[str]):
    # Minimal stub: write chunks to disk.
    # Replace with actual embedding provider call using OPENAI_API_KEY or others.
    return [{'id': i, 'text': c} for i, c in enumerate(chunks)]

def upsert_qdrant(items):
    out = ROOT / 'ingestion' / 'out' / 'qdrant.jsonl'
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open('w', encoding='utf-8') as f:
        for it in items:
            f.write(json.dumps(it, ensure_ascii=False) + '
')

if __name__ == '__main__':
    profile = os.getenv('NYRA_INGEST_PROFILE','default')
    target = os.getenv('NYRA_INGEST_TARGET','qdrant')
    input_dir = Path(os.getenv('NYRA_INGEST_INPUT','./docs')).resolve()

    with open(PIPELINE_PATH, 'r', encoding='utf-8') as f:
        pipeline = yaml.safe_load(f)

    include = ['**/*.md', '**/*.txt']
    for step in pipeline.get('steps', []):
        if step['type'] == 'load_files':
            include = step.get('options',{}).get('include', include)

    files = load_files(input_dir, include)
    texts = []
    for fp in files:
        try:
            txt = fp.read_text(encoding='utf-8', errors='ignore')
        except Exception:
            continue
        texts.append(normalize_whitespace(txt))

    all_chunks = []
    for t in texts:
        all_chunks.extend(chunk_text(t))

    embedded = embed_chunks(all_chunks)
    if target == 'qdrant':
        upsert_qdrant(embedded)
    print(f'Processed {len(files)} files → {len(all_chunks)} chunks → target {target}.')
