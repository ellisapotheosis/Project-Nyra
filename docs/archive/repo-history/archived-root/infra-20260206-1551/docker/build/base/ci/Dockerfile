# CI/CD Pipeline Docker Image
FROM ubuntu:22.04

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    docker.io \
    docker-compose \
    shellcheck \
    jq \
    yamllint \
    && rm -rf /var/lib/apt/lists/*

# Install hadolint (Dockerfile linter)
RUN curl -sL -o /usr/local/bin/hadolint \
    https://github.com/hadolint/hadolint/releases/download/v2.12.0/hadolint-Linux-x86_64 && \
    chmod +x /usr/local/bin/hadolint

# Install docker-compose linter
RUN curl -sL https://github.com/projectatomic/dockerfile_lint/releases/download/v0.3.1/dockerfile_lint-linux-amd64 \
    -o /usr/local/bin/dockerfile_lint && \
    chmod +x /usr/local/bin/dockerfile_lint

# Set working directory
WORKDIR /workspace

# Copy CI scripts
COPY forbidden-strings.sh /usr/local/bin/
COPY docker-compose-lint.sh /usr/local/bin/
COPY smoke-tests.sh /usr/local/bin/

RUN chmod +x /usr/local/bin/*.sh

# Default command
CMD ["/bin/bash"]
