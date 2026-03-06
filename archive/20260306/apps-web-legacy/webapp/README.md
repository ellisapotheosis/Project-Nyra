# Nyra Web Application

Unified web application workspace containing mortgage services and UI components.

## Structure

```
webapp/
├── mortgage-services/    # Next.js app for mortgage service management
├── mortgage-ui/          # Next.js app for mortgage UI components with n8n integration
├── public/               # Shared public assets
│   └── examples/         # Example forms and templates
├── src/                  # Shared source code and orchestration
└── package.json          # Workspace configuration
```

## Applications

### Mortgage Services (`mortgage-services/`)
- **Framework**: Next.js 15.4.7
- **Purpose**: Mortgage service management and calculations
- **Tech Stack**: React 19, TypeScript, Radix UI, Tailwind CSS, Dyad component tagger
- **Port**: 3000 (default Next.js dev)

### Mortgage UI (`mortgage-ui/`)
- **Framework**: Next.js 15.4.7
- **Purpose**: Mortgage UI components and workflows
- **Tech Stack**: React 19, TypeScript, Radix UI, Tailwind CSS, n8n-core integration
- **Port**: 3001 (configurable)

## Development

### Install Dependencies
```bash
# From monorepo root
pnpm install

# From this directory
pnpm install
```

### Run Development Servers
```bash
# Run both apps in parallel
pnpm dev

# Run individual apps
pnpm dev:services   # Mortgage Services only
pnpm dev:ui         # Mortgage UI only
```

### Build
```bash
# Build both apps
pnpm build

# Build individual apps
pnpm build:services
pnpm build:ui
```

### Production
```bash
# Start both apps
pnpm start

# Start individual apps
pnpm start:services
pnpm start:ui
```

### Testing & Quality
```bash
pnpm test       # Run tests
pnpm lint       # Lint code
pnpm typecheck  # Type checking
pnpm clean      # Clean build artifacts
```

## Integration with Monorepo

This workspace is part of the Project Nyra monorepo:
- Managed by **pnpm workspaces**
- Build orchestration via **Turbo**
- Shared dependencies with other apps and services

## Dependencies

### Shared UI Components
- Radix UI primitives
- Tailwind CSS + tailwindcss-animate
- Lucide React icons
- Shadcn/ui components

### Form Handling
- React Hook Form
- Zod validation
- @hookform/resolvers

### State & Data
- React 19 with Context API
- date-fns for date handling
- recharts for data visualization

### Special Integrations
- **mortgage-services**: Dyad component observability
- **mortgage-ui**: n8n-core workflow automation

## Configuration

### Environment Variables
Create `.env.local` in each app directory:

```bash
# mortgage-services/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
DATABASE_URL=postgresql://...

# mortgage-ui/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
N8N_WEBHOOK_URL=http://localhost:5678/webhook/...
```

### Port Configuration
Default ports can be changed in each app's `package.json`:

```json
"scripts": {
  "dev": "next dev -p 3001"
}
```

## Claude Flow Integration

This workspace has Claude Flow V3 orchestration capabilities:

```bash
# Initialize swarm for webapp development
npx @claude-flow/cli@latest swarm init --topology hierarchical

# Spawn frontend specialists
npx @claude-flow/cli@latest agent spawn -t frontend-specialist
```

See `CLAUDE.md` for detailed agent configuration.

## Architecture

### Shared Resources
- Common types and utilities in `src/`
- Shared Claude Flow orchestration in `src/orchestration/`
- Common public assets in `public/`

### Independent Apps
- Each app has its own Next.js configuration
- Separate build and deployment pipelines
- Can be developed and deployed independently

## Consolidation History

This workspace was consolidated from:
- `ingestion/nyra-webapp-apps-modules-ingest/nyra-front-end/mortgage-services/`
- `ingestion/nyra-webapp-apps-modules-ingest/nyra-front-end/mortgage-ui/`
- `ingestion/nyra-webapp-apps-modules-ingest/intake-form.html` → `public/examples/`

See `docs/reports/NYRA-WEBAPP-CONSOLIDATION.md` for detailed consolidation report.

## Contributing

1. Create feature branch from `main`
2. Make changes in appropriate app directory
3. Test locally: `pnpm dev` and `pnpm test`
4. Create PR with descriptive title
5. Ensure CI passes before merge

## Support

- Documentation: See `/docs` in monorepo root
- Issues: GitHub Issues
- Claude Flow: `npx @claude-flow/cli@latest doctor`
