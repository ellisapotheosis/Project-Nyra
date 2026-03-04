#!/usr/bin/env python3
from pathlib import Path
import re
from collections import defaultdict

ROOT = Path(__file__).resolve().parents[1]
SCAN_DIRS = ["apps", "services", "infra", "packages"]

pattern_var = re.compile(r"\$\{([A-Z][A-Z0-9_]+)")
pattern_env = re.compile(r"\bprocess\.env\.([A-Z][A-Z0-9_]+)\b|\bos\.environ(?:\.get)?\(['\"]([A-Z][A-Z0-9_]+)['\"]")
pattern_assign = re.compile(r"^([A-Z][A-Z0-9_]+)=", re.M)

usage = defaultdict(set)
example_defs = set()

for rel in SCAN_DIRS:
    base = ROOT / rel
    if not base.exists():
        continue
    for f in base.rglob('*'):
        if not f.is_file():
            continue
        if any(part in {'node_modules','.git','dist','build','.next','.turbo','coverage','venv','.venv'} for part in f.parts):
            continue
        if f.suffix.lower() not in {'.yml','.yaml','.env','.example','.ts','.tsx','.js','.mjs','.cjs','.py','.toml','.md','.json','.sh'} and '.env' not in f.name:
            continue
        try:
            txt = f.read_text(errors='ignore')
        except Exception:
            continue
        for k in pattern_var.findall(txt):
            usage[k].add(str(f.relative_to(ROOT)))
        for m in pattern_env.findall(txt):
            for k in m:
                if k:
                    usage[k].add(str(f.relative_to(ROOT)))
        if '.env.example' in f.name or f == ROOT / 'infra/.env.example' or f.name == '.env.example':
            for k in pattern_assign.findall(txt):
                example_defs.add(k)

inventory = ROOT / 'docs/env/ENV_INVENTORY.md'
missing = ROOT / 'docs/env/MISSING_ENV.md'
inventory.parent.mkdir(parents=True, exist_ok=True)

with inventory.open('w') as out:
    out.write('# ENV Inventory\n\n')
    out.write(f'Total discovered keys: **{len(usage)}**\n\n')
    for key in sorted(usage):
        out.write(f'## `{key}`\n')
        for src in sorted(usage[key])[:20]:
            out.write(f'- `{src}`\n')
        if len(usage[key]) > 20:
            out.write(f'- ... {len(usage[key]) - 20} more\n')
        out.write('\n')

missing_keys = sorted(k for k in usage if k not in example_defs)
with missing.open('w') as out:
    out.write('# Missing ENV Keys\n\n')
    out.write('Referenced in code/compose but not found in current `.env.example` templates scanned.\n\n')
    out.write(f'Total missing keys: **{len(missing_keys)}**\n\n')
    for k in missing_keys:
        out.write(f'- `{k}`\n')

print(f'Wrote {inventory} and {missing}')
