#!/usr/bin/env python3
"""
Nyra Power Management API — HTTP endpoints for LLM tool calling.
Lets bitnet.cpp (CPU LLM on orchestrator) wake/sleep GPU workers autonomously.
Start: uvicorn power-api:app --port 8765
"""
import asyncio
from pathlib import Path
from fastapi import FastAPI, HTTPException
import uvicorn

SCRIPT_DIR = Path(__file__).parent
WORKERS = ["worker-rtx5090", "worker-rtx3090ti", "worker-rtx3060"]

app = FastAPI(
    title="Nyra Power Management API",
    version="1.0.0",
)


def _validate_worker(worker: str):
    if worker not in WORKERS and worker != "all":
        raise HTTPException(
            status_code=400,
            detail=f"Unknown worker '{worker}'. Valid: {WORKERS + ['all']}"
        )


async def _run_script(script_name: str, args: list[str]) -> dict:
    # Uses create_subprocess_exec (no shell=True) — args list prevents injection
    script_path = str(SCRIPT_DIR / script_name)
    proc = await asyncio.create_subprocess_exec(
        "bash", script_path, *args,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=150)
    return {
        "success": proc.returncode == 0,
        "output": stdout.decode().strip(),
        "error": stderr.decode().strip() or None,
    }


@app.get("/health")
async def health():
    return {"status": "ok", "service": "nyra-power-api"}


@app.get("/status")
async def cluster_status():
    """Check online/offline status of all GPU workers."""
    result = await _run_script("cluster-power-status.sh", [])
    workers = {}
    for line in result["output"].splitlines():
        line = line.strip()
        for state in ("ONLINE", "OFFLINE", "BOOTING"):
            if line.startswith(state):
                parts = line.split()
                if len(parts) >= 2:
                    workers[parts[1]] = state.lower()
    return {"workers": workers, "raw": result["output"]}


@app.post("/wake/{worker}")
async def wake_worker(worker: str):
    """
    Send a Wake-on-LAN magic packet to bring a GPU worker online.
    Call this when additional GPU compute is needed.
    worker: worker-rtx5090 | worker-rtx3090ti | worker-rtx3060 | all
    """
    _validate_worker(worker)
    result = await _run_script("wake-worker.sh", [worker])
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"] or result["output"])
    return {"worker": worker, "action": "wake", "result": result["output"]}


@app.post("/sleep/{worker}")
async def sleep_worker(worker: str, force: bool = False):
    """
    Gracefully shut down a GPU worker to save power.
    Call this when a worker has been idle and compute is no longer needed.
    worker: worker-rtx5090 | worker-rtx3090ti | worker-rtx3060 | all
    """
    _validate_worker(worker)
    args = [worker, "--force"] if force else [worker]
    result = await _run_script("sleep-worker.sh", args)
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"] or result["output"])
    return {"worker": worker, "action": "sleep", "force": force, "result": result["output"]}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8765, log_level="info")
