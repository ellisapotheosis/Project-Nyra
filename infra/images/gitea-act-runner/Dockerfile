ARG ACT_RUNNER_VERSION=0.2.11
FROM gitea/act_runner:${ACT_RUNNER_VERSION}

COPY scripts/gitea/bootstrap-act-runner.sh /usr/local/bin/bootstrap-act-runner.sh
COPY infra/configs/gitea/runner-config.yaml /opt/nyra/runner-config.yaml
COPY infra/configs/gitea/runner-config-large.yaml /opt/nyra/runner-config-large.yaml

RUN chmod +x /usr/local/bin/bootstrap-act-runner.sh
