# Host Topology Map

```txt
/infra/hosts/
├─ orchestrator/
│  ├─ compose.*.yml           # control plane, tunnels, Nexus/Hive, OpenClaw Gateway, bitnet.cpp, PocketTTS
│  └─ README.md
├─ worker-rtx5090/
│  ├─ compose.*.yml           # vLLM, LMCache, Redis, LiteLLM, model-switcher, OpenClaw, NerveUI
│  └─ README.md
├─ worker-rtx3090ti/
│  ├─ compose.*.yml           # vLLM, LMCache, Redis, LiteLLM, model-switcher, OpenClaw, NerveUI
│  └─ README.md
├─ worker-rtx3060/
│  ├─ compose.*.yml           # Ollama, optional Redis, LiteLLM, model-switcher, OpenClaw, NerveUI
│  └─ README.md
├─ worker-rtx4060/            # optional backup OpenClaw Gateway if actual host exists
│  └─ README.md
├─ oracle/
│  ├─ compose.*.yml           # Gitea, Gitea DB, MCP servers, Cloudflare Tunnel
│  └─ README.md
└─ homeassistant-green/
   ├─ compose.*.yml           # Vaultwarden, Linkwarden if managed here
   └─ README.md
```

## Host roles

| Host                | Role            | Must run                                                                                | Optional                                                  |
| ------------------- | --------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| orchestrator        | control plane   | Cloudflare Tunnel, OpenClaw Gateway, routing, Makefile control, Infisical bootstrap env | bitnet.cpp, PocketTTS                                     |
| worker-rtx5090      | burst GPU       | vLLM, LMCache, Redis, LiteLLM, OpenClaw, NerveUI, model switcher                        | Claude Code instead of OpenClaw for coding windows        |
| worker-rtx3090ti    | steady GPU      | vLLM, LMCache, Redis, LiteLLM, OpenClaw, NerveUI, model switcher                        | campaign-dedicated scheduler                              |
| worker-rtx3060      | lightweight GPU | Ollama, LiteLLM, OpenClaw, NerveUI, model switcher                                      | Redis/KV cache                                            |
| worker-rtx4060      | backup gateway  | backup OpenClaw Gateway if actual                                                       | Nerve/OpenClaw fallback                                   |
| oracle              | external VPS    | Gitea, DB, Cloudflare Tunnel, MCP servers                                               | Infisical MCP, Twenty MCP, Git MCP, GitHub MCP, Gitea MCP |
| homeassistant-green | LAN utility     | Vaultwarden, Linkwarden                                                                 | HA automations                                            |
