import http.server, http.client, socketserver

ROUTES = {
    "nerve-3090.projectnyra.com": ("worker-3090-nerve-ui", 18789),
    "openclaw-3090.projectnyra.com": ("worker-3090-openclaw", 18789),
    "vllm-3090.projectnyra.com": ("worker-rtx3090ti-worker-3090-vllm", 8000),
    "grafana-3090.projectnyra.com": ("worker-rtx3090ti-worker-grafana", 3000),
    "litellm-3090.projectnyra.com": ("worker-rtx3090ti-worker-3090-litellm", 4000),
    "switcher-3090.projectnyra.com": ("worker-rtx3090ti-worker-3090-switcher", 8090),
}


class ProxyHandler(http.server.BaseHTTPRequestHandler):
    def proxy(self):
        host = self.headers.get("Host", "").split(":")[0].lower()
        target = ROUTES.get(host)
        if not target:
            self.send_error(404, "No route: " + host)
            return
        thost, tport = target
        clen = int(self.headers.get("Content-Length", 0) or 0)
        body = self.rfile.read(clen) if clen > 0 else None
        hdrs = {k: v for k, v in self.headers.items()
                if k.lower() not in ("host", "transfer-encoding", "connection")}
        hdrs["Host"] = thost + ":" + str(tport)
        if body:
            hdrs["Content-Length"] = str(len(body))
        try:
            conn = http.client.HTTPConnection(thost, tport, timeout=60)
            conn.request(self.command, self.path or "/", body=body, headers=hdrs)
            resp = conn.getresponse()
            self.send_response(resp.status)
            for k, v in resp.getheaders():
                if k.lower() not in ("transfer-encoding", "connection"):
                    self.send_header(k, v)
            self.end_headers()
            while True:
                chunk = resp.read(65536)
                if not chunk:
                    break
                self.wfile.write(chunk)
        except Exception as e:
            try:
                self.send_error(502, str(e))
            except Exception:
                pass

    do_GET = do_POST = do_PUT = do_DELETE = do_PATCH = do_HEAD = do_OPTIONS = proxy

    def log_message(self, fmt, *args):
        pass


class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


print("Proxy on :80", flush=True)
Server(("0.0.0.0", 80), ProxyHandler).serve_forever()
