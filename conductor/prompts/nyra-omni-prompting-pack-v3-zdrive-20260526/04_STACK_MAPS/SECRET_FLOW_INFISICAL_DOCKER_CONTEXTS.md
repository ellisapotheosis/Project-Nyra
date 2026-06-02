# Infisical + Docker Context Secret Flow

```txt
operator shell on orchestrator or worker-rtx5090
  │
  ├─ has INFISICAL_PROJECT_ID / CLIENT_ID / CLIENT_SECRET in .zshrc or terminal env
  │
  ├─ make stack-up HOST=worker-rtx3090ti
  │
  ├─ selects Docker context for target host
  │
  ├─ compose starts Infisical sidecar for stack
  │
  ├─ sidecar resolves runtime secrets
  │
  └─ target containers receive secrets without plaintext repo files
```

Rules:

- Never commit `.env` with real values.
- `.env.example` only.
- Target hosts should not need local plaintext secrets.
- Validate required bootstrap vars before `make stack-up`.
- Log secret presence/absence only, never values.
