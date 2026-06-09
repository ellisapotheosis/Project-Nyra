docker context ls

foreach ($context in @("orchestrator", "oracle-vps", "worker-rtx5090", "worker-rtx3090ti", "worker-rtx3060")) {
  docker context inspect $context *> $null
  if ($LASTEXITCODE -eq 0) {
    Write-Output "context ok: $context"
  } else {
    Write-Output "context missing: $context"
  }
}

