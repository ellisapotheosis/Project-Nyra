"""
Wake-on-LAN Manager
Manages power state of GPU worker nodes in the Nyra cluster.
Supports WoL magic packets, SSH shutdown, health polling, and auto-policy.
"""

import asyncio
import logging
import os
import re
import socket
import struct
import time
from datetime import datetime, timezone
from enum import Enum
from typing import Optional

import asyncssh
import httpx
from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
logger = logging.getLogger("wol-manager")

SENSITIVE_PATTERNS = (
    re.compile(r"\bBearer\s+[A-Za-z0-9._~+/=-]+", re.IGNORECASE),
    re.compile(
        r"\b(?:api[_-]?key|token|secret|authorization|password)\b\s*[:=]\s*[\"']?[^\"',\s}]+",
        re.IGNORECASE,
    ),
)


def redact(value: str) -> str:
    text = str(value)
    for pattern in SENSITIVE_PATTERNS:
        text = pattern.sub("[REDACTED]", text)
    return text


# ---------------------------------------------------------------------------
# Configuration from environment
# ---------------------------------------------------------------------------

WORKER_3060_MAC: str = os.getenv("WORKER_3060_MAC", "")
WORKER_3090TI_MAC: str = os.getenv("WORKER_3090TI_MAC", "")
WORKER_5090_MAC: str = os.getenv("WORKER_5090_MAC", "")

SSH_CLUSTER_KEY_PATH: str = os.getenv(
    "SSH_CLUSTER_KEY_PATH", "/run/secrets/cluster_ssh_key"
)
SSH_USER: str = os.getenv("SSH_USER", "ellisapotheosis")
SSH_PORT: int = int(os.getenv("SSH_PORT", "22"))

LITELLM_URL: str = os.getenv(
    "LITELLM_URL", "http://oracle-vps.trex-fiordland.ts.net:4000"
)
QUEUE_DEPTH_THRESHOLD: int = int(os.getenv("QUEUE_DEPTH_THRESHOLD", "5"))
IDLE_TIMEOUT_MINUTES: int = int(os.getenv("IDLE_TIMEOUT_MINUTES", "30"))

# Cron-style active hours: "HH:MM-HH:MM" in 24-hour local time
WAKE_SCHEDULE: str = os.getenv("WAKE_SCHEDULE", "08:00-22:00")

POLL_INTERVAL_SECONDS: int = int(os.getenv("POLL_INTERVAL_SECONDS", "30"))
POLICY_INTERVAL_SECONDS: int = int(os.getenv("POLICY_INTERVAL_SECONDS", "60"))

# Worker Ollama/vLLM health-check ports and SSH hostnames
WORKERS: dict = {
    "worker-rtx3060": {
        "tailnet": "worker-rtx3060.trex-fiordland.ts.net",
        "tailscale_ip": "100.64.0.12",
        "ollama_port": 11434,
        "mac_env": "WORKER_3060_MAC",
        "auto_sleep": False,  # always needed for embeddings
        "mobile": False,
    },
    "worker-rtx3090ti": {
        "tailnet": "worker-rtx3090ti.trex-fiordland.ts.net",
        "tailscale_ip": "100.64.0.13",
        "ollama_port": 11434,
        "mac_env": "WORKER_3090TI_MAC",
        "auto_sleep": True,
        "mobile": False,
    },
    "worker-rtx5090": {
        "tailnet": "worker-rtx5090.trex-fiordland.ts.net",
        "tailscale_ip": "100.64.0.11",
        "ollama_port": 11434,
        "mac_env": "WORKER_5090_MAC",
        "auto_sleep": False,  # mobile — user controls manually
        "mobile": True,
    },
}


# ---------------------------------------------------------------------------
# Worker state
# ---------------------------------------------------------------------------


class WorkerStatus(str, Enum):
    ONLINE = "ONLINE"
    OFFLINE = "OFFLINE"
    SLEEPING = "SLEEPING"
    WAKING = "WAKING"


class WorkerState:
    def __init__(self, name: str):
        self.name = name
        self.status: WorkerStatus = WorkerStatus.OFFLINE
        self.last_seen: Optional[float] = None  # epoch seconds
        self.last_woken: Optional[float] = None
        self.waking_since: Optional[float] = None
        self.load: Optional[float] = None  # CPU/GPU load 0.0-1.0 if available

    def mark_online(self) -> None:
        self.status = WorkerStatus.ONLINE
        self.last_seen = time.time()
        self.waking_since = None

    def mark_offline(self) -> None:
        if self.status != WorkerStatus.WAKING:
            self.status = WorkerStatus.OFFLINE

    def mark_waking(self) -> None:
        self.status = WorkerStatus.WAKING
        self.waking_since = time.time()
        self.last_woken = time.time()

    def to_dict(self) -> dict:
        now = time.time()
        return {
            "name": self.name,
            "status": self.status.value,
            "last_seen": (
                datetime.fromtimestamp(self.last_seen, tz=timezone.utc).isoformat()
                if self.last_seen
                else None
            ),
            "last_woken": (
                datetime.fromtimestamp(self.last_woken, tz=timezone.utc).isoformat()
                if self.last_woken
                else None
            ),
            "seconds_since_seen": (
                int(now - self.last_seen) if self.last_seen else None
            ),
            "load": self.load,
            "auto_sleep": WORKERS[self.name]["auto_sleep"],
            "mobile": WORKERS[self.name]["mobile"],
        }


# Global state registry
worker_states: dict[str, WorkerState] = {
    name: WorkerState(name) for name in WORKERS
}


# ---------------------------------------------------------------------------
# Wake-on-LAN
# ---------------------------------------------------------------------------


def _parse_mac(mac: str) -> bytes:
    """Parse a MAC address string (colon or dash separated) to bytes."""
    mac_clean = re.sub(r"[:\-]", "", mac)
    if len(mac_clean) != 12:
        raise ValueError(f"Invalid MAC address: {mac!r}")
    return bytes.fromhex(mac_clean)


def send_magic_packet(mac: str, broadcast: str = "255.255.255.255", port: int = 9) -> None:
    """Send a WoL magic packet for the given MAC address."""
    mac_bytes = _parse_mac(mac)
    magic = b"\xff" * 6 + mac_bytes * 16
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
        sock.sendto(magic, (broadcast, port))
    logger.info(f"Magic packet sent to MAC {mac} via {broadcast}:{port}")


# ---------------------------------------------------------------------------
# Health polling
# ---------------------------------------------------------------------------


async def _check_ollama(host: str, port: int, timeout: float = 5.0) -> bool:
    """Return True if the Ollama/vLLM HTTP endpoint responds."""
    url = f"http://{host}:{port}/api/version"
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.get(url)
            return resp.status_code < 500
    except Exception:
        return False


async def _check_ssh(host: str, port: int = 22, timeout: float = 5.0) -> bool:
    """Return True if SSH port is reachable (TCP connect only)."""
    try:
        _, writer = await asyncio.wait_for(
            asyncio.open_connection(host, port), timeout=timeout
        )
        writer.close()
        await writer.wait_closed()
        return True
    except Exception:
        return False


async def poll_worker(name: str) -> None:
    """Poll a single worker and update its state."""
    cfg = WORKERS[name]
    host = cfg["tailnet"]
    port = cfg["ollama_port"]
    state = worker_states[name]

    ollama_ok = await _check_ollama(host, port)
    ssh_ok = await _check_ssh(host, SSH_PORT)

    if ollama_ok or ssh_ok:
        was_offline = state.status in (WorkerStatus.OFFLINE, WorkerStatus.WAKING)
        state.mark_online()
        if was_offline:
            logger.info(f"{name} is now ONLINE (ollama={ollama_ok}, ssh={ssh_ok})")
    else:
        if state.status == WorkerStatus.WAKING:
            # Check if we've been waiting too long (10 min)
            if state.waking_since and (time.time() - state.waking_since) > 600:
                logger.warning(f"{name} WAKING timeout — marking OFFLINE")
                state.status = WorkerStatus.OFFLINE
                state.waking_since = None
            # else keep WAKING status
        elif state.status == WorkerStatus.ONLINE:
            logger.info(f"{name} went OFFLINE")
            state.mark_offline()
        else:
            state.mark_offline()


async def poll_all_workers() -> None:
    """Poll all workers concurrently."""
    await asyncio.gather(*[poll_worker(name) for name in WORKERS])


# ---------------------------------------------------------------------------
# SSH shutdown
# ---------------------------------------------------------------------------


async def ssh_shutdown_worker(name: str) -> None:
    """SSH into worker and execute Windows shutdown command."""
    cfg = WORKERS[name]
    host = cfg["tailnet"]
    logger.info(f"Sending shutdown command to {name} ({host})")
    try:
        async with asyncssh.connect(
            host,
            port=SSH_PORT,
            username=SSH_USER,
            client_keys=[SSH_CLUSTER_KEY_PATH],
            known_hosts=None,  # cluster nodes trusted via Tailscale
            connect_timeout=10,
        ) as conn:
            result = await conn.run("shutdown /s /t 30", check=False)
            logger.info(
                f"Shutdown command sent to {name}: exit={result.exit_status}"
            )
            worker_states[name].status = WorkerStatus.SLEEPING
    except asyncssh.Error as exc:
        logger.error(f"SSH error on {name}: {redact(str(exc))}")
        raise
    except Exception as exc:
        logger.error(f"Unexpected error shutting down {name}: {redact(str(exc))}")
        raise


# ---------------------------------------------------------------------------
# Policy engine helpers
# ---------------------------------------------------------------------------


def _parse_schedule(schedule: str) -> tuple[int, int, int, int]:
    """Parse 'HH:MM-HH:MM' into (start_h, start_m, end_h, end_m)."""
    try:
        start_str, end_str = schedule.split("-")
        sh, sm = map(int, start_str.split(":"))
        eh, em = map(int, end_str.split(":"))
        return sh, sm, eh, em
    except Exception:
        logger.warning(f"Invalid WAKE_SCHEDULE '{schedule}', defaulting to 08:00-22:00")
        return 8, 0, 22, 0


def _in_active_hours() -> bool:
    """Return True if current local time falls within WAKE_SCHEDULE."""
    sh, sm, eh, em = _parse_schedule(WAKE_SCHEDULE)
    now = datetime.now()
    current_minutes = now.hour * 60 + now.minute
    start_minutes = sh * 60 + sm
    end_minutes = eh * 60 + em
    return start_minutes <= current_minutes < end_minutes


async def _get_litellm_queue_depth() -> Optional[int]:
    """Query LiteLLM for queue depth. Returns None if unavailable."""
    url = f"{LITELLM_URL}/queue/jobs"
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                # LiteLLM /queue/jobs returns list or dict with count
                if isinstance(data, list):
                    return len(data)
                if isinstance(data, dict):
                    return data.get("total", data.get("count", 0))
    except Exception as exc:
        logger.debug(f"LiteLLM queue check failed (non-critical): {redact(str(exc))}")
    return None


async def run_policy_engine() -> None:
    """
    Auto-policy: wake/sleep workers based on queue depth and active hours.
    Rules:
    - worker-rtx5090: never auto-slept (mobile)
    - worker-rtx3060: never auto-slept (always needed for embeddings)
    - worker-rtx3090ti: auto wake/sleep based on queue depth and active hours
    """
    queue_depth = await _get_litellm_queue_depth()
    active_hours = _in_active_hours()

    logger.debug(
        f"Policy check: queue_depth={queue_depth}, active_hours={active_hours}"
    )

    for name, cfg in WORKERS.items():
        if not cfg["auto_sleep"]:
            continue

        state = worker_states[name]
        now = time.time()
        idle_seconds = IDLE_TIMEOUT_MINUTES * 60

        # Wake conditions
        should_wake = False
        if state.status in (WorkerStatus.OFFLINE, WorkerStatus.SLEEPING):
            if queue_depth is not None and queue_depth >= QUEUE_DEPTH_THRESHOLD:
                should_wake = True
                logger.info(
                    f"Policy: waking {name} — queue depth {queue_depth} >= {QUEUE_DEPTH_THRESHOLD}"
                )
            elif active_hours:
                # Wake if within active hours and not been idle too long since last wake
                if state.last_seen is None or (now - state.last_seen) < idle_seconds:
                    should_wake = True
                    logger.info(f"Policy: waking {name} — within active hours")

        if should_wake and state.status not in (WorkerStatus.WAKING, WorkerStatus.ONLINE):
            mac = os.getenv(cfg["mac_env"], "")
            if mac:
                try:
                    send_magic_packet(mac)
                    state.mark_waking()
                except Exception as exc:
                    logger.error(f"Policy WoL failed for {name}: {redact(str(exc))}")
            else:
                logger.warning(f"Policy: cannot wake {name} — {cfg['mac_env']} not set")
            continue

        # Sleep conditions
        if cfg["auto_sleep"] and state.status == WorkerStatus.ONLINE:
            if not active_hours:
                if state.last_seen and (now - state.last_seen) > idle_seconds:
                    logger.info(
                        f"Policy: sleeping {name} — outside active hours and idle"
                    )
                    try:
                        await ssh_shutdown_worker(name)
                    except Exception as exc:
                        logger.error(
                            f"Policy sleep failed for {name}: {redact(str(exc))}"
                        )


# ---------------------------------------------------------------------------
# Background task loops
# ---------------------------------------------------------------------------


async def _poll_loop() -> None:
    while True:
        try:
            await poll_all_workers()
        except Exception as exc:
            logger.error(f"Poll loop error: {redact(str(exc))}")
        await asyncio.sleep(POLL_INTERVAL_SECONDS)


async def _policy_loop() -> None:
    # Stagger policy loop so it doesn't overlap with initial poll
    await asyncio.sleep(15)
    while True:
        try:
            await run_policy_engine()
        except Exception as exc:
            logger.error(f"Policy loop error: {redact(str(exc))}")
        await asyncio.sleep(POLICY_INTERVAL_SECONDS)


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

app = FastAPI(
    title="WoL Manager",
    description="Wake-on-LAN and power management for Nyra GPU cluster workers",
    version="1.0.0",
)


@app.on_event("startup")
async def startup_event() -> None:
    logger.info("WoL Manager starting up — launching background tasks")
    asyncio.create_task(_poll_loop())
    asyncio.create_task(_policy_loop())


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------


class WakeHookRequest(BaseModel):
    worker: str
    reason: Optional[str] = None


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@app.get("/health")
async def health() -> dict:
    return {
        "status": "ok",
        "service": "wol-manager",
        "workers": len(WORKERS),
        "online": sum(
            1
            for s in worker_states.values()
            if s.status == WorkerStatus.ONLINE
        ),
    }


@app.get("/status")
async def get_status() -> JSONResponse:
    """Return all worker statuses, last-seen timestamps, and current load."""
    return JSONResponse(
        content={
            "workers": {name: state.to_dict() for name, state in worker_states.items()},
            "active_hours": _in_active_hours(),
            "wake_schedule": WAKE_SCHEDULE,
            "idle_timeout_minutes": IDLE_TIMEOUT_MINUTES,
            "queue_threshold": QUEUE_DEPTH_THRESHOLD,
            "timestamp": datetime.now(tz=timezone.utc).isoformat(),
        }
    )


@app.post("/wake/{worker}")
async def wake_worker(worker: str, background_tasks: BackgroundTasks) -> dict:
    """Send a WoL magic packet to the specified worker."""
    if worker not in WORKERS:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown worker '{worker}'. Valid workers: {list(WORKERS.keys())}",
        )

    cfg = WORKERS[worker]
    mac = os.getenv(cfg["mac_env"], "")
    if not mac:
        raise HTTPException(
            status_code=503,
            detail=f"MAC address not configured for {worker} (env: {cfg['mac_env']})",
        )

    state = worker_states[worker]
    if state.status == WorkerStatus.ONLINE:
        return {"status": "already_online", "worker": worker}

    try:
        send_magic_packet(mac)
        state.mark_waking()
        logger.info(f"Wake requested for {worker} (MAC: {mac})")
        return {
            "status": "waking",
            "worker": worker,
            "message": f"Magic packet sent to {mac}",
        }
    except Exception as exc:
        logger.error(f"WoL failed for {worker}: {redact(str(exc))}")
        raise HTTPException(status_code=500, detail=f"WoL failed: {redact(str(exc))}")


@app.post("/sleep/{worker}")
async def sleep_worker(worker: str) -> dict:
    """SSH into worker and issue Windows shutdown /s /t 30."""
    if worker not in WORKERS:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown worker '{worker}'. Valid workers: {list(WORKERS.keys())}",
        )

    state = worker_states[worker]
    if state.status in (WorkerStatus.OFFLINE, WorkerStatus.SLEEPING):
        return {"status": "already_offline", "worker": worker}

    try:
        await ssh_shutdown_worker(worker)
        return {
            "status": "sleeping",
            "worker": worker,
            "message": "Shutdown command sent (30s delay)",
        }
    except asyncssh.Error as exc:
        logger.error(f"SSH error for {worker}: {redact(str(exc))}")
        raise HTTPException(
            status_code=502, detail=f"SSH connection failed: {redact(str(exc))}"
        )
    except Exception as exc:
        logger.error(f"Sleep failed for {worker}: {redact(str(exc))}")
        raise HTTPException(status_code=500, detail=f"Sleep failed: {redact(str(exc))}")


@app.post("/hook/worker-needed")
async def hook_worker_needed(req: WakeHookRequest) -> dict:
    """
    Hook endpoint for other services to request a worker wake.
    Body: {"worker": "worker-rtx3090ti", "reason": "openclaw-inference"}
    """
    worker = req.worker
    if worker not in WORKERS:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown worker '{worker}'. Valid workers: {list(WORKERS.keys())}",
        )

    cfg = WORKERS[worker]
    mac = os.getenv(cfg["mac_env"], "")
    state = worker_states[worker]

    logger.info(
        f"Hook: worker-needed for {worker} (reason: {req.reason or 'unspecified'})"
    )

    if state.status == WorkerStatus.ONLINE:
        return {"status": "already_online", "worker": worker, "reason": req.reason}

    if state.status == WorkerStatus.WAKING:
        return {"status": "already_waking", "worker": worker, "reason": req.reason}

    if not mac:
        raise HTTPException(
            status_code=503,
            detail=f"MAC address not configured for {worker} (env: {cfg['mac_env']})",
        )

    try:
        send_magic_packet(mac)
        state.mark_waking()
        logger.info(f"Hook wake: magic packet sent for {worker}")
        return {
            "status": "waking",
            "worker": worker,
            "reason": req.reason,
            "message": f"Magic packet sent to {mac}",
        }
    except Exception as exc:
        logger.error(f"Hook WoL failed for {worker}: {redact(str(exc))}")
        raise HTTPException(
            status_code=500, detail=f"WoL failed: {redact(str(exc))}"
        )


@app.post("/poll")
async def trigger_poll() -> dict:
    """Manually trigger an immediate poll of all workers."""
    await poll_all_workers()
    return {
        "status": "polled",
        "workers": {name: state.status.value for name, state in worker_states.items()},
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8095, log_level="info")
