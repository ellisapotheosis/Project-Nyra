#!/usr/bin/env python3
from __future__ import annotations

import sys
from pathlib import Path
import yaml

FORBIDDEN = ["flowise", "gohighlevel", "mcproxy", "metamcp", "archgw", "plano"]

REQUIRED_FILES = [
    "docs/decisions/STACK_DECISIONS.md",
    "prompts/claude-flow/NYRA_MASTER_SWARM.md",
    "prompts/compliance/logistics_guardrail.md",
    "infra/docker-compose.dev.yml",
    "infra/nexus/nexus.yaml",
    "services/quote-api/app/main.py",
    "apps/nyra-admin/app/chat/page.tsx",
]

def fail(msg: str) -> None:
    print(f"[verify] FAIL: {msg}")
    sys.exit(2)

def ok(msg: str) -> None:
    print(f"[verify] OK: {msg}")

def warn(msg: str) -> None:
    print(f"[verify] WARN: {msg}")

def check_required(repo: Path) -> None:
    missing=[]
    empty=[]
    for rel in REQUIRED_FILES:
        p=repo/rel
        if not p.exists():
            missing.append(rel)
        elif p.is_file() and p.stat().st_size == 0:
            empty.append(rel)
    if missing:
        fail("Missing required files:\n- " + "\n- ".join(missing))
    if empty:
        fail("Empty required files:\n- " + "\n- ".join(empty))
    ok("Required files exist and are non-empty")

def check_compose(repo: Path) -> None:
    p=repo/"infra/docker-compose.dev.yml"
    try:
        data=yaml.safe_load(p.read_text(encoding="utf-8"))
        if "services" not in data:
            fail("docker-compose.dev.yml missing 'services'")
        ok("docker-compose.dev.yml parses as YAML")
    except Exception as e:
        fail(f"docker-compose.dev.yml YAML parse error: {e}")

def scan_forbidden(repo: Path) -> None:
    allowed_prefixes = [str(repo/"docs/_deprecated"), str(repo/"bootstrap/_legacy")]
    hits=[]
    for path in repo.rglob("*"):
        if not path.is_file():
            continue
        if any(str(path).startswith(p) for p in allowed_prefixes):
            continue
        if path.suffix.lower() not in [".md",".txt",".yml",".yaml",".json",".toml",".ps1",".sh",".py",".ts",".tsx",".js",".env",".example"]:
            continue
        try:
            text=path.read_text(encoding="utf-8", errors="ignore").lower()
        except Exception:
            continue
        for term in FORBIDDEN:
            if term in text:
                hits.append(str(path.relative_to(repo)))
                break
    if hits:
        warn("Forbidden strings found in these files (move intentional legacy notes under docs/_deprecated/):")
        for h in hits[:200]:
            print(" -", h)
        fail("Forbidden-string scan failed")
    ok("No forbidden strings found (outside allowed legacy dirs)")

def main():
    repo = Path(__file__).resolve().parent.parent
    check_required(repo)
    check_compose(repo)
    scan_forbidden(repo)
    ok("All checks passed.")

if __name__ == "__main__":
    main()
