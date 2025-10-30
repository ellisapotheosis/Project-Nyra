# Claude-Flow: Nyra cleanup & wiring
1) Inventory duplicate configs (ruff/mypy/prettier/eslint/tsconfig/docker-compose/envs).
2) Propose canonical "master" configs under nyra-configs/master and refactor references.
3) Start services: docker compose up (nyra-up), verify Open WebUI, Pipelines, mcpo, Qdrant.
4) Verify A2A Agent Card and AG2 host status.
5) Produce PR branch `setup/nyra-wiring` + report.
