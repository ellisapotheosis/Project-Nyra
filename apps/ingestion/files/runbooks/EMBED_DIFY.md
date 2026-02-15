# Embed Dify Chat into Nyra Admin UI

## 1) Bring up Dify
```bash
docker compose -f infra/docker-compose.dev.yml up -d
```

## 2) Create & publish a Dify app
- Create a Chat App in Dify.
- Apply `prompts/compliance/logistics_guardrail.md` as system/guardrail.
- Publish the app.

## 3) Configure Nyra Admin
```bash
cd apps/nyra-admin
cp .env.example .env.local
# set NEXT_PUBLIC_DIFY_APP_ID
pnpm install
pnpm dev
```

Open:
- http://localhost:3002/chat
