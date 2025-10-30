from fastapi import FastAPI
from fastapi.responses import JSONResponse
from sse_starlette.sse import EventSourceResponse
import asyncio, json, time

app = FastAPI(title="Nyra A2A Server")

AGENT_CARD = {
    "version": "0.3.0",
    "name": "nyra.a2a.gateway",
    "description": "Nyra agent facade using A2A: message, streaming, and simple tool delegation.",
    "skills": [{"name":"chat","description":"general chat","contentTypes":["text/plain"]}],
    "endpoints": {"taskSendSubscribe": "/a2a/tasks/sendSubscribe", "message": "/a2a/message"},
    "auth": {"scheme":"none"}
}

@app.get("/.well-known/agent-card.json")
async def card():
    return JSONResponse(AGENT_CARD)

@app.post("/a2a/message")
async def msg():
    return {"ok": True, "reply": "nyra-gateway: hello"}

@app.post("/a2a/tasks/sendSubscribe")
async def send_subscribe():
    async def gen():
        for i in range(3):
            yield {"event":"progress","data":json.dumps({"step":i+1})}
            await asyncio.sleep(0.5)
        yield {"event":"artifact","data":json.dumps({"mime":"text/plain","text":"nyra demo complete"}),"id":str(time.time())}
    return EventSourceResponse(gen())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=10003)
