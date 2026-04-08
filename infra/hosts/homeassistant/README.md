# Home Assistant Host

## Role

Home Assistant Green (Raspberry Pi) as a local operations plane for the stack.

## Prepared assets

- Dashboard links config: `config/dashboards/nyra-ops-ui-links.yaml`
- Suggested add-on/package ideas: `config/packages/nyra-stack-recommendations.yaml`

## Apply into Home Assistant

1. Copy dashboard YAML into Home Assistant dashboards directory.
2. Copy package YAML into Home Assistant `packages/` and include packages in `configuration.yaml`.
3. Restart Home Assistant.
4. Verify panels for Webapp, Archon UI, Open WebUI, and Portainer appear in sidebar.

## Planned Responsibilities

- LAN service observability dashboard and alerting.
- Local secret-dependent services that are better isolated from orchestrator/oracle.
- Automation bridge for power/network/device actions that affect worker uptime.
