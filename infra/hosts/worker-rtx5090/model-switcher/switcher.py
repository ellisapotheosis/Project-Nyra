import json
import os
import urllib.error
import urllib.request
import socket
import http.client
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
PORT = int(os.environ.get("SWITCHER_PORT", "8090"))

state = {"current_model": DEFAULT_MODEL}


class UnixHTTPConnection(http.client.HTTPConnection):
    def __init__(self, unix_socket_path):
        super().__init__("localhost")
        self.unix_socket_path = unix_socket_path

    def connect(self):
        self.sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        self.sock.connect(self.unix_socket_path)


def find_vllm_container():
    try:
        conn = UnixHTTPConnection("/var/run/docker.sock")
        conn.connect()
        conn.request("GET", "/containers/json")
        res = conn.getresponse()
        if res.status == 200:
            containers = json.loads(res.read().decode("utf-8"))
            for container in containers:
                labels = container.get("Labels", {})
                if labels.get("com.nyra.service") == "vllm":
                    return container["Id"]
            for container in containers:
                if "vllm" in container.get("Image", "").lower():
                    return container["Id"]
            for container in containers:
                for name in container.get("Names", []):
                    if "vllm" in name.lower():
                        return container["Id"]
        return None
    except Exception as exc:
        print(f"Error finding vllm container: {exc}")
        return None


def restart_vllm(container_id):
    try:
        conn = UnixHTTPConnection("/var/run/docker.sock")
        conn.connect()
        conn.request("POST", f"/containers/{container_id}/restart?t=5")
        res = conn.getresponse()
        print(f"Restart container {container_id} status: {res.status} {res.reason}")
        return res.status in (200, 204)
    except Exception as exc:
        print(f"Error restarting container: {exc}")
        return False


def backend_status():
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

        try:
            with open("/models/current_model.txt", "w", encoding="utf-8") as handle:
                handle.write(target)
            print(f"Wrote target model {target} to /models/current_model.txt")
        except Exception as exc:
            self._json(500, {"error": "write_failed", "details": str(exc)})
            return

        vllm_id = find_vllm_container()
        if not vllm_id:
            self._json(
                500,
                {
                    "error": "vllm_container_not_found",
                    "message": "Could not find vllm container via docker socket",
                },
            )
            return

        print(f"Found vllm container ID: {vllm_id}. Triggering restart...")
        if restart_vllm(vllm_id):
            state["current_model"] = target
            self._json(
                200,
                {
                    "ok": True,
                    "current_model": state["current_model"],
                    "message": f"Successfully switched model to {target} and restarted vLLM.",
                },
            )
            return

        self._json(
            500,
            {
                "error": "restart_failed",
                "message": f"Located vllm container {vllm_id} but docker restart failed",
            },
        )


try:
    if os.path.exists("/models/current_model.txt"):
        with open("/models/current_model.txt", "r", encoding="utf-8") as handle:
            saved_model = handle.read().strip()
        if saved_model in AVAILABLE_MODELS:
            state["current_model"] = saved_model
            print(f"Restored current model from file: {saved_model}")
except Exception as exc:
    print(f"Error restoring model state: {exc}")


HTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
