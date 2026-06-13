#!/usr/bin/env bash
set -euo pipefail

mapfile -t offenders < <(
  find infra -type f \
    \( -iname '*compose*.yml' \
    -o -iname '*compose*.yaml' \
    -o -iname 'compose.yml' \
    -o -iname 'docker-compose.yml' \
    -o -iname 'docker-compose.*.yml' \
    -o -iname 'docker-compose.*.yaml' \) \
    ! -path 'infra/hosts/*' \
    | sort
)

if ((${#offenders[@]} > 0)); then
  printf 'Compose source-of-truth violation: compose files exist outside infra/hosts/*\n' >&2
  printf '%s\n' "${offenders[@]}" >&2
  exit 1
fi

printf 'OK: all compose source files are under infra/hosts/*\n'
