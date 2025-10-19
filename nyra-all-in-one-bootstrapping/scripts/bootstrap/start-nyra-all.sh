#!/usr/bin/env bash
docker compose -f infra/docker/compose.nyra.yml --profile gateway --profile mcp-core up -d
