#!/usr/bin/env python3
from __future__ import annotations
from pathlib import Path
import sys, hashlib

ROOT = Path(__file__).resolve().parents[1]
ignore_ext = {".pyc",".DS_Store"}
empty = []
for p in ROOT.rglob("*"):
    if p.is_dir():
        continue
    if p.suffix in ignore_ext:
        continue
    try:
        size = p.stat().st_size
    except FileNotFoundError:
        continue
    if size == 0:
        empty.append(str(p.relative_to(ROOT)))

print(f"Checked {sum(1 for _ in ROOT.rglob('*') if _.is_file())} files.")
if empty:
    print("EMPTY FILES:")
    for e in empty:
        print(" -", e)
    sys.exit(2)

# print a short manifest hash for sanity
h = hashlib.sha256()
for p in sorted([x for x in ROOT.rglob('*') if x.is_file()]):
    h.update(str(p.relative_to(ROOT)).encode())
    h.update(b"\0")
    h.update(p.read_bytes()[:1024])  # partial content hash
print("OK. manifest_partial_sha256:", h.hexdigest())
