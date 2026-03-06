# syntax=docker/dockerfile:1.7
ARG OPENCLAW_BASE_IMAGE=ghcr.io/openclaw/openclaw-cli:latest
FROM ${OPENCLAW_BASE_IMAGE}

ARG OPENCLAW_INSTALL_BROWSER=1
ARG OPENCLAW_DOCKER_APT_PACKAGES="git curl jq python3 python3-pip build-essential ffmpeg"

USER root
RUN apt-get update \
  && if [ -n "$OPENCLAW_DOCKER_APT_PACKAGES" ]; then apt-get install -y --no-install-recommends $OPENCLAW_DOCKER_APT_PACKAGES; fi \
  && if [ "$OPENCLAW_INSTALL_BROWSER" = "1" ] && command -v playwright >/dev/null 2>&1; then playwright install --with-deps chromium; fi \
  && rm -rf /var/lib/apt/lists/*

USER node
WORKDIR /workspace
