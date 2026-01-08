#!/usr/bin/env python3
from __future__ import annotations

import shutil
import sys
from datetime import datetime
from pathlib import Path
from typing import List, Tuple

FORBIDDEN = ["flowise", "gohighlevel", "mcproxy", "metamcp", "archgw", "plano"]

def stamp() -> str:
    return datetime.now().strftime("%Y%m%d_%H%M%S")

def mkdir(p: Path) -> None:
    p.mkdir(parents=True, exist_ok=True)

def backup_existing(dest: Path, backup_root: Path, repo_root: Path) -> None:
    if not dest.exists():
        return
    rel = dest.relative_to(repo_root)
    b = backup_root / rel
    mkdir(b.parent)
    if dest.is_dir():
        if b.exists():
            shutil.rmtree(b)
        shutil.copytree(dest, b)
    else:
        shutil.copy2(dest, b)

def copy_merge(src: Path, dest: Path, backup_root: Path, repo_root: Path) -> None:
    if src.is_dir():
        mkdir(dest)
        for child in src.iterdir():
            copy_merge(child, dest / child.name, backup_root, repo_root)
    else:
        if dest.exists():
            backup_existing(dest, backup_root, repo_root)
        mkdir(dest.parent)
        shutil.copy2(src, dest)

def move_root_markdowns(repo_root: Path, docs_root: Path, backup_root: Path) -> List[Tuple[str,str]]:
    moved=[]
    archive = docs_root / "_root_md_archive"
    mkdir(archive)
    for p in repo_root.glob("*.md"):
        if p.name.lower() in ["readme.md", "claude.md"]:
            continue
        backup_existing(p, backup_root, repo_root)
        target = archive / p.name
        if target.exists():
            target = archive / f"{p.stem}_{stamp()}{p.suffix}"
        shutil.move(str(p), str(target))
        moved.append((p.name, str(target.relative_to(repo_root))))
    return moved

def scan_forbidden(repo_root: Path) -> List[Tuple[str,int,str]]:
    hits=[]
    allowed_prefixes = [str(repo_root/"docs/_deprecated"), str(repo_root/"bootstrap/_legacy")]
    for path in repo_root.rglob("*"):
        if not path.is_file():
            continue
        if any(str(path).startswith(p) for p in allowed_prefixes):
            continue
        if path.suffix.lower() not in [".md",".txt",".yml",".yaml",".json",".toml",".ps1",".sh",".py",".ts",".tsx",".js",".env",".example"]:
            continue
        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        lower = text.lower()
        for term in FORBIDDEN:
            idx = lower.find(term)
            if idx != -1:
                line = text[:idx].count("\n") + 1
                snippet = text.splitlines()[line-1][:200] if text.splitlines() else ""
                hits.append((str(path.relative_to(repo_root)), line, snippet))
                break
    return hits

def write_report(repo_root: Path, moved, forbidden) -> Path:
    reports = repo_root / "docs" / "reports"
    mkdir(reports)
    report = reports / "bootstrap_apply_report.md"
    lines=[]
    lines.append("# Bootstrap Apply Report")
    lines.append("")
    lines.append(f"- Timestamp: {datetime.now().isoformat()}")
    lines.append("")
    lines.append("## Root markdown consolidation")
    if moved:
        for a,b in moved:
            lines.append(f"- Moved `{a}` → `{b}`")
    else:
        lines.append("- No root markdown files moved.")
    lines.append("")
    lines.append("## Forbidden stack string scan")
    if forbidden:
        lines.append("The following files still reference removed systems. Move/update them or place intentional legacy notes under `docs/_deprecated/`.")
        lines.append("")
        for fp, ln, snip in forbidden[:200]:
            lines.append(f"- `{fp}`:{ln} — {snip}")
    else:
        lines.append("- ✅ No forbidden strings found (outside allowed legacy dirs).")
    report.write_text("\n".join(lines), encoding="utf-8")
    return report

def main():
    script_dir = Path(__file__).resolve().parent
    repo_root = script_dir.parent
    payload = script_dir / "nyra_payload"

    if not payload.exists():
        print(f"[nyra_apply] ERROR: payload not found at {payload}")
        sys.exit(2)

    backup_root = repo_root / "_backup" / f"bootstrap_apply_{stamp()}"
    mkdir(backup_root)

    for item in payload.iterdir():
        copy_merge(item, repo_root / item.name, backup_root, repo_root)

    moved = move_root_markdowns(repo_root, repo_root / "docs", backup_root)

    # bootstrap legacy cleanup
    legacy = repo_root / "bootstrap" / "_legacy"
    mkdir(legacy)
    keep = {p.name for p in script_dir.iterdir()}
    for p in (repo_root/"bootstrap").iterdir():
        if p.name in keep or p.name == "_legacy":
            continue
        target = legacy / p.name
        if target.exists():
            target = legacy / f"{p.stem}_{stamp()}{p.suffix}"
        shutil.move(str(p), str(target))

    forbidden = scan_forbidden(repo_root)
    report = write_report(repo_root, moved, forbidden)

    print(f"[nyra_apply] Done. Backup: {backup_root}")
    print(f"[nyra_apply] Report: {report.relative_to(repo_root)}")

if __name__ == "__main__":
    main()
