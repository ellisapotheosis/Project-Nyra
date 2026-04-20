FROM infisical/cli:latest
WORKDIR /app
COPY secrets-init.sh /usr/local/bin/secrets-init.sh
COPY agent-sidecar.sh /usr/local/bin/agent-sidecar.sh
RUN chmod +x /usr/local/bin/secrets-init.sh /usr/local/bin/agent-sidecar.sh
ENTRYPOINT ["/usr/local/bin/secrets-init.sh"]
