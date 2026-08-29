#!/usr/bin/env python3
"""
Mission Control Audit Service — Immutable, append-only audit trail
Port 9090 — Server-side read-only enforcement
"""

import os
import json
import hashlib
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configuration
AUDIT_DIR = Path(os.getenv("AUDIT_DIR", os.path.expanduser("~/.local/state/nyra-mission-control")))
AUDIT_DIR.mkdir(parents=True, exist_ok=True)
AUDIT_FILE = AUDIT_DIR / "audit.jsonl"
PORT = int(os.getenv("MISSION_CONTROL_PORT", 9090))

# Ensure file is created with read-only permissions (after first write)
if not AUDIT_FILE.exists():
    AUDIT_FILE.touch()

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mission-control")


class AuditEntry:
    """Append-only audit entry with hash chain verification."""

    def __init__(
        self,
        event_type: str,
        timestamp: str,
        session_id: str,
        task_id: str,
        agent_id: str,
        data: Dict,
        previous_hash: Optional[str] = None,
    ):
        self.event_type = event_type
        self.timestamp = timestamp
        self.session_id = session_id
        self.task_id = task_id
        self.agent_id = agent_id
        self.data = data
        self.previous_hash = previous_hash or "genesis"

    def compute_hash(self) -> str:
        """SHA256 hash of this entry's content (for tamper detection)."""
        payload = json.dumps(
            {
                "event_type": self.event_type,
                "timestamp": self.timestamp,
                "session_id": self.session_id,
                "task_id": self.task_id,
                "agent_id": self.agent_id,
                "data": self.data,
                "previous_hash": self.previous_hash,
            },
            sort_keys=True,
        )
        return hashlib.sha256(payload.encode()).hexdigest()

    def to_dict(self) -> Dict:
        """Convert to storable JSON object."""
        entry_hash = self.compute_hash()
        return {
            "event_type": self.event_type,
            "timestamp": self.timestamp,
            "session_id": self.session_id,
            "task_id": self.task_id,
            "agent_id": self.agent_id,
            "data": self.data,
            "hash": entry_hash,
            "previous_hash": self.previous_hash,
        }


def read_audit_file() -> List[Dict]:
    """Read entire audit file (newline-delimited JSON)."""
    if not AUDIT_FILE.exists():
        return []

    entries = []
    try:
        with open(AUDIT_FILE, "r") as f:
            for line in f:
                line = line.strip()
                if line:
                    entries.append(json.loads(line))
    except Exception as e:
        logger.error(f"Error reading audit file: {e}")
    return entries


def get_previous_hash() -> str:
    """Get hash of last entry for hash chain."""
    entries = read_audit_file()
    if entries:
        return entries[-1].get("hash", "genesis")
    return "genesis"


def append_audit_entry(entry: AuditEntry) -> bool:
    """Append entry to audit file (immutable operation)."""
    try:
        with open(AUDIT_FILE, "a") as f:
            f.write(json.dumps(entry.to_dict()) + "\n")
        return True
    except Exception as e:
        logger.error(f"Error writing audit entry: {e}")
        return False


@app.before_request
def enforce_read_only():
    """Enforce read-only at the HTTP level."""
    if request.method != "GET":
        return jsonify({"error": "Audit logs are immutable. All mutations forbidden."}), 403


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify(
        {
            "status": "healthy",
            "service": "mission-control-audit",
            "version": "1.0.0",
            "port": PORT,
        }
    )


@app.route("/api/v1/audit/events", methods=["GET"])
def list_events():
    """List all audit events with optional filtering."""
    entries = read_audit_file()

    # Filter by query parameters
    task_id = request.args.get("task_id")
    agent_id = request.args.get("agent_id")
    session_id = request.args.get("session_id")
    event_type = request.args.get("event_type")
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")

    filtered = entries
    if task_id:
        filtered = [e for e in filtered if e.get("task_id") == task_id]
    if agent_id:
        filtered = [e for e in filtered if e.get("agent_id") == agent_id]
    if session_id:
        filtered = [e for e in filtered if e.get("session_id") == session_id]
    if event_type:
        filtered = [e for e in filtered if e.get("event_type") == event_type]

    if start_date or end_date:
        start = datetime.fromisoformat(start_date) if start_date else datetime.min
        end = datetime.fromisoformat(end_date) if end_date else datetime.max
        filtered = [
            e
            for e in filtered
            if start <= datetime.fromisoformat(e.get("timestamp", "")) <= end
        ]

    return jsonify(
        {
            "total": len(filtered),
            "events": filtered,
        }
    )


@app.route("/api/v1/audit/events/<event_id>", methods=["GET"])
def get_event(event_id):
    """Get single event by ID (hash-based lookup)."""
    entries = read_audit_file()
    for entry in entries:
        if entry.get("hash") == event_id:
            return jsonify(entry)
    return jsonify({"error": "Event not found"}), 404


@app.route("/api/v1/audit/timeline/<session_id>", methods=["GET"])
def timeline(session_id):
    """Get chronological timeline for a session."""
    entries = read_audit_file()
    timeline_events = [e for e in entries if e.get("session_id") == session_id]
    timeline_events.sort(key=lambda e: e.get("timestamp", ""))

    return jsonify(
        {
            "session_id": session_id,
            "total_events": len(timeline_events),
            "timeline": timeline_events,
        }
    )


@app.route("/api/v1/audit/export/json", methods=["GET"])
def export_json():
    """Export all audit logs as JSON."""
    entries = read_audit_file()
    return jsonify({"entries": entries, "total": len(entries)})


@app.route("/api/v1/audit/export/csv", methods=["GET"])
def export_csv():
    """Export audit logs as CSV."""
    import csv
    import io

    entries = read_audit_file()
    output = io.StringIO()
    writer = csv.DictWriter(
        output, fieldnames=["timestamp", "session_id", "task_id", "agent_id", "event_type", "hash"]
    )
    writer.writeheader()
    for entry in entries:
        writer.writerow(
            {
                "timestamp": entry.get("timestamp"),
                "session_id": entry.get("session_id"),
                "task_id": entry.get("task_id"),
                "agent_id": entry.get("agent_id"),
                "event_type": entry.get("event_type"),
                "hash": entry.get("hash"),
            }
        )

    return output.getvalue(), 200, {"Content-Type": "text/csv"}


@app.route("/api/v1/audit/verify", methods=["GET"])
def verify():
    """Verify hash chain integrity (detect tampering)."""
    entries = read_audit_file()
    if not entries:
        return jsonify({"status": "empty", "integrity": "ok"})

    # Verify each entry's hash chain
    issues = []
    for i, entry in enumerate(entries):
        if i == 0:
            expected_prev = "genesis"
        else:
            expected_prev = entries[i - 1].get("hash")

        actual_prev = entry.get("previous_hash")
        if actual_prev != expected_prev:
            issues.append(
                {
                    "index": i,
                    "error": f"Hash chain broken: expected {expected_prev}, got {actual_prev}",
                }
            )

    return jsonify(
        {
            "total_entries": len(entries),
            "integrity": "compromised" if issues else "ok",
            "issues": issues,
        }
    )


@app.route("/api/v1/audit/stats", methods=["GET"])
def stats():
    """Get audit statistics."""
    entries = read_audit_file()

    event_counts = {}
    agent_counts = {}
    for entry in entries:
        event_type = entry.get("event_type")
        agent_id = entry.get("agent_id")
        event_counts[event_type] = event_counts.get(event_type, 0) + 1
        agent_counts[agent_id] = agent_counts.get(agent_id, 0) + 1

    return jsonify(
        {
            "total_events": len(entries),
            "events_by_type": event_counts,
            "events_by_agent": agent_counts,
            "file_size_bytes": AUDIT_FILE.stat().st_size if AUDIT_FILE.exists() else 0,
        }
    )


if __name__ == "__main__":
    logger.info(f"Mission Control Audit Service starting on port {PORT}")
    logger.info(f"Audit file: {AUDIT_FILE}")
    app.run(host="0.0.0.0", port=PORT, debug=False)
