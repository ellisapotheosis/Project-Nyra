import os
import glob
import json
from pathlib import Path

INPUT = Path(os.getenv('INGEST_INPUT', 'input'))
OUTPUT = Path(os.getenv('INGEST_OUTPUT', 'output'))
OUTPUT.mkdir(parents=True, exist_ok=True)

records = []
for f in glob.glob(str(INPUT / '**' / '*.*'), recursive=True):
    try:
        with open(f, 'r', encoding='utf-8', errors='ignore') as fh:
            text = fh.read()
        records.append({"path": f, "chars": len(text)})
    except Exception as e:
        records.append({"path": f, "error": str(e)})

with open(OUTPUT / 'scan.json', 'w', encoding='utf-8') as out:
    json.dump(records, out, indent=2)

print(f'Wrote {len(records)} records to {OUTPUT / "scan.json"}')
