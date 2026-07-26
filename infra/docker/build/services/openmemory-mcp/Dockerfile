FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends git curl && \
    rm -rf /var/lib/apt/lists/*

# Sparse-clone only the openmemory/api subtree (avoids full repo download)
RUN git clone --depth 1 --filter=blob:none --sparse \
    https://github.com/mem0ai/mem0.git /tmp/mem0 && \
    cd /tmp/mem0 && git sparse-checkout set openmemory/api

WORKDIR /app
RUN cp -r /tmp/mem0/openmemory/api/. /app/ && rm -rf /tmp/mem0

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8765

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8765", "--workers", "4"]
