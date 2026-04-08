FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY services/crm-api/package.json services/crm-api/tsconfig.json ./services/crm-api/
COPY services/crm-api/src ./services/crm-api/src
COPY packages/crm-client/package.json packages/crm-client/tsconfig.json ./packages/crm-client/

RUN corepack enable && pnpm install --frozen-lockfile
RUN pnpm --filter nyra-crm-api build

EXPOSE 4001
CMD ["pnpm", "--filter", "nyra-crm-api", "start"]
