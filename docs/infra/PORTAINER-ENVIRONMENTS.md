# Portainer Environments

Expected environments after owner UI setup:

| Environment      | Expected access                           | Status                       |
| ---------------- | ----------------------------------------- | ---------------------------- |
| orchestrator     | local Docker socket from Portainer Server | Compose exists               |
| worker-rtx5090   | Edge Agent or tailnet Agent               | Owner UI enrollment required |
| worker-rtx3090ti | Edge Agent or tailnet Agent               | Owner UI enrollment required |
| worker-rtx3060   | Edge Agent or tailnet Agent               | Owner UI enrollment required |
| oracle-vps       | Edge Agent recommended                    | Owner UI enrollment required |
| homeassistant    | dashboard link only                       | No agent by default          |
