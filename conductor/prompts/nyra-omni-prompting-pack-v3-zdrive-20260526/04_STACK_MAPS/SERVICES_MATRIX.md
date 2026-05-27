# Services Matrix

| Service                 | Primary host             | Exposure            | Notes                                                    |
| ----------------------- | ------------------------ | ------------------- | -------------------------------------------------------- |
| Project Nyra webapp     | orchestrator / app host  | protected           | authenticated broker app using local Supabase            |
| RateHunter landing      | public deploy            | public              | borrower lead capture; no internal links                 |
| ProjectNyra.com landing | public deploy            | public              | broker product marketing; no raw endpoints               |
| TwentyCRM               | dedicated stack          | protected/Tailscale | system-of-record, separate Postgres                      |
| Supabase local          | orchestrator/local       | protected/private   | webapp backend/auth                                      |
| Activepieces            | orchestrator/local       | protected/embedded  | primary workflow builder                                 |
| n8n                     | optional                 | Tailscale only      | fallback; constrained mortgage UI if exposed through app |
| CRM API                 | orchestrator             | protected/internal  | canonical CRM service                                    |
| Quote Engine            | orchestrator/worker      | internal            | deterministic 3-option output                            |
| RateQuoting API         | service host             | internal/protected  | service-backed; mock/degraded support                    |
| Campaign Engine         | orchestrator             | internal            | campaign execution state                                 |
| Letta                   | orchestrator/memory host | Tailscale only      | own Postgres; orchestrator/memory manager                |
| OpenClaw Gateway        | orchestrator             | Tailscale only      | primary gateway                                          |
| OpenClaw Gateway Backup | worker-rtx4060 optional  | Tailscale only      | backup if actual host exists                             |
| NerveUI                 | each worker              | Tailscale only      | worker/session control                                   |
| Nexus/Hive              | orchestrator             | Tailscale/protected | MCP proxy aggregator + console                           |
| LiteLLM                 | each worker              | Tailscale only      | local model routing                                      |
| vLLM/LMCache            | 5090/3090Ti              | never public        | model serving/cache                                      |
| Ollama                  | 3060                     | never public        | lightweight models                                       |
| Qdrant                  | memory host              | never public        | vectors/mem0 backend                                     |
| Redis                   | per worker/service       | never public        | cache/queues/KV                                          |
| Postgres                | service-specific         | never public        | separate DBs for Twenty, Letta, Supabase, Gitea          |
| Gitea                   | Oracle                   | protected           | self-hosted git                                          |
| Gitea MCP               | Oracle                   | Tailscale/protected | MCP for repo ops                                         |
| Tea CLI                 | agent machines           | local shell         | CLI, not MCP                                             |
| Vaultwarden             | HA Green                 | LAN/Tailnet         | secrets/password vault UX                                |
| Linkwarden              | HA Green                 | LAN/Tailnet         | bookmarks/reference capture                              |
| Prometheus/Grafana/Loki | observability host       | Tailscale/protected | monitoring/logs                                          |
| Portainer               | orchestrator             | Tailscale/protected | CE + agent on orchestrator; agent on others              |
| Syncthing               | all hosts                | Tailnet/LAN         | file sync                                                |
