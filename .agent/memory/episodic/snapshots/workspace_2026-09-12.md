# Current workspace state

## Active hypotheses

- Resolved: the `preflight-port` failure was caused by a second OpenClaw
  launch colliding with the already-running systemd-managed gateway on port
  `18789`; it was not a ghost socket, Docker bind, or WSL namespace leak.

## Evidence and remediation

- WSL listener owner was OpenClaw PID `79765`, listening on
  `127.0.0.1:18789` and `100.64.0.11:18789`; HTTP health returned 200.
- Docker had no container publishing `18789`.
- The gateway service was restarted and is now ready as PID `90182`; matching
  OpenClaw 2026.9.1 health and config validation pass.
- `openclaw-node.service` referenced a missing executable and was producing
  continuous `203/EXEC` restarts. It was stopped and disabled; its unit file
  remains in place for a separately specified node implementation.
- No repository executable named `preflight-port` was found, so no unnamed
  pipeline was launched.

## Stop condition

The local gateway lifecycle is healthy and verified. Do not shut down WSL,
kill unrelated processes, purge OpenClaw state, or remove the backup archive
without new evidence.
