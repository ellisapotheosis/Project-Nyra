#!/usr/bin/env python3
"""
Health check script for LiteLLM proxy.
"""

import os
import sys
from urllib.parse import urlparse

import psycopg2
import redis
import requests


def check_http_service() -> bool:
    """Check if LiteLLM HTTP service is responding."""
    try:
        port = os.environ.get("LITELLM_PORT", "4000")
        response = requests.get(f"http://localhost:{port}/health", timeout=5)
        return response.status_code == 200
    except Exception as exc:  # pragma: no cover
        print(f"HTTP service check failed: {exc}")
        return False


def check_database() -> bool:
    """Check PostgreSQL connectivity."""
    try:
        db_url = os.environ.get("DATABASE_URL", "")
        if not db_url:
            return True

        parsed = urlparse(db_url)
        conn = psycopg2.connect(
            host=parsed.hostname,
            port=parsed.port or 5432,
            database=parsed.path[1:],
            user=parsed.username,
            password=parsed.password,
            connect_timeout=5,
        )
        conn.close()
        return True
    except Exception as exc:  # pragma: no cover
        print(f"Database check failed: {exc}")
        return False


def check_redis() -> bool:
    """Check Redis connectivity."""
    try:
        redis_url = os.environ.get("REDIS_URL", "")
        if not redis_url:
            return True

        parsed = urlparse(redis_url)
        client = redis.Redis(
            host=parsed.hostname,
            port=parsed.port or 6379,
            socket_connect_timeout=5,
        )
        client.ping()
        return True
    except Exception as exc:  # pragma: no cover
        print(f"Redis check failed: {exc}")
        return False


def main() -> int:
    checks = {
        "HTTP Service": check_http_service(),
        "Database": check_database(),
        "Redis": check_redis(),
    }

    for name, status in checks.items():
        status_str = "PASS" if status else "FAIL"
        print(f"{name}: {status_str}")

    if all(checks.values()):
        print("All health checks passed")
        return 0

    print("Some health checks failed")
    return 1


if __name__ == "__main__":
    sys.exit(main())
