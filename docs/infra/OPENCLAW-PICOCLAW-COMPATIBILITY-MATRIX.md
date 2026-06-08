# OpenClaw / PicoClaw Compatibility Matrix

PicoClaw source/config was not found in this repo on 2026-05-17. OpenClaw, Nerve UI, Gastown, and ClawTeam configs are present. Decision: keep RTX3060 on OpenClaw+Nerve UI unless PicoClaw source or API docs are added; otherwise build a compatibility adapter first.

| Component                  | Requires OpenClaw contract | PicoClaw supports? | Evidence                                                                                           | Gap                                      | Adapter needed? | Decision                 |
| -------------------------- | -------------------------: | -----------------: | -------------------------------------------------------------------------------------------------- | ---------------------------------------- | --------------: | ------------------------ |
| Nerve UI                   |                        yes |            unknown | `infra/hosts/worker-rtx3060/docker-compose.openclaw.yml` sets `OPENCLAW_URL` for Nerve UI          | No PicoClaw contract found               |             yes | Keep OpenClaw or adapter |
| ClawTeam                   |                     likely |            unknown | `infra/hosts/oracle-vps/docker-compose.clawteam.yml` exposes `clawteam` and worker fallback config | No PicoClaw worker registration evidence |             yes | Do not swap yet          |
| Gastown                    |        partial/MCP gateway |            unknown | `infra/hosts/oracle-vps/docker-compose.gastown.yml` exposes `/health` on 3100                      | No PicoClaw tool metadata evidence       |           maybe | Keep independent gateway |
| GasTown/GasTeam            |                    unknown |            unknown | No matching source/config found                                                                    | Missing component source                 |         unknown | Do not expose route      |
| OpenClaw worker default UI |                        yes |        no evidence | `services/openclaw`, `infra/images/openclaw`, worker compose overlays                              | No PicoClaw source                       |             yes | Use OpenClaw             |
| OpenClaw router UI         |                        yes |        no evidence | orchestrator `openclaw-gateway` service                                                            | No PicoClaw router API evidence          |             yes | Use OpenClaw gateway     |

## Adapter shape if PicoClaw is added

Create `services/picoclaw-openclaw-adapter/` to expose OpenClaw-compatible health/status, heartbeat, events/logs, chat/completion proxying to PicoClaw/Ollama, UI discovery metadata, optional Soul.MD loading, and MCP tool metadata.
