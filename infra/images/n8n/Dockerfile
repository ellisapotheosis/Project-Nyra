FROM n8nio/n8n:latest

USER root

ARG N8N_TWENTY_NODES_GIT=
ARG N8N_EXTRA_PACKAGES=

RUN apk add --no-cache python3 make g++ || true

RUN if [ -n "$N8N_TWENTY_NODES_GIT" ]; then npm install -g "$N8N_TWENTY_NODES_GIT" || echo "Warning: N8N_TWENTY_NODES_GIT install failed"; fi
RUN for pkg in $N8N_EXTRA_PACKAGES; do \
      npm install -g "$pkg" || echo "Warning: could not install $pkg"; \
    done

USER node
