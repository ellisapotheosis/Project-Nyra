import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


PORT = int(os.environ.get("CLAWTEAM_PORT", "9000"))
ROLE = os.environ.get("CLAWTEAM_ROLE", "standby-replica")
HOST = os.environ.get("CLAWTEAM_HOST", "unknown")
PRIMARY = os.environ.get("CLAWTEAM_PRIMARY", "")


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path in {"/health", "/ready"}:
            self._json(200, {"status": "healthy", "role": ROLE, "host": HOST})
            return

        if self.path in {"/", "/metadata"}:
            self._json(
                200,
                {
                    "service": "clawteam-fallback",
                    "status": "online",
                    "role": ROLE,
                    "host": HOST,
                    "primary": PRIMARY,
                },
            )
            return

        self._json(404, {"error": "not_found"})

    def log_message(self, fmt, *args):
        return

    def _json(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("content-type", "application/json; charset=utf-8")
        self.send_header("content-length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
