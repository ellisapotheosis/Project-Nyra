#!/bin/bash
# Runs inside the ClickHouse initdb.d entrypoint — CLICKHOUSE_* vars are pre-set
# by the container environment from docker-compose.openlit.yml.
set -e

clickhouse-client \
    --user="${CLICKHOUSE_USER:-default}" \
    --password="${CLICKHOUSE_PASSWORD:-OPENLIT}" \
    --query="CREATE DATABASE IF NOT EXISTS \`${CLICKHOUSE_DATABASE:-openlit}\`"

echo "OpenLIT ClickHouse database '${CLICKHOUSE_DATABASE:-openlit}' ready."
