#!/bin/sh
set -eu

SLACK_URL="${ALERTMANAGER_SLACK_WEBHOOK_URL:-}"
PD_KEY="${ALERTMANAGER_PAGERDUTY_KEY:-}"
CONFIG="/tmp/alertmanager-generated.yml"

SLACK_ACTIVE=0
PD_ACTIVE=0
case "$SLACK_URL" in
  ""| change-me*) ;;
  *) SLACK_ACTIVE=1 ;;
esac
case "$PD_KEY" in
  ""| change-me*) ;;
  *) PD_ACTIVE=1 ;;
esac

cat > "$CONFIG" <<'YAML'
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'severity', 'job']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 12h
  receiver: 'null'
YAML

if [ "$SLACK_ACTIVE" = 1 ] || [ "$PD_ACTIVE" = 1 ]; then
  printf "  routes:\n" >> "$CONFIG"
  [ "$PD_ACTIVE"    = 1 ] && printf "    - match:\n        severity: critical\n      receiver: pagerduty\n" >> "$CONFIG"
  [ "$SLACK_ACTIVE" = 1 ] && printf "    - match:\n        severity: warning\n      receiver: slack\n"     >> "$CONFIG"
fi

printf "\nreceivers:\n  - name: 'null'\n" >> "$CONFIG"

[ "$SLACK_ACTIVE" = 1 ] && printf "  - name: slack\n    slack_configs:\n      - api_url: '%s'\n        channel: '#nyra-alerts'\n        send_resolved: true\n" "$SLACK_URL" >> "$CONFIG"
[ "$PD_ACTIVE"    = 1 ] && printf "  - name: pagerduty\n    pagerduty_configs:\n      - service_key: '%s'\n        send_resolved: true\n" "$PD_KEY" >> "$CONFIG"

cat >> "$CONFIG" <<'YAML'

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'job']
YAML

echo "[alertmanager-entrypoint] config ready (slack=$SLACK_ACTIVE pagerduty=$PD_ACTIVE)"
exec /bin/alertmanager --config.file="$CONFIG" --storage.path=/alertmanager "$@"
