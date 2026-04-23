FROM node:20-bookworm-slim

ARG AGENTMEMORY_GIT_REF=v0.9.2

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl git python3 make g++ socat \
  && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://install.iii.dev/iii/main/install.sh | sh

ENV PATH="/root/.local/bin:${PATH}"

WORKDIR /opt/agentmemory-src

RUN git clone --depth=1 --branch "${AGENTMEMORY_GIT_REF}" https://github.com/rohitg00/agentmemory.git . \
  && npm install \
  && npm run build

COPY entrypoint.sh /usr/local/bin/agentmemory-entrypoint.sh

RUN chmod +x /usr/local/bin/agentmemory-entrypoint.sh

EXPOSE 3111 3112 3113

ENTRYPOINT ["/usr/local/bin/agentmemory-entrypoint.sh"]
