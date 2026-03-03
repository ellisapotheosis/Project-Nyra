from fastapi import FastAPI

app = FastAPI(title="nyra-model-mcp")


@app.get("/health")
def health():
    return {"status": "ok", "service": "nyra-model-mcp"}


@app.post("/mcp")
def mcp_proxy(payload: dict):
    return {"ok": True, "received": payload}
