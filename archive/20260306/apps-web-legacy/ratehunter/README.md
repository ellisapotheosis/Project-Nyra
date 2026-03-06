# RateHunter Landing Page

Public-facing mortgage rate comparison and quote request platform for Project Nyra.

## Features

- Personalized mortgage quote requests
- Real-time rate comparisons
- Multiple loan product display
- Responsive design with Tailwind CSS
- SEO optimized
- Integration with Quote Engine API

## Tech Stack

- **Framework**: Next.js 15.1 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Deployment**: Docker

## Development

### Prerequisites

- Node.js >= 18.17.0
- pnpm >= 8.0.0

### Install Dependencies

```bash
pnpm install
```

### Run Development Server

```bash
pnpm dev
```

Visit http://localhost:3100

### Build for Production

```bash
pnpm build
pnpm start
```

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Required variables:
- `QUOTE_ENGINE_URL` - Quote Engine API endpoint
- `ORCHESTRATOR_URL` - Nyra Orchestrator API endpoint
- `NEXT_PUBLIC_API_BASE_URL` - Public API base URL

## Docker Deployment

Build and run with Docker:

```bash
docker build -t ratehunter:latest .
docker run -p 3100:3100 --env-file .env ratehunter:latest
```

Or with Infisical:

```bash
infisical run --env=production -- docker-compose up -d ratehunter
```

## Project Structure

```
apps/ratehunter/
├── app/
│   ├── api/
│   │   └── quote/
│   │       └── route.ts        # API route for quote requests
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   └── globals.css             # Global styles
├── components/
│   ├── quote-form.tsx          # Quote request form
│   ├── hero.tsx                # Hero section
│   ├── rate-table.tsx          # Rate comparison table
│   ├── features.tsx            # Features section
│   ├── testimonials.tsx        # Testimonials
│   └── footer.tsx              # Footer
├── lib/
│   └── utils.ts                # Utility functions
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # Tailwind configuration
├── Dockerfile                  # Production deployment
└── package.json                # Dependencies

## API Integration

The landing page communicates with the Quote Engine via `/api/quote` route:

```typescript
POST /api/quote
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+15551234567",
  "loan_amount": 500000,
  "property_value": 650000,
  "credit_score": 720,
  "loan_purpose": "purchase",
  "property_type": "single_family",
  "occupancy": "primary",
  "state": "CA",
  "zip_code": "90210"
}
```

## Deployment

### VPS Deployment (ratehunter.net)

1. SSH into VPS:
```bash
ssh root@ratehunter.net
```

2. Clone repository:
```bash
git clone https://github.com/yourusername/Project-Nyra.git
cd Project-Nyra/apps/ratehunter
```

3. Build and run:
```bash
pnpm install
pnpm build
pnpm start
```

Or with PM2:
```bash
pm2 start npm --name "ratehunter" -- start
pm2 save
```

### Cloudflare Configuration

1. Add DNS record:
   - Type: A
   - Name: @
   - Content: <VPS_IP>
   - Proxy: Enabled

2. Configure SSL/TLS:
   - Mode: Full (strict)
   - Always Use HTTPS: On

## License

Proprietary - Project Nyra
