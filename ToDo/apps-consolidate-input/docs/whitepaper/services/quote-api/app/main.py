from fastapi import FastAPI
from .schemas import QuoteRequest, QuoteResponse

app = FastAPI(title="Nyra Quote API", version="0.1.0")

@app.get("/healthz")
def healthz():
    return {"ok": True}

@app.post("/quote", response_model=QuoteResponse)
def quote(req: QuoteRequest):
    # Implement formula engine & pricing adapters here.
    return QuoteResponse(summary="stub", options=[])

@app.post("/quote/compare", response_model=QuoteResponse)
def compare(req: QuoteRequest):
    return QuoteResponse(summary="stub-compare", options=[])
