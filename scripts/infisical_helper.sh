#!/bin/bash
# Helper script to query Infisical safely using machine credentials

# Source environment variables for Infisical auth
if [ -f /home/ellisapotheosis/.zsh/99-secrets.zsh ]; then
    source /home/ellisapotheosis/.zsh/99-secrets.zsh
else
    echo "Secrets file not found!" >&2
    exit 1
fi

# Obtain access token
TOKEN=$(infisical login --method=universal-auth --client-id="$INFISICAL_UNIVERSAL_AUTH_CLIENT_ID" --client-secret="$INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET" --plain)

if [ -z "$TOKEN" ]; then
    echo "Failed to obtain token from Infisical!" >&2
    exit 1
fi

# Execute the infisical command with token and project ID pre-populated
infisical "$@" --token="$TOKEN" --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef"
