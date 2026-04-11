FROM alpine:3.20

RUN apk add --no-cache bash curl openssl jq gettext coreutils ca-certificates \
  && update-ca-certificates \
  && curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.alpine.sh' | bash \
  && apk add --no-cache infisical

COPY secrets-init.sh /usr/local/bin/secrets-init.sh
COPY agent-sidecar.sh /usr/local/bin/agent-sidecar.sh
RUN chmod +x /usr/local/bin/secrets-init.sh /usr/local/bin/agent-sidecar.sh

CMD ["sh", "-lc", "sleep infinity"]
