# Nyra Admin UI

Modern admin interface for managing campaigns, leads, and customer interactions in the Project Nyra ecosystem.

## Features

### Campaign Manager
- **Campaign List**: View all campaigns with status, leads, and conversion metrics
- **Create/Edit**: Full CRUD operations for campaign management
- **Analytics Dashboard**: Detailed analytics with conversion rates, ROI, and performance metrics
- **Status Management**: Track campaigns through draft, active, paused, and completed states

### Lead Control Panel
- **Lead List**: Comprehensive lead management with filtering and search
- **Lead Details**: Full lead profiles with contact information and history
- **Campaign Assignment**: Assign leads to specific campaigns
- **Status Tracking**: Monitor leads through the sales funnel (new → contacted → qualified → converted)
- **Advanced Filtering**: Filter by status, campaign, and search across multiple fields

### AI Chat Integration
- **Dify Widget**: Embedded AI assistant powered by Dify
- **Context-Aware**: Chat assistance for campaigns, leads, and analytics
- **Customizable**: Theme and configuration options

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: React 18, Tailwind CSS
- **Icons**: Lucide React
- **State**: React Hooks
- **Testing**: Vitest + React Testing Library
- **API**: REST integration with Nyra backend services

## Getting Started

### Prerequisites

- Node.js 18+
- Running Nyra backend services (Nexus Orchestrator)
- Optional: Dify instance for AI chat

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Edit .env.local with your configuration
# - NEXT_PUBLIC_NEXUS_URL: Backend API URL
# - NEXT_PUBLIC_DIFY_WIDGET_URL: Dify widget URL
# - NEXT_PUBLIC_DIFY_APP_ID: Dify app ID
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3008
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Building

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
nyra-admin/
├── app/                    # Next.js app router pages
│   ├── campaigns/         # Campaign management
│   ├── leads/            # Lead management
│   ├── chat/             # AI chat interface
│   └── page.tsx          # Dashboard
├── components/
│   ├── campaigns/        # Campaign-specific components
│   ├── leads/           # Lead-specific components
│   ├── dify/            # Dify widget integration
│   └── ui/              # Reusable UI components
├── lib/
│   ├── api/             # API service layer
│   │   ├── client.ts   # Base HTTP client
│   │   ├── campaigns.ts # Campaign API
│   │   ├── leads.ts    # Lead API
│   │   └── quotes.ts   # Quote API
│   └── utils.ts         # Utility functions
├── types/
│   └── index.ts         # TypeScript types
└── tests/               # Component tests
```

## API Integration

The admin UI integrates with these backend services:

1. **Campaign Engine** (`/api/campaigns`)
   - Campaign CRUD operations
   - Analytics and metrics
   - Status management

2. **Lead Management** (`/api/leads`)
   - Lead CRUD operations
   - Campaign assignment
   - Filtering and search

3. **Quote API** (`/api/quotes`)
   - Quote generation
   - Status tracking

All services are accessed through the Nexus Orchestrator at `NEXT_PUBLIC_NEXUS_URL`.

## Components

### UI Components
- `Button`: Primary action buttons
- `Card`: Content containers
- `Table`: Data tables with sorting
- `Dialog`: Modal dialogs
- `Input`, `Select`: Form inputs
- `Badge`: Status indicators
- `Tabs`: Tabbed interfaces

### Feature Components
- `CampaignList`: Campaign table with actions
- `CampaignForm`: Create/edit campaign dialog
- `CampaignAnalytics`: Analytics dashboard
- `LeadList`: Lead table with filtering
- `LeadDetails`: Lead detail modal
- `LeadFilters`: Advanced filtering UI
- `CampaignAssignment`: Assign leads to campaigns
- `DifyWidget`: AI chat integration

## Configuration

### Environment Variables

Required:
- `NEXT_PUBLIC_NEXUS_URL`: Backend API URL

Optional:
- `NEXT_PUBLIC_DIFY_WIDGET_URL`: Dify widget JavaScript URL
- `NEXT_PUBLIC_DIFY_APP_ID`: Dify application ID
- `NEXT_PUBLIC_TWENTY_URL`: Twenty CRM iframe URL
- `PORT`: Server port (default: 3008)

### Dify Integration

To enable the AI chat:

1. Deploy a Dify instance
2. Create and publish an app
3. Set environment variables:
   ```env
   NEXT_PUBLIC_DIFY_WIDGET_URL=http://your-dify:8080/chatbot.js
   NEXT_PUBLIC_DIFY_APP_ID=your-app-id
   ```

## Development Mode

The app includes mock data fallbacks for development without backend services:

- Displays sample campaigns and leads
- Shows configuration instructions
- Enables UI development and testing

## Testing

Test coverage includes:

- **Component Tests**: UI component behavior
- **Integration Tests**: API service integration
- **Type Safety**: Full TypeScript coverage

Run tests:
```bash
npm test                    # Run once
npm test -- --watch        # Watch mode
npm test -- --coverage     # Coverage report
```

## Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3008
CMD ["npm", "start"]
```

### Environment

Ensure these environment variables are set:
- `NEXT_PUBLIC_NEXUS_URL`
- `NEXT_PUBLIC_DIFY_WIDGET_URL` (optional)
- `NEXT_PUBLIC_DIFY_APP_ID` (optional)

## Contributing

When adding new features:

1. Create components in appropriate directories
2. Add TypeScript types in `types/index.ts`
3. Add API services in `lib/api/`
4. Write tests in `tests/components/`
5. Update this README

## License

Part of Project Nyra - See main repository for license details.
