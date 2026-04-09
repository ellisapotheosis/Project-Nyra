from fastapi import FastAPI
app = FastAPI(title="Graphiti MCP Adapter Placeholder")

@app.get("/health")
def health():
    return {"ok": True, "service": "graphiti-mcp", "note": "Replace this adapter with a pinned Graphiti MCP/server image"}

@app.get("/sse")
def sse_placeholder():
    return {"ok": True, "note": "Placeholder endpoint. Pin actual Graphiti MCP server and keep this service name/port."}
