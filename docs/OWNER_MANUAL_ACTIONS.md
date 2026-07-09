## Infisical: HASS_TOKEN — Home Assistant Long-Lived Token

**Why manual:** The HASS_TOKEN at `/machines/homeassistant` is a placeholder (`change-me-...`).
The `/hosts/homeassistant` path has a broken self-referential reference (`${HASS_TOKEN}`).
Neither can be auto-migrated — a real token must be generated first.

**Steps:**

1. Log in to Home Assistant (http://homeassistant.local:8123 or Tailscale address)
2. Go to Settings → Profile (bottom-left user icon) → Security tab → Long-Lived Access Tokens
3. Click **Create token**, name it `project-nyra-infisical`, copy the generated token
4. Set it in Infisical (all 3 envs):
   ```bash
   for env in dev staging prod; do
     infisical secrets set "HASS_TOKEN=<paste-token>" --env=$env --path=/hosts/homeassistant
   done
   ```
5. Delete the stale placeholder from `/machines/homeassistant` after verifying the above works.

**Current broken state:**

- `/machines/homeassistant:HASS_TOKEN` = `change-me-generate-in-home-assistant-settings-long-lived-tokens`
- `/hosts/homeassistant:HASS_TOKEN` = `${HASS_TOKEN}` (self-referential — will not resolve)
