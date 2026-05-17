# Quote formula porting report (from Broker Flow - Ellis Anderson.xlsm)

This report helps migrate spreadsheet logic into `services/quote-api`.

- Workbook sheets: 24
- Total formula cells detected: 11582

## Top formula-heavy sheets

- **AM CALC - 3** — 7348 formula cells
- **C-Corporation** — 920 formula cells
- **Partnership LLC** — 720 formula cells
- **S-Corporation** — 680 formula cells
- **Marketing** — 430 formula cells
- **REO - Rent** — 315 formula cells
- ** Sole Proprietorship** — 228 formula cells
- **2nd** — 183 formula cells
- **Bonus** — 147 formula cells
- **C - O** — 144 formula cells
- **Non-Self Employed** — 133 formula cells
- **NEW LEAD** — 125 formula cells

## Sample formulas (first 3 sheets)

### AM CALC - 3
- D8: `=+C19`
- K8: `=+J19`
- R8: `=+Q19`
- C11: `=SUM(C19:C30)`
- D11: `=SUM(D19:D30)`
- E11: `=SUM(E19:E30)`

### C-Corporation
- J2: `='[3]Reference Sheet'!$B$2`
- AA3: `=IF(OR(H8=0, H8>100%), "Shareholder %", G12*H8)`
- AA4: `=IF(OR(J8>100%, J8=0), "Shareholder %", I12*J8)`
- AA6: `=IF(OR(H8=0, H8>100%),"Enter Shareholder %",$J$40)`
- AA7: `=IF(OR(J8=0, J8>100%),"Enter Shareholder %",$J$41)`
- AA8: `=SUM(H12:H28)`

### Partnership LLC
- J2: `='[3]Reference Sheet'!$B$2`
- AC4: `=IF(AND(J9=0, J13=0, J15=0, J24=0, J25=0, J26=0, J28=0, J30=0, J31=0, I32=0), 0, 1)`
- AC5: `=IF(AND(G32<=I32, I32<>0), 0, 1)`
- AC6: `=IF(AND(AC5=0, AC4=1), 0, 1)`
- AC8: `=G32/12`
- AC9: `=(G32+I32)/24`

## Porting plan (recommended)

1) **Decide inputs + outputs** for Quote API:
   - Inputs: credit score, property value, loan amount, purpose, occupancy, state, income/DTI variables, asset variables.
   - Outputs: program options, rate/APR/points/payment, max qualifying, cash-to-close, flags.

2) **Extract a minimal calculation subset first**:
   - Start with the “core scenario” calculations and a small set of programs.
   - Keep self-employed income sheets (C-Corp / S-Corp / etc.) as a separate module.

3) **Build a formula extraction JSON**:
   - Dump cells with formulas + dependencies for selected sheets.
   - Hand-pick the *output cells* you care about (e.g., payment, DTI, LTV, qualifying).
   - Convert spreadsheet functions to Python equivalents.

4) **Implement unit tests**:
   - Choose 20-50 historical scenarios.
   - Run spreadsheet -> capture outputs -> assert FastAPI outputs match within tolerances.

5) **Audit & explainability**:
   - For each quote response, include `calculation_trace` (optional in v1) with key intermediate values.

## Included tools
- `tools/extract_excel_formulas.py` dumps formulas to JSON for selected sheets (dev-only).
