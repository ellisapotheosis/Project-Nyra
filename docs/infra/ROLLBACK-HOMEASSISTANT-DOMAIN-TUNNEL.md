# Rollback: Home Assistant, Domain, Tunnel

1. Restore previous cloudflared configs from timestamped backups or from Git.
2. Remove newly added `projectnyra.com` DNS records only after recording current values.
3. Detach broken Cloudflare Pages custom domains from the wrong Pages project, then reattach to the correct project.
4. Revert `infra/hosts/homeassistant/dashboards/nyra-command-deck.yaml`.
5. Stop or disable `nyra-status-bridge` if status output is incorrect.
6. Restore Portainer compose from Git or existing backup before restarting Portainer.
7. Re-run DNS, tunnel ingress, URL header, Home Assistant, and Portainer smoke checks.
