import json
import os
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, HTTPServer


AVAILABLE_MODELS = [
    model.strip()
    for model in os.environ.get("AVAILABLE_MODELS", "").split(",")
    if model.strip()
]
DEFAULT_MODEL = os.environ.get("DEFAULT_MODEL") or (AVAILABLE_MODELS[0] if AVAILABLE_MODELS else "")
DEFAULT_ROLE = os.environ.get("DEFAULT_ROLE", "")
SPECIALIZATION = [
    item.strip()
    for item in os.environ.get("SPECIALIZATION", "").split(",")
    if item.strip()
]
ROLE_MAP = {}
for item in os.environ.get("ROLE_MAP", "").split(","):
    item = item.strip()
    if not item or "=" not in item:
        continue
    role, model = item.split("=", 1)
    ROLE_MAP[role.strip()] = model.strip()
VLLM_URL = os.environ.get("VLLM_URL", "")
OLLAMA_URL = os.environ.get("OLLAMA_URL", "")
STATE_PATH = os.environ.get("STATE_PATH", "/models/current_model.json")
MODEL_KEEP_ALIVE = os.environ.get("MODEL_KEEP_ALIVE", "30m")
AUTO_PULL_MODELS = os.environ.get("AUTO_PULL_MODELS", "true").lower() in {"1", "true", "yes", "on"}
PORT = int(os.environ.get("SWITCHER_PORT", "8090"))

if DEFAULT_ROLE and DEFAULT_ROLE in ROLE_MAP:
    DEFAULT_MODEL = ROLE_MAP[DEFAULT_ROLE]

state = {"current_model": DEFAULT_MODEL, "current_role": DEFAULT_ROLE or None}


def backend_status():
    if OLLAMA_URL:
        url = f"{OLLAMA_URL.rstrip('/')}/api/version"
    else:
        url = f"{VLLM_URL.rstrip('/')}/health"

    try:
        with urllib.request.urlopen(url, timeout=5) as response:
            return {"healthy": 200 <= response.status < 300, "url": url}
    except (urllib.error.URLError, TimeoutError) as exc:
        return {"healthy": False, "url": url, "error": str(exc)}


def ollama_request(path, payload):
    data = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        f"{OLLAMA_URL.rstrip('/')}{path}",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        body = response.read().decode("utf-8").strip()
        return json.loads(body) if body else {}


def preload_model(model):
    if not OLLAMA_URL:
        return

    if AUTO_PULL_MODELS:
        ollama_request("/api/pull", {"name": model, "stream": False})

    ollama_request(
        "/api/generate",
        {
            "model": model,
            "prompt": "ping",
            "stream": False,
            "keep_alive": MODEL_KEEP_ALIVE,
            "options": {"num_predict": 1},
        },
    )


def unload_model(model):
    if not OLLAMA_URL or not model or model == state["current_model"]:
        return

    try:
        ollama_request(
            "/api/generate",
            {
                "model": model,
                "prompt": "ping",
                "stream": False,
                "keep_alive": 0,
                "options": {"num_predict": 0},
            },
        )
    except urllib.error.URLError:
        pass


def persist_state():
    directory = os.path.dirname(STATE_PATH)
    if directory:
        os.makedirs(directory, exist_ok=True)
    with open(STATE_PATH, "w", encoding="utf-8") as handle:
        json.dump(state, handle)


def restore_state():
    if not os.path.exists(STATE_PATH):
        return
    with open(STATE_PATH, "r", encoding="utf-8") as handle:
        saved = json.load(handle)
    current_model = saved.get("current_model")
    current_role = saved.get("current_role")
    if current_model in AVAILABLE_MODELS:
        state["current_model"] = current_model
    if current_role:
        state["current_role"] = current_role


class Handler(BaseHTTPRequestHandler):
    def _json(self, status_code, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/health":
            backend = backend_status()
            status_code = 200 if backend["healthy"] else 503
            self._json(
                status_code,
                {
                    "status": "healthy" if backend["healthy"] else "degraded",
                    "current_model": state["current_model"],
                    "current_role": state.get("current_role"),
                    "available_models": AVAILABLE_MODELS,
                    "roles": ROLE_MAP,
                    "specialization": SPECIALIZATION,
                    "backend": backend,
                },
            )
            return

        if self.path == "/models":
            self._json(
                200,
                {
                    "current_model": state["current_model"],
                    "current_role": state.get("current_role"),
                    "default_model": DEFAULT_MODEL,
                    "default_role": DEFAULT_ROLE or None,
                    "available_models": AVAILABLE_MODELS,
                    "roles": ROLE_MAP,
                    "specialization": SPECIALIZATION,
                },
            )
            return

        if self.path == "/roles":
            self._json(
                200,
                {
                    "roles": ROLE_MAP,
                    "current_model": state["current_model"],
                    "current_role": state.get("current_role"),
                },
            )
            return

        self._json(404, {"error": "not_found"})

    def do_POST(self):
        if self.path != "/select":
            self._json(404, {"error": "not_found"})
            return

        length = int(self.headers.get("Content-Length", "0"))
        payload = json.loads(self.rfile.read(length) or b"{}")
        target = payload.get("model", "")
        role = payload.get("role", "")
        if not target and role:
            target = ROLE_MAP.get(role, "")
        if target not in AVAILABLE_MODELS:
            self._json(
                400,
                {
                    "error": "unknown_model",
                    "requested_role": role or None,
                    "available_models": AVAILABLE_MODELS,
                    "roles": ROLE_MAP,
                },
            )
            return

        previous_model = state["current_model"]
        unload_model(previous_model)
        preload_model(target)
        state["current_model"] = target
        state["current_role"] = role or state.get("current_role")
        persist_state()
        self._json(
            200,
            {
                "ok": True,
                "current_model": state["current_model"],
                "previous_model": previous_model,
                "selected_role": state.get("current_role"),
            },
        )


restore_state()
persist_state()
HTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
