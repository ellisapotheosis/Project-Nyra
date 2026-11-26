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
SPECIALIZATION = [
    item.strip()
    for item in os.environ.get("SPECIALIZATION", "").split(",")
    if item.strip()
]
VLLM_URL = os.environ.get("VLLM_URL", "")
OLLAMA_URL = os.environ.get("OLLAMA_URL", "")
PORT = int(os.environ.get("SWITCHER_PORT", "8090"))

state = {"current_model": DEFAULT_MODEL}


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
                    "available_models": AVAILABLE_MODELS,
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
                    "default_model": DEFAULT_MODEL,
                    "available_models": AVAILABLE_MODELS,
                    "specialization": SPECIALIZATION,
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
        if target not in AVAILABLE_MODELS:
            self._json(400, {"error": "unknown_model", "available_models": AVAILABLE_MODELS})
            return

        state["current_model"] = target
        self._json(200, {"ok": True, "current_model": state["current_model"]})


HTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
