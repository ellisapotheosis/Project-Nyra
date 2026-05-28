FROM n8nio/n8n:latest

USER root

ARG N8N_TWENTY_NODES_GIT=
ARG N8N_EXTRA_PACKAGES=

RUN apk add --no-cache python3 make g++

RUN if [ -n "$N8N_TWENTY_NODES_GIT" ]; then npm install -g "$N8N_TWENTY_NODES_GIT"; fi \
  && if [ -n "$N8N_EXTRA_PACKAGES" ]; then npm install -g $N8N_EXTRA_PACKAGES; fi

USER node
