# Runtime Topology — 2026-09-19

## Active hosts

- `orchestrator`: development/control cockpit; 16 GB RAM.
- `oracle-vps`: durable/stateful services and public ingress.
- `worker-rtx5090`: primary GPU inference and OpenClaw/Nerve/voice worker.
- `worker-rtx3090ti`: secondary GPU inference and OpenClaw/PicoClaw/Nerve/voice worker.

## Retired host

`worker-rtx3060` has been sold. It is not an active worker and must not be used by active Make targets, health checks, failover logic, or agent registries. Existing files can remain temporarily for cleanup/history.

## Control plane

Letta owns durable agent state and orchestration policy. LiteLLM is the model/provider gateway. MCP aggregation is a separate tool-policy boundary. OpenClaw/PicoClaw are agent runtimes. Jefe/Code, ClawTeam, Paperclip, GasTown, WaveTerm and Nerve are execution/operator surfaces rather than the canonical state store.

Letta persistence belongs on Oracle so development-host changes or GPU-worker disconnects do not destroy orchestration state.
