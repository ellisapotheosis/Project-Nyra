# 14 Infra Target Tree (Post-Move Runtime Truth)

## Canonical runtime graph

- Root Make orchestration: `Makefile`.
- Node bring-up scripts: `infra/scripts/node-up.sh`, `infra/scripts/node-down.sh`.
- Role/profile bootstrap: `infra/scripts/ultimate-bootstrap.sh`.

## Primary compose files

- `docker-compose.archon.yml`
- `docker-compose.gitea.yml`
- `docker-compose.infisical.yml`
- `infra/docker-compose.yml`
- `infra/oracle/docker-compose.oracle.yml`
- `infra/workers/worker-rtx3060/docker-compose.worker.yml`
- `infra/workers/worker-rtx3090ti/docker-compose.worker.yml`
- `infra/workers/worker-rtx5090/docker-compose.worker.yml`

## Additional active compose definitions

- `infra/compose/base.yml`
- `infra/compose/cloudflared.profile.yml`
- `infra/compose/monitoring.profile.yml`
- `infra/compose/openclaw-unmute.overlay.yml`
- `infra/compose/openclaw.compose.yml`
- `infra/compose/openclaw.ops.compose.yml`
- `infra/compose/openclaw.profile.yml`
- `infra/compose/openclaw.ui.compose.yml`
- `infra/compose/openclaw.voice.compose.yml`
- `infra/compose/oracle.override.yml`
- `infra/compose/orchestrator.override.yml`
- `infra/compose/voice.profile.yml`
- `infra/compose/workers.override.yml`
- `infra/configs/gitea/docker-compose.gitea.yml`
- `infra/dev-stack/docker-compose.yml`
- `infra/docker-compose.oracle.yml`
- `infra/docker-compose/docker-compose.claude-flow.yml`
- `infra/homeassistant/docker-compose.homeassistant-dashboard.yml`
- `infra/orchestrator/docker-compose.orchestrator.yml`
- `infra/orchestrator/portainer-mesh/docker-compose.portainer.edge-agent.yml`
- `infra/orchestrator/portainer-mesh/docker-compose.portainer.orchestrator.yml`
- `infra/stacks/nyra-mortgage/docker-compose.addons.yml`
- `infra/stacks/nyra-mortgage/docker-compose.graphiti.yml`
- `infra/stacks/nyra-mortgage/docker-compose.local.yml`
- `infra/stacks/nyra-mortgage/docker-compose.services.yml`
- `infra/stacks/nyra-mortgage/docker-compose.voice.yml`
- `infra/stacks/nyra-mortgage/docker-compose.yml`
- `infra/workers/docker-compose.workers.yml`
- `infra/workers/worker-3060/docker-compose.worker-3060.yml`
- `infra/workers/worker-3090/docker-compose.worker-3090.yml`
- `infra/workers/worker-rtx3060/docker-compose.gpu.yml`
- `infra/workers/worker-rtx3090ti/docker-compose.gpu.yml`
- `infra/workers/worker-rtx5090/docker-compose.gpu.yml`
- `infra/workers/worker-rtx5090/worker-5090/docker-compose.worker-5090.yml`

## Supplemental (appendix only) compose definitions

- `docker-compose.gitea.bootstrap.yml`
- `docker-compose.infisical.bootstrap.yml`
- `infra/compose/docker-compose.archon.yml`
- `infra/compose/docker-compose.cloudflared.yml`
- `infra/compose/overrides/docker-compose.dev-laptop.override.yml`
- `infra/compose/overrides/docker-compose.oracle.override.yml`
- `infra/compose/overrides/docker-compose.orchestrator.override.yml`
- `infra/compose/overrides/docker-compose.worker-rtx3060.override.yml`
- `infra/docker-compose.claude-flow-cicd.yml`
- `infra/docker-compose.dashboard.yml`
- `infra/docker-compose.orchestrator-cf-tunnel.yml`
- `infra/docker-compose.twenty.yml`
- `infra/orchestrator/docker-compose.nexus-one-hop.yml`
