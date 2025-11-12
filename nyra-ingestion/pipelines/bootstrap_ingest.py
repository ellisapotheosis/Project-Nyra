#!/usr/bin/env python3
import os, zipfile, shutil, json, hashlib, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
INPUT = Path(os.getenv('INGEST_INPUT', ROOT / 'ingest_input'))
WORK  = Path(os.getenv('INGEST_WORK', ROOT / 'ingest_work'))
OUT   = Path(os.getenv('INGEST_OUTPUT', ROOT / 'ingest_output'))
CACHE = Path(os.getenv('INGEST_CACHE', ROOT / 'nyra-ingestion/.cache'))
for p in [INPUT, WORK, OUT, CACHE]: p.mkdir(parents=True, exist_ok=True)

# Simple file signature for de-dup
def fhash(path):
    h = hashlib.sha256()
    with open(path, 'rb') as fh:
        for chunk in iter(lambda: fh.read(1<<20), b''): h.update(chunk)
    return h.hexdigest()

def is_text(name):
    return any(name.lower().endswith(ext) for ext in ['.md','.txt','.json','.yaml','.yml','.toml','.ini','.cfg','.py','.ps1','.sh','.bat','.ts','.js','.tsx','.jsx'])

# 1) explode zips into WORK/zips/<folder>
for item in INPUT.glob('**/*'):
    if item.is_file() and item.suffix.lower() == '.zip':
        target = WORK / 'zips' / item.stem
        if not target.exists():
            target.mkdir(parents=True, exist_ok=True)
            with zipfile.ZipFile(item, 'r') as z: z.extractall(target)

# 2) unify sources: WORK/unified contains all raw files (unzipped + direct folders)
UNIFIED = WORK / 'unified'
UNIFIED.mkdir(parents=True, exist_ok=True)

# copy unzipped content
for src in (WORK / 'zips').glob('**/*'):
    if src.is_file():
        rel = src.relative_to(WORK / 'zips')
        dst = UNIFIED / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        if not dst.exists(): shutil.copy2(src, dst)

# copy direct non-zip folders/files from INPUT
for src in INPUT.glob('**/*'):
    if src.is_file() and src.suffix.lower() != '.zip':
        rel = src.relative_to(INPUT)
        dst = UNIFIED / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        if not dst.exists(): shutil.copy2(src, dst)

# 3) inventory + de-dup (content hash)
seen = {}
records = []
for f in UNIFIED.glob('**/*'):
    if not f.is_file(): continue
    try:
        h = fhash(f)
        dup = h in seen
        if not dup: seen[h] = str(f)
        rec = {"path": str(f), "hash": h, "duplicate_of": seen[h] if dup else None, "size": f.stat().st_size}
        if is_text(f.name):
            try:
                with open(f, 'r', encoding='utf-8', errors='ignore') as fh:
                    head = fh.read(4000)
                rec.update({"sample": head})
            except Exception as e:
                rec.update({"sample_error": str(e)})
        records.append(rec)
    except Exception as e:
        records.append({"path": str(f), "error": str(e)})

OUT.mkdir(parents=True, exist_ok=True)
with open(OUT / 'inventory.json', 'w', encoding='utf-8') as out:
    json.dump(records, out, indent=2)

# 4) lightweight cleaners: normalize README-like docs to markdown and extract steps
CLEAN = OUT / 'clean'
CLEAN.mkdir(parents=True, exist_ok=True)

STEP_RX = re.compile(r'^(?:\d+\.|-\s|\*\s)\s*(.+)$')

cleaned = []
for r in records:
    p = Path(r.get('path',''))
    if not p.is_file() or not is_text(p.name) or r.get('duplicate_of'):
        continue
    try:
        with open(p, 'r', encoding='utf-8', errors='ignore') as fh: txt = fh.read()
        # crude normalization
        lines = [ln.strip('') for ln in txt.splitlines()]
        steps = [STEP_RX.match(ln).group(1) for ln in lines if STEP_RX.match(ln)]
        out_obj = {
            'source': str(p),
            'hash': r['hash'],
            'lines': len(lines),
            'step_hints': steps[:50]
        }
        with open(CLEAN / (r['hash'] + '.json'), 'w', encoding='utf-8') as fh:
            json.dump(out_obj, fh, indent=2)
        cleaned.append(out_obj)
    except Exception as e:
        pass

with open(OUT / 'clean_index.json', 'w', encoding='utf-8') as fh:
    json.dump(cleaned, fh, indent=2)

print(f'Inventory: {len(records)} files. Cleaned: {len(cleaned)} docs. Output -> {OUT}')
