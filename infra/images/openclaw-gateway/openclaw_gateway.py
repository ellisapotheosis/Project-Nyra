#!/usr/bin/env python3
"""OpenClaw Gateway - Task Execution Engine"""

from flask import Flask, jsonify, request
import logging
import os
import uuid

app = Flask(__name__)
logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger(__name__)

LITELLM_URL = os.getenv("LITELLM_URL", "http://100.64.0.3:4000/v1")
LITELLM_API_KEY = os.getenv("LITELLM_API_KEY", "")

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "service": "openclaw-gateway"}), 200

@app.route("/status", methods=["GET"])
def status():
    return jsonify({
        "status": "ready",
        "version": "1.0.0",
        "uptime": os.popen("uptime -p").read().strip()
    }), 200

@app.route("/spawn-agent", methods=["POST"])
def spawn_agent():
    """Spawn a new agent for task execution"""
    data = request.json or {}
    agent_id = str(uuid.uuid4())[:8]

    logger.info(f"Spawning agent: {agent_id}")

    return jsonify({
        "agent_id": agent_id,
        "status": "spawned",
        "litellm_endpoint": LITELLM_URL
    }), 200

@app.route("/execute", methods=["POST"])
def execute_task():
    """Execute task on local GPU via agent"""
    data = request.json or {}
    task_id = data.get("task_id", str(uuid.uuid4())[:12])

    logger.info(f"Executing task {task_id}")

    return jsonify({
        "task_id": task_id,
        "status": "executing",
        "agent": data.get("agent_id", "default")
    }), 202

@app.route("/results/<task_id>", methods=["GET"])
def get_results(task_id):
    """Get task execution results"""
    return jsonify({
        "task_id": task_id,
        "status": "completed",
        "output": "Mock result from OpenClaw",
        "timestamp": str(os.popen("date -u").read().strip())
    }), 200

if __name__ == "__main__":
    port = int(os.getenv("OPENCLAW_PORT", 18789))
    app.run(host="0.0.0.0", port=port, debug=False)
