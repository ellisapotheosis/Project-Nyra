"""Extract defined names (named ranges / named formulas) from an .xlsx.

This helps you map the old spreadsheet model into a durable API contract.

Usage:
  python tools/extract_excel_defined_names.py /path/to/All\ in\ One\ Calculator.xlsx > defined_names.json
"""

import json
import sys
from openpyxl import load_workbook


def main(path: str):
    wb = load_workbook(path, data_only=False)
    out = {}
    for name in wb.defined_names.keys():
        dn = wb.defined_names[name]
        out[name] = {
            "attr_text": dn.attr_text,
        }
        try:
            out[name]["destinations"] = list(dn.destinations)
        except Exception:
            out[name]["destinations"] = []
    print(json.dumps({"workbook": path, "defined_names": out}, indent=2))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("usage: extract_excel_defined_names.py workbook.xlsx")
    main(sys.argv[1])
