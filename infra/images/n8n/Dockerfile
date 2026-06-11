FROM n8nio/n8n:latest

USER root

ARG N8N_TWENTY_NODES_GIT=
ARG N8N_EXTRA_PACKAGES=

RUN if command -v apk >/dev/null 2>&1; then \
      apk add --no-cache python3 make g++; \
    else \
      apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*; \
    fi

RUN if [ -n "$N8N_TWENTY_NODES_GIT" ]; then npm install -g "$N8N_TWENTY_NODES_GIT"; fi \
  && if [ -n "$N8N_EXTRA_PACKAGES" ]; then npm install -g $N8N_EXTRA_PACKAGES; fi

USER node
