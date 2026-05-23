# ClawTeam-compatible fallback endpoint for Portainer management.

FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY server.py ./server.py
RUN mkdir -p /root/.clawteam

EXPOSE 9000

HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
    CMD curl -f http://localhost:9000/health || exit 1

CMD ["python", "server.py"]
