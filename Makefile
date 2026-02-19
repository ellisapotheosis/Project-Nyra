.PHONY: init up down clean logs verify

init:
	cp infra/docker/orchestrator/.env.example infra/docker/orchestrator/.env
	cp infra/docker/worker-rtx3060/env.example infra/docker/worker-rtx3060/.env 2>/dev/null || true
	cp infra/docker/worker-rtx5090/env.example infra/docker/worker-rtx5090/.env 2>/dev/null || true
	cp infra/docker/worker-rtx3090ti/env.example infra/docker/worker-rtx3090ti/.env 2>/dev/null || true
	@echo "Created .env files. Please fill them with your secrets!"

up:
	docker compose -f infra/docker/orchestrator/docker-compose.nexus.yml \
                 -f infra/docker/orchestrator/docker-compose.core.yml \
                 -f infra/docker/orchestrator/docker-compose.memory.yml \
                 -f infra/docker/orchestrator/docker-compose.workflows.yml \
                 -f infra/docker/orchestrator/docker-compose.twenty.yml \
                 up -d --remove-orphans

down:
	docker compose -f infra/docker/orchestrator/docker-compose.nexus.yml \
                   -f infra/docker/orchestrator/docker-compose.core.yml \
                   -f infra/docker/orchestrator/docker-compose.memory.yml \
                   -f infra/docker/orchestrator/docker-compose.workflows.yml \
                   -f infra/docker/orchestrator/docker-compose.twenty.yml \
                   down

logs:
	docker compose -f infra/docker/orchestrator/docker-compose.nexus.yml \
                   -f infra/docker/orchestrator/docker-compose.core.yml \
                   -f infra/docker/orchestrator/docker-compose.memory.yml \
                   -f infra/docker/orchestrator/docker-compose.workflows.yml \
                   -f infra/docker/orchestrator/docker-compose.twenty.yml \
                   logs -f

verify:
	bash infra/scripts/health-check-all.sh
	bash infra/scripts/verify-memory.sh

clean:
	bash infra/scripts/infra-cleanup.sh
