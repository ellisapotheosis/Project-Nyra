FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl git \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir flask gunicorn requests

COPY openclaw_gateway.py /app/

EXPOSE 18789

HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
    CMD curl -f http://localhost:18789/health || exit 1

CMD ["python", "openclaw_gateway.py"]
