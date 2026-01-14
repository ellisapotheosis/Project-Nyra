#!/usr/bin/env python3
"""Extract formulas from an Excel workbook into JSON for porting to code.

Usage:
  python tools/extract_excel_formulas.py \
    --workbook "assets/uploads/Broker Flow - Ellis Anderson.xlsm" \
    --sheets "AM CALC - 3" "C - O" \
    --out "artifacts/formulas.json"

Notes:
- This is a *porting helper*, not a production runtime.
- It captures formula cells and the raw formula strings; you still need to map Excel functions to Python.
"""

import argparse, json
from pathlib import Path
import openpyxl

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--workbook", required=True)
    ap.add_argument("--sheets", nargs="+", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    wb = openpyxl.load_workbook(args.workbook, data_only=False)
    data = {"workbook": args.workbook, "sheets": {}}

    for sheet in args.sheets:
        ws = wb[sheet]
        formulas = []
        for row in ws.iter_rows():
            for cell in row:
                v = cell.value
                if isinstance(v, str) and v.startswith("="):
                    formulas.append({"cell": cell.coordinate, "formula": v})
        data["sheets"][sheet] = {"formula_cells": len(formulas), "formulas": formulas}

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(data, indent=2), encoding="utf-8")
    print(f"Wrote {out} ({out.stat().st_size} bytes)")

if __name__ == "__main__":
    main()
