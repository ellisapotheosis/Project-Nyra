FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir flask gunicorn requests

COPY nerve.py /app/nerve.py

EXPOSE 7000

HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
    CMD curl -f http://localhost:7000/health || exit 1

CMD ["gunicorn", "--bind", "0.0.0.0:7000", "--timeout", "60", "nerve:app"]
