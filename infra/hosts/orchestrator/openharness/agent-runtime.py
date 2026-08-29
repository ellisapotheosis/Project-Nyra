#!/usr/bin/env python3
"""
OpenHarness — Agent Execution Runtime
Minimal agent task dispatcher for Project Nyra

Routes agent tasks through:
  1. Task queue (Redis)
  2. OpenClaw Gateway (orchestration)
  3. LiteLLM model gateway (inference)
  4. ClawTeam coordination (team tasks)
"""

import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer

OPENCLAW_GATEWAY_URL = os.getenv("OPENCLAW_GATEWAY_URL", "http://localhost:18789")
CLAWTEAM_URL = os.getenv("CLAWTEAM_URL", "http://localhost:8080")
LITELLM_BASE_URL = os.getenv("LITELLM_BASE_URL", "http://localhost:4000/v1")
LITELLM_API_KEY = os.getenv("LITELLM_API_KEY", "")


class AgentHandler(BaseHTTPRequestHandler):
    """HTTP handler for agent task execution."""

    def do_GET(self):
        """Health check endpoint."""
        if self.path == "/health":
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(
                json.dumps(
                    {
                        "status": "healthy",
                        "service": "openharness",
                        "orchestrator": OPENCLAW_GATEWAY_URL,
                        "litellm": LITELLM_BASE_URL,
                    }
                ).encode()
            )
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        """Execute agent task."""
        if self.path == "/task/execute":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode()

            try:
                task_request = json.loads(body)
                agent_id = task_request.get("agent_id", "default")
                task_type = task_request.get("type", "inference")
                payload = task_request.get("payload", {})

                # Route to appropriate handler
                if task_type == "inference":
                    response = self._handle_inference(agent_id, payload)
                elif task_type == "team_coordination":
                    response = self._handle_team_task(agent_id, payload)
                else:
                    response = {"error": f"Unknown task type: {task_type}"}

                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(response).encode())

            except Exception as e:
                self.send_response(400)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def _handle_inference(self, agent_id: str, payload: dict) -> dict:
        """Route inference task through LiteLLM."""
        return {
            "status": "routed",
            "agent_id": agent_id,
            "endpoint": f"{LITELLM_BASE_URL}/chat/completions",
            "model": payload.get("model", "local/qwen3.8-27b"),
            "notes": "Task routed to LiteLLM. Use /chat/completions endpoint.",
        }

    def _handle_team_task(self, agent_id: str, payload: dict) -> dict:
        """Route team coordination task through ClawTeam."""
        return {
            "status": "routed",
            "agent_id": agent_id,
            "endpoint": f"{CLAWTEAM_URL}/coordinate",
            "task_type": payload.get("task_type", "parallel_execution"),
            "notes": "Task routed to ClawTeam. Coordinate with other agents.",
        }

    def log_message(self, format_str, *args):
        """Suppress default logging."""
        pass


def run_server(port=8000):
    """Start OpenHarness agent execution server."""
    server_address = ("0.0.0.0", port)
    httpd = HTTPServer(server_address, AgentHandler)
    print(f"OpenHarness listening on port {port}")
    print(f"  OpenClaw Gateway: {OPENCLAW_GATEWAY_URL}")
    print(f"  LiteLLM: {LITELLM_BASE_URL}")
    print(f"  ClawTeam: {CLAWTEAM_URL}")
    httpd.serve_forever()


if __name__ == "__main__":
    run_server()
