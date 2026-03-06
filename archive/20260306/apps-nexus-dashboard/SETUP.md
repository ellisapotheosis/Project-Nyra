# Nexus Dashboard - Quick Setup Guide

## Installation

### From the monorepo root:

```bash
# Install all dependencies (including nexus-dashboard)
pnpm install

# Start the dashboard in development mode
pnpm --filter @nyra/nexus-dashboard dev
```

### From the dashboard directory:

```bash
cd apps/nexus-dashboard

# Install dependencies
pnpm install

# Create environment file
cp .env.example .env.local

# Start development server
pnpm dev
```

The dashboard will be available at **http://localhost:3005**

## Environment Configuration

Edit `.env.local`:

```env
# Required: Nexus Router API URL
NEXT_PUBLIC_NEXUS_URL=http://localhost:8000

# Optional: WebSocket URL (if different from API)
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws

# Optional: API Key
NEXT_PUBLIC_API_KEY=your-api-key-here
```

## Prerequisites

1. **Nexus Router** must be running on port 8000
2. **Node.js 18+** installed
3. **pnpm** package manager installed

## Verify Installation

1. Navigate to http://localhost:3005
2. You should see the dashboard homepage with metrics
3. Check the sidebar for navigation to different sections

## Demo Mode

The dashboard includes demo data for development. If the Nexus Router API is not available, the dashboard will display mock data automatically.

## Troubleshooting

### Port Already in Use

Change the port in `package.json`:

```json
"scripts": {
  "dev": "next dev -p 3006"  // Change to any available port
}
```

### API Connection Issues

1. Verify Nexus Router is running: `curl http://localhost:8000/health`
2. Check CORS settings on the Nexus Router
3. Verify the `NEXT_PUBLIC_NEXUS_URL` in `.env.local`

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules
pnpm install

# Clear Next.js cache
rm -rf .next
pnpm dev
```

## Development

### Adding New Features

1. Create components in `src/components/`
2. Add pages in `src/app/`
3. Update the store in `src/lib/store.ts`
4. Add API methods in `src/lib/api.ts`

### Styling

- Use Tailwind utility classes
- Follow the OKLCH color system defined in `globals.css`
- Use shadcn/ui components for consistency

### Type Safety

All data structures are typed in `src/lib/store.ts`. Update interfaces when adding new features.

## Production Deployment

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

For deployment to Vercel, Netlify, or other platforms, follow their Next.js deployment guides.

## Features Overview

- **Dashboard**: Real-time metrics and performance charts
- **MCP Servers**: Monitor and test MCP server connections
- **Tool Search**: Fuzzy search across all available tools
- **GPU Workers**: Monitor GPU utilization and temperature
- **Model Routes**: Configure request routing patterns
- **Configuration**: System settings and preferences

Enjoy using the Nexus Router Dashboard!
