#!/bin/bash
set -euo pipefail

echo "[OpenLIT ClickHouse] Initializing database ${CLICKHOUSE_DATABASE}"
clickhouse-client --query "CREATE DATABASE IF NOT EXISTS ${CLICKHOUSE_DATABASE}"

echo "[OpenLIT ClickHouse] Initialization complete"
