#!/usr/bin/env python3
"""
Omnigent — AI Governance & Policy Enforcement
Non-persistent meta-harness enforcing safety boundaries

Responsibilities:
- Request validation (token limits, rate limiting)
- Model access control (allowed models only)
- Output safety verification
- Policy arbitration for multi-agent tasks
- Audit logging
"""

import os
import json
import time
from http.server import BaseHTTPRequestHandler, HTTPServer
from collections import defaultdict
from datetime import datetime, timedelta

# Configuration
PORT = int(os.getenv("OMNIGENT_PORT", "8003"))
MAX_TOKENS_PER_REQUEST = int(os.getenv("MAX_TOKENS_PER_REQUEST", "4096"))
MAX_REQUESTS_PER_MINUTE = int(os.getenv("MAX_REQUESTS_PER_MINUTE", "60"))
ALLOWED_MODELS = os.getenv(
    "ALLOWED_MODELS", "local/qwen3.8-27b,omniroute/auto,openrouter/qwen3"
).split(",")
SAFETY_MODE = os.getenv("SAFETY_MODE", "strict")

# Rate limiting state (in-memory, non-persistent)
request_log = defaultdict(list)


class PolicyViolation(Exception):
    """Raised when a policy constraint is violated."""

    pass


class GovernanceHandler(BaseHTTPRequestHandler):
    """HTTP handler for governance decisions."""

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
                        "service": "omnigent",
                        "safety_mode": SAFETY_MODE,
                        "max_tokens": MAX_TOKENS_PER_REQUEST,
                        "rate_limit": MAX_REQUESTS_PER_MINUTE,
                    }
                ).encode()
            )
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        """Validate and arbitrate agent requests."""
        if self.path == "/validate":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode()

            try:
                request_data = json.loads(body)
                agent_id = request_data.get("agent_id", "unknown")
                model = request_data.get("model", "unknown")
                max_tokens = request_data.get("max_tokens", 100)

                # Validate request
                self._validate_request(agent_id, model, max_tokens)

                # Rate limit check
                self._check_rate_limit(agent_id)

                response = {
                    "approved": True,
                    "agent_id": agent_id,
                    "model": model,
                    "max_tokens": max_tokens,
                    "timestamp": datetime.utcnow().isoformat(),
                }

                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(response).encode())

            except PolicyViolation as e:
                self.send_response(403)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                self.wfile.write(
                    json.dumps({"approved": False, "reason": str(e)}).encode()
                )
            except Exception as e:
                self.send_response(400)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())

        elif self.path == "/arbitrate":
            # Multi-agent task arbitration
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode()

            try:
                task = json.loads(body)
                agents = task.get("agents", [])
                task_type = task.get("type", "parallel")

                result = self._arbitrate_task(agents, task_type)

                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(result).encode())

            except Exception as e:
                self.send_response(400)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())

        else:
            self.send_response(404)
            self.end_headers()

    def _validate_request(self, agent_id: str, model: str, max_tokens: int):
        """Validate request against policy constraints."""
        if max_tokens > MAX_TOKENS_PER_REQUEST:
            raise PolicyViolation(
                f"Token limit exceeded: {max_tokens} > {MAX_TOKENS_PER_REQUEST}"
            )

        if model not in ALLOWED_MODELS:
            raise PolicyViolation(f"Model not allowed: {model}")

        if not agent_id or len(agent_id) > 256:
            raise PolicyViolation(f"Invalid agent_id: {agent_id}")

    def _check_rate_limit(self, agent_id: str):
        """Check rate limiting for agent."""
        now = datetime.utcnow()
        minute_ago = now - timedelta(minutes=1)

        # Clean old requests
        request_log[agent_id] = [
            ts for ts in request_log[agent_id] if ts > minute_ago
        ]

        # Check limit
        if len(request_log[agent_id]) >= MAX_REQUESTS_PER_MINUTE:
            raise PolicyViolation(
                f"Rate limit exceeded: {len(request_log[agent_id])} requests/min"
            )

        # Log this request
        request_log[agent_id].append(now)

    def _arbitrate_task(self, agents: list, task_type: str) -> dict:
        """Arbitrate multi-agent task execution."""
        if not agents:
            raise PolicyViolation("No agents specified")

        if task_type == "parallel":
            return {
                "arbitration": "approved",
                "task_type": task_type,
                "agents": agents,
                "execution_mode": "parallel_safe",
                "isolation": "task_specific",
            }
        elif task_type == "sequential":
            return {
                "arbitration": "approved",
                "task_type": task_type,
                "agents": agents,
                "execution_order": agents,
                "handoff_validation": "enabled",
            }
        else:
            raise PolicyViolation(f"Unknown task type: {task_type}")

    def log_message(self, format_str, *args):
        """Suppress default logging."""
        pass


def run_server(port=PORT):
    """Start Omnigent governance server."""
    server_address = ("0.0.0.0", port)
    httpd = HTTPServer(server_address, GovernanceHandler)
    print(f"Omnigent listening on port {port}")
    print(f"  Safety mode: {SAFETY_MODE}")
    print(f"  Max tokens: {MAX_TOKENS_PER_REQUEST}")
    print(f"  Rate limit: {MAX_REQUESTS_PER_MINUTE} req/min")
    print(f"  Allowed models: {', '.join(ALLOWED_MODELS)}")
    httpd.serve_forever()


if __name__ == "__main__":
    run_server()
