# Excel Compatibility Notes

Your uploaded spreadsheet (`All in One Calculator.xls`) has rich finance logic.

In production, you have two approaches:

1) **Native port (recommended):** what this service is doing now (direct mortgage math).
2) **Spreadsheet evaluation engine (fallback):** load XLSX and evaluate formulas.

The fallback can be brittle because:
- Excel functions differ between engines.
- `.xls -> .xlsx` conversion can change formulas.

So: keep this service as the canonical quote logic; treat the spreadsheet as a reference artifact.
