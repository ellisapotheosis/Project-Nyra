# Portainer Environments

Expected environments after owner UI setup:

| Environment      | Expected access             | Status                           |
| ---------------- | --------------------------- | -------------------------------- |
| orchestrator     | Edge Agent or tailnet Agent | Compose exists                   |
| worker-rtx5090   | Edge Agent or tailnet Agent | Owner UI enrollment required     |
| worker-rtx3090ti | Edge Agent or tailnet Agent | Owner UI enrollment required     |
| worker-rtx3060   | Edge Agent or tailnet Agent | Owner UI enrollment required     |
| oracle-vps       | Portainer Server (CE)       | API token required for repo sync |
| homeassistant    | dashboard link only         | No agent by default              |
