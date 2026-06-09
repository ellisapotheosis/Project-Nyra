FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY package.json ./
COPY tsconfig.base.json ./
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY services/crm-api/package.json services/crm-api/tsconfig.json ./services/crm-api/
COPY services/crm-api/src ./services/crm-api/src
COPY packages/crm-client/package.json packages/crm-client/tsconfig.json ./packages/crm-client/
COPY packages/crm-client/src ./packages/crm-client/src
COPY packages/crm-types/package.json packages/crm-types/tsconfig.json ./packages/crm-types/
COPY packages/crm-types/src ./packages/crm-types/src

RUN corepack enable && pnpm install --frozen-lockfile
RUN pnpm --filter nyra-crm-api build

EXPOSE 4001
CMD ["pnpm", "--filter", "nyra-crm-api", "start"]
