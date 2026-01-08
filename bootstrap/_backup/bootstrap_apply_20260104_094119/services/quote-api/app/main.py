from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .models import QuoteRequest, QuoteResponse, CompareRequest, CompareResponse
from .calc import amortization

app = FastAPI(title="Nyra Quote API", version="0.1.0")

# If you embed this into your Next.js UI, enable broad CORS in dev.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/quote", response_model=QuoteResponse)
def quote(req: QuoteRequest):
    summary, rows = amortization(req)
    return QuoteResponse(
        inputs=req,
        summary=summary,
        schedule=rows if req.include_schedule else None,
    )


@app.post("/quote/compare", response_model=CompareResponse)
def compare(req: CompareRequest):
    results = []
    for scenario in req.scenarios:
        summary, rows = amortization(scenario)
        results.append(
            QuoteResponse(
                inputs=scenario,
                summary=summary,
                schedule=rows if scenario.include_schedule else None,
            )
        )
    return CompareResponse(results=results)
