SHELL := /usr/bin/env bash

up:
	./scripts/up.sh all

up-dashboard:
	./scripts/up.sh dashboard

up-core:
	./scripts/up.sh core

up-orchestrator:
	./scripts/up.sh orchestrator

down:
	./scripts/down.sh

ps:
	docker compose ps

logs:
	docker compose logs -f --tail=200

doctor:
	./scripts/doctor.sh
