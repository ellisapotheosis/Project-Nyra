# Home Assistant Host

## Role

Home Assistant Green (Raspberry Pi) as a local operations plane for the stack.

## Prepared assets

- Dashboard links config: `config/dashboards/nyra-ops-ui-links.yaml`
- Suggested add-on/package ideas: `config/packages/nyra-stack-recommendations.yaml`

## Planned Responsibilities

- LAN service observability dashboard and alerting.
- Local secret-dependent services that are better isolated from orchestrator/oracle.
- Automation bridge for power/network/device actions that affect worker uptime.
