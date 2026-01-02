#!/usr/bin/env bash
set -e
export OPENAI_API_KEY=${OPENAI_API_KEY:-"sk-..."}
curl -sL https://raw.githubusercontent.com/mem0ai/mem0/main/openmemory/run.sh | OPENAI_API_KEY=$OPENAI_API_KEY bash
