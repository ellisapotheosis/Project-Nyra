FROM docker/sandbox-templates:claude-code

ARG GASTOWN_REF=main
ARG GO_VERSION=1.25.8

USER root

RUN apt-get update && apt-get install -y \
    build-essential \
    ca-certificates \
    curl \
    gh \
    git \
    jq \
    netcat-openbsd \
    ripgrep \
    sqlite3 \
    tini \
    tmux \
    vim \
    zsh \
  && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

RUN ARCH="$(dpkg --print-architecture)" \
  && curl -fsSL "https://go.dev/dl/go${GO_VERSION}.linux-${ARCH}.tar.gz" \
    | tar -C /usr/local -xz

ENV PATH="/app/gastown:/usr/local/go/bin:/home/agent/go/bin:${PATH}"
ENV COLORTERM=truecolor
ENV TERM=xterm-256color

RUN curl -fsSL https://raw.githubusercontent.com/steveyegge/beads/main/scripts/install.sh | bash \
  && curl -fsSL https://github.com/dolthub/dolt/releases/latest/download/install.sh | bash

RUN mkdir -p /app /gt /gt/.dolt-data \
  && chown -R agent:agent /app /gt

USER agent

RUN git clone --depth=1 --branch "${GASTOWN_REF}" https://github.com/gastownhall/gastown.git /app/gastown \
  && cd /app/gastown \
  && make build

USER root

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh \
  && chown agent:agent /app/docker-entrypoint.sh

USER agent
WORKDIR /gt

ENTRYPOINT ["tini", "--", "/app/docker-entrypoint.sh"]
CMD ["sleep", "infinity"]
