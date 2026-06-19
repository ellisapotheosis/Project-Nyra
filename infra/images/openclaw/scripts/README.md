# OpenClaw Script Runbook

## Scripts

- `up.sh`
  - Primary launcher for OpenClaw overlays.
  - Validates env files and required keys.
  - Auto-builds image when missing.
  - Supports optional overlays:
    - `--with-voice`
    - `--with-ui`

- `down.sh`
  - Stops core/voice/ui overlays.
  - Supports:
    - `--keep-orphans`
    - `--skip-voice`
    - `--skip-ui`

- `doctor.sh`
  - Preflight validation for commands, files, env values, JSON/YAML parse, compose config.

- `status.sh`
  - Prints state/health/image for OpenClaw-related containers.

## Typical workflow

```bash
bash infra/openclaw/scripts/doctor.sh
bash infra/openclaw/scripts/up.sh --with-voice --with-ui
bash infra/openclaw/scripts/status.sh
```

Stop:

```bash
bash infra/openclaw/scripts/down.sh
```

## Notes

- These scripts intentionally avoid writing secrets to repo files.
- Use `infra/env/openclaw*.env` files (gitignored) derived from examples.
