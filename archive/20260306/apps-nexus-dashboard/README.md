# Nexus Router Dashboard

A modern, production-ready dashboard for monitoring and managing the Nexus Router AI orchestration platform.

## Features

- **Real-time Monitoring**: Live metrics and performance data via WebSocket
- **MCP Server Management**: Monitor and manage Model Context Protocol servers
- **Tool Search**: Fuzzy search across all available tools with advanced filtering
- **GPU Worker Status**: Track GPU utilization, temperature, and VRAM usage
- **Model Route Configuration**: Configure and manage request routing patterns
- **Beautiful UI**: Built with shadcn/ui and Tailwind CSS v4 with OKLCH colors

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI Components**: shadcn/ui + MagicUI
- **Styling**: Tailwind CSS v4 with OKLCH color space
- **Charts**: Recharts
- **State Management**: Zustand
- **Search**: Fuse.js (fuzzy search)
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Nexus Router running on http://localhost:8000

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local

# Update the Nexus Router URL if needed
# NEXT_PUBLIC_NEXUS_URL=http://localhost:8000
```

### Development

```bash
# Run development server
pnpm dev

# Access dashboard at http://localhost:3005
```

### Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_NEXUS_URL` | Nexus Router API base URL | `http://localhost:8000` |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL for real-time updates | `ws://localhost:8000/ws` |
| `NEXT_PUBLIC_API_KEY` | Optional API key for authenticated requests | - |
| `NEXT_PUBLIC_DEBUG` | Enable debug mode | `false` |

## Pages

- **/** - Dashboard with metrics and performance charts
- **/servers** - MCP server management
- **/tools** - Tool search with fuzzy matching
- **/gpu** - GPU worker monitoring
- **/routes** - Model route configuration
- **/config** - System configuration

## Project Structure

```
nexus-dashboard/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── layout.tsx       # Root layout with sidebar
│   │   ├── page.tsx         # Dashboard home
│   │   ├── servers/         # MCP servers page
│   │   ├── tools/           # Tool search page
│   │   ├── gpu/             # GPU workers page
│   │   ├── routes/          # Model routes page
│   │   └── config/          # Configuration page
│   ├── components/          # React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── sidebar.tsx      # Navigation sidebar
│   │   ├── metric-card.tsx  # Metric display card
│   │   ├── server-card.tsx  # MCP server card
│   │   ├── gpu-worker-card.tsx
│   │   ├── tool-search.tsx  # Fuzzy search component
│   │   ├── model-route-config.tsx
│   │   └── performance-chart.tsx
│   └── lib/                 # Utilities and logic
│       ├── utils.ts         # Helper functions
│       ├── store.ts         # Zustand store
│       └── api.ts           # API client
├── public/                  # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## API Integration

The dashboard connects to Nexus Router via:

1. **REST API**: Fetch initial data and perform updates
2. **WebSocket**: Receive real-time updates for metrics, GPU status, etc.

### API Endpoints (Expected)

- `GET /api/servers` - List MCP servers
- `GET /api/tools` - List available tools
- `GET /api/gpu/workers` - List GPU workers
- `GET /api/routes` - List model routes
- `GET /api/metrics` - Get system metrics
- `PATCH /api/routes/:id` - Update route configuration
- `POST /api/servers/:id/test` - Test server connection

### WebSocket Events

- `metrics` - Dashboard metrics update
- `gpu_update` - GPU worker status update
- `chart` - Performance chart data point

## Customization

### Colors

The dashboard uses OKLCH color space for better perceptual uniformity. Edit `src/app/globals.css` to customize the theme.

### Components

All UI components are in `src/components/ui/` and can be customized to match your brand.

### API Client

The API client is in `src/lib/api.ts`. Update the base URL and endpoints to match your Nexus Router implementation.

## Development

### Adding New Pages

1. Create a new directory in `src/app/`
2. Add a `page.tsx` file
3. Update the sidebar navigation in `src/components/sidebar.tsx`

### Adding New Components

1. Create component in `src/components/`
2. Import and use in your pages
3. Use shadcn/ui primitives for consistency

## Troubleshooting

### WebSocket Connection Fails

- Ensure Nexus Router is running on the correct port
- Check CORS settings on the API
- Verify WebSocket URL in `.env.local`

### API Requests Fail

- Check `NEXT_PUBLIC_NEXUS_URL` in `.env.local`
- Ensure Nexus Router API is accessible
- Check browser console for CORS errors

### Styles Not Loading

- Run `pnpm install` to ensure all dependencies are installed
- Clear Next.js cache: `rm -rf .next`
- Rebuild: `pnpm build`

## License

MIT

## Support

For issues and questions, please open a GitHub issue or contact the maintainers.
