# Creates remote Docker contexts over SSH (recommended) instead of exposing dockerd on 2375.
# Requires: OpenSSH client, and SSH access to each worker.
# Tip: use Tailscale SSH to avoid opening any LAN ports.

$ErrorActionPreference = 'Stop'

$contexts = @(
  @{ Name = 'worker-rtx5090'; Host = '100.64.0.11' },
  @{ Name = 'worker-rtx3060'; Host = '100.64.0.12' },
  @{ Name = 'worker-rtx3090ti'; Host = '100.64.0.13' }
)

foreach ($c in $contexts) {
  $name = $c.Name
  $host = $c.Host
  Write-Host "Creating Docker context $name -> ssh://$host" -ForegroundColor Cyan

  # If you need a username: ssh://username@$host
  docker context create $name --docker "host=ssh://$host" --description "NYRA GPU worker ($host)" 2>$null || \
    docker context update $name --docker "host=ssh://$host"
}

Write-Host "\nContexts:" -ForegroundColor Green
docker context ls
