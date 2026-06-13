FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl git nodejs npm \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace/project-nyra

ENV UV_CACHE_DIR=/uv-cache

EXPOSE 8769

CMD ["uvx", "--from", "git+https://github.com/oraios/serena", "serena", "start-mcp-server", "--transport", "streamable-http", "--host", "0.0.0.0", "--port", "8769", "--context=claude-code", "--project", "/workspace/project-nyra", "--enable-web-dashboard=false", "--open-web-dashboard=false"]
