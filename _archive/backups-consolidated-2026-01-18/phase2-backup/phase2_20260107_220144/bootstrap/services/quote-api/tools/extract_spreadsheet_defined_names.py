"""Extract defined names (named ranges + named formulas) from a spreadsheet.

This is a bridge tool for your eventual *true formula port*.

Usage:
  python tools/extract_spreadsheet_defined_names.py \
    --xlsx "/path/to/All in One Calculator.xlsx" \
    --out  "/path/to/defined_names.json"

If you only have `.xls`, convert it first:
  soffice --headless --convert-to xlsx --outdir . "All in One Calculator.xls"
"""

from __future__ import annotations

import argparse
import json
from openpyxl import load_workbook


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--xlsx", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    wb = load_workbook(args.xlsx, data_only=False)
    out = {}

    for key in wb.defined_names.keys():
        dn = wb.defined_names[key]
        out[key] = {
            "type": "range" if "!" in (dn.attr_text or "") else "formula_or_literal",
            "attr_text": dn.attr_text,
        }

    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2)

    print(f"Wrote {len(out)} defined names to {args.out}")


if __name__ == "__main__":
    main()
