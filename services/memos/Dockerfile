FROM python:3.12-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl build-essential \
  && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir "MemoryOS[all]==2.0.16"

ENV PYTHONIOENCODING=utf-8 \
    FILE_LOCAL_PATH=/data/files \
    MOS_TEXT_MEM_TYPE=general_text

RUN mkdir -p /data/files /data/memos

WORKDIR /data/memos

EXPOSE 8001 8085

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -fsS http://127.0.0.1:8001/health || exit 1

CMD ["python", "-m", "memos.api.server_api", "--port", "8001", "--workers", "1"]
