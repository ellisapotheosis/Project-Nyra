#!/bin/bash
# Continuous Monitoring Example
# Add to crontab for regular tunnel health checks

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VALIDATION_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ALERT_EMAIL="${ALERT_EMAIL:-admin@yourdomain.com}"

# Lightweight monitoring - quick checks only
export TIMEOUT_SECONDS=15
export RETRY_COUNT=2
export PERFORMANCE_ITERATIONS=3

# Run connectivity and accessibility tests
"$VALIDATION_DIR/test-cloudflare-tunnels.sh" \
  --connectivity \
  --accessibility \
  > /tmp/tunnel-monitor.log 2>&1

EXIT_CODE=$?

# Send alert on failure
if [ $EXIT_CODE -ne 0 ]; then
    HOSTNAME=$(hostname)
    TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

    # Email alert (requires mail command)
    if command -v mail >/dev/null 2>&1; then
        cat /tmp/tunnel-monitor.log | mail -s "ALERT: Cloudflare Tunnel Test Failed on $HOSTNAME at $TIMESTAMP" "$ALERT_EMAIL"
    fi

    # Log to syslog
    logger -t cloudflare-tunnel-monitor "CRITICAL: Tunnel tests failed on $HOSTNAME"

    # Slack webhook (if configured)
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST "$SLACK_WEBHOOK_URL" \
          -H 'Content-Type: application/json' \
          -d "{\"text\":\"🚨 Cloudflare Tunnel Test Failed on $HOSTNAME at $TIMESTAMP\"}"
    fi
fi

# Cleanup
rm -f /tmp/tunnel-monitor.log

exit $EXIT_CODE
