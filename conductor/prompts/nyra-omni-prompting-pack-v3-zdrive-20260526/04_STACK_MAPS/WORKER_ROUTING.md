# Worker Routing

| Worker           | Default duty                                | Route here                                                                                          | Avoid                                          |
| ---------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| RTX5090          | burst reasoning/heavy inference/code/quotes | quote logic, coding, refactor, complex mortgage scenario reasoning, heavy local models              | steady 24/7 drip parsing unless idle           |
| RTX3090 Ti       | steady operational AI                       | reply classification, STOP detection, campaign monitoring, webhook interpretation, memory summaries | heavy compile/coding workloads that starve ops |
| RTX3060          | lightweight fallback                        | Ollama, small classification, tagging, small summaries, low-priority tasks                          | heavy quote/coding/high-volume production ops  |
| RTX4060 optional | backup gateway                              | backup OpenClaw Gateway if actual                                                                   | assuming it exists without repo/host proof     |
| Orchestrator     | control plane                               | routing, queues, tunnels, health, bitnet.cpp CPU tasks, PocketTTS                                   | GPU-heavy inference                            |
