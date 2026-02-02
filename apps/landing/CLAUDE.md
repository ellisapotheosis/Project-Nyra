# Landing Pages Parent - Claude Flow V3 Configuration

> **Marketing and lead generation landing pages**
>
> **Inherits from**: `apps/CLAUDE.md`
> **Stack**: Next.js 15/Vite, React 18-19, TypeScript 5, Tailwind CSS 4
> **Port**: 3001 (RateHunter landing), 3000 (others)
> **Type**: SSG/Landing Pages (public facing)

## Overview

Landing Pages contains marketing-focused, public-facing landing pages for Project Nyra. This is the parent configuration document for all landing page applications.

### Landing Page Applications

| App | Port | Purpose | Stack |
|-----|------|---------|-------|
| **ratehunter-landing** | 3001 | Mortgage rate discovery landing | Next.js 15 SSG |
| Other landing pages | 3000 | Additional marketing landing pages | Vite/React |

See `apps/landing/ratehunter-landing/CLAUDE.md` for RateHunter landing-specific configuration.

## App-Specific Configuration

### Routes

- `/` - Main landing page (hero, features, CTA)
- `/about` - About page (company, team, mission)
- `/contact` - Contact form page
- `/pricing` - Pricing plans and features
- `/blog` - Blog listing and articles
- `/blog/:slug` - Individual blog post
- `/faq` - Frequently asked questions
- `/terms` - Terms of service
- `/privacy` - Privacy policy

### Features

- Responsive marketing website
- Lead capture forms with validation
- Contact form with email notifications
- Blog/content system
- SEO optimization
- Analytics and conversion tracking
- Email subscription signup
- Testimonials and case studies
- FAQ accordion
- Social media links

### Dependencies

**Shared Packages**:
- `@nyra/ui` - Shared UI component library
- `@nyra/utils` - Shared utilities and helpers

**App-Specific Dependencies**:
- `react-hook-form` - Form state management
- `zod` - Schema validation
- `axios` - HTTP client
- `date-fns` - Date utilities
- `clsx` - Utility for conditional CSS classes
- `react-markdown` - Markdown rendering for blog posts
- `lucide-react` - Icon library

### Environment Variables

```bash
# API Configuration
VITE_API_URL=http://localhost:3000/api
VITE_API_TIMEOUT=30000

# Email Configuration
VITE_EMAIL_SERVICE_URL=http://localhost:3000/api/email
VITE_FROM_EMAIL=noreply@nyra.com

# Analytics
VITE_ANALYTICS_ID=landing-page
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_ENVIRONMENT=development

# SEO
VITE_SITE_URL=http://localhost:3000
VITE_SITE_TITLE=Nyra - Modern Mortgage Solutions
VITE_SITE_DESCRIPTION=Discover better mortgage rates and solutions

# Features
VITE_FEATURE_BLOG=true
VITE_FEATURE_NEWSLETTER=true
VITE_FEATURE_CONTACT_FORM=true
```

### Container Configuration

- **Base Image**: node:18-alpine
- **Port**: 3000
- **Build Command**: `pnpm build`
- **Start Command**: `pnpm start`
- **Dockerfile**: `Dockerfile` in app root
- **Static Generation**: Pre-render for SEO optimization

## Testing (TDD)

### Test Structure

- **Test Files**: `src/**/*.test.tsx`, `src/**/*.test.ts`
- **Test Utilities**: `tests/utils` (shared test helpers)
- **Mock Data**: `tests/fixtures/` (blog posts, testimonials, etc.)
- **Coverage Requirement**: 80%+ for all source files

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test -- ContactForm.test.tsx

# Run tests matching pattern
pnpm test -- --grep "form"
```

### Key Test Scenarios

1. **Lead Capture Forms**
   - Form validation with Zod
   - Email format validation
   - Required field validation
   - Form submission handling
   - Success/error messages

2. **Contact Form**
   - Name, email, subject, message validation
   - Form submission
   - Email notification
   - User confirmation

3. **Navigation**
   - Links work correctly
   - Mobile menu toggle
   - Active route highlighting
   - Responsive layout

4. **Content Rendering**
   - Blog posts render correctly
   - Markdown parsing works
   - Images load properly
   - Testimonials display

## API Integration

- **Backend URL**: `http://localhost:3000/api` (development)
- **Authentication**: Public endpoints, no auth required
- **Error Handling**: User-friendly error messages
- **HTTP Client**: Axios (configured in shared utils)
- **Email**: Contact form sends to backend email service

### API Endpoints Used

```
GET  /api/blog              - Get blog posts list
GET  /api/blog/:slug        - Get individual blog post
POST /api/contact           - Submit contact form
POST /api/newsletter        - Subscribe to newsletter
POST /api/lead-capture      - Submit lead capture form
```

## Development Commands

### Local Development

```bash
# Install dependencies
pnpm install

# Start development server (port 3000)
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Generate static site
pnpm build:static
```

### Testing & Quality

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage

# Lint and format
pnpm lint && pnpm format

# Type check
pnpm type-check
```

### Docker Development

```bash
# Build Docker image
docker build -t landing-page:latest .

# Run container locally
docker run -p 3000:3000 landing-page:latest

# Docker Compose (from project root)
docker-compose -f infra/docker/docker-compose.yml up landing
```

## File Structure

```
apps/landing/
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── Testimonials.tsx
│   │   ├── PricingTable.tsx
│   │   ├── ContactForm.tsx
│   │   ├── Newsletter.tsx
│   │   ├── BlogCard.tsx
│   │   ├── FAQAccordion.tsx
│   │   └── ...
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── About.tsx
│   │   ├── Contact.tsx
│   │   ├── Pricing.tsx
│   │   ├── Blog.tsx
│   │   ├── BlogPost.tsx
│   │   ├── FAQ.tsx
│   │   ├── Terms.tsx
│   │   └── Privacy.tsx
│   ├── hooks/
│   │   ├── useBlog.ts
│   │   ├── useContactForm.ts
│   │   ├── useNewsletter.ts
│   │   └── ...
│   ├── api/
│   │   ├── blog.ts
│   │   ├── contact.ts
│   │   ├── newsletter.ts
│   │   └── ...
│   ├── types/
│   │   ├── blog.ts
│   │   ├── contact.ts
│   │   └── ...
│   ├── content/
│   │   ├── blog/
│   │   │   ├── post-1.md
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── faq.json
│   │   │   ├── testimonials.json
│   │   │   └── ...
│   │   └── ...
│   ├── utils/
│   │   ├── seo.ts
│   │   ├── formatting.ts
│   │   └── ...
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   ├── utils/
│   │   ├── testHelpers.ts
│   │   └── mockData.ts
│   ├── fixtures/
│   │   ├── blog-posts.json
│   │   ├── testimonials.json
│   │   └── ...
│   └── setup.ts
├── public/
│   ├── images/
│   │   ├── logo.svg
│   │   ├── hero-bg.jpg
│   │   └── ...
│   ├── blog/
│   │   └── images/
│   └── ...
├── content/
│   ├── blog/
│   │   ├── first-post.md
│   │   └── ...
│   └── pages/
│       ├── faq.json
│       └── testimonials.json
├── Dockerfile
├── vite.config.ts
├── vitest.config.ts
├── tsconfig.json
├── package.json
└── pnpm-lock.yaml
```

## Key Components

### Hero Section
Main landing page hero with headline, subheading, and CTA button.

### Features Section
Displays key product features in a grid layout with icons and descriptions.

### ContactForm
Email validated contact form with success/error handling.

### Newsletter
Email subscription form for newsletter signup.

### BlogCard
Card component for displaying blog post previews.

### FAQAccordion
Expandable FAQ section with smooth animations.

## SEO Optimization

### Meta Tags

```typescript
// Use in page components
import { SEO } from '@/utils/seo';

export default function BlogPost() {
  return (
    <>
      <SEO
        title="Blog Post Title"
        description="Blog post description"
        canonicalUrl="https://nyra.com/blog/post-slug"
        ogImage="https://nyra.com/og-image.jpg"
      />
      {/* Page content */}
    </>
  );
}
```

### Open Graph & Social

```html
<meta property="og:title" content="Page Title" />
<meta property="og:description" content="Page description" />
<meta property="og:image" content="https://nyra.com/og-image.jpg" />
<meta property="og:url" content="https://nyra.com/page" />
<meta name="twitter:card" content="summary_large_image" />
```

## Development Workflow

### Blog Post Creation

1. Create markdown file in `src/content/blog/`
2. Add frontmatter with metadata
3. Write content in markdown
4. Add featured image
5. Test rendering locally

### Example Blog Post

```markdown
---
title: "10 Tips for Getting Better Mortgage Rates"
slug: "mortgage-rates-tips"
date: "2026-01-22"
author: "John Doe"
description: "Learn strategies to get better mortgage rates"
featured_image: "/blog/images/rates-tips.jpg"
tags: ["mortgage", "rates", "tips"]
---

# 10 Tips for Getting Better Mortgage Rates

Content here...
```

## Code Review Checklist

- [ ] Tests pass: `pnpm test`
- [ ] Coverage maintained: >80%
- [ ] Linting passes: `pnpm lint`
- [ ] Types correct: `pnpm type-check`
- [ ] Mobile responsive
- [ ] SEO meta tags present
- [ ] Images optimized
- [ ] Forms have validation
- [ ] Accessibility tested
- [ ] No console.log or debugger statements
- [ ] Links work correctly

## Performance Optimization

### Key Optimizations

1. **Image Optimization**: Use optimized formats (WebP, AVIF)
2. **Code Splitting**: Lazy load heavy components
3. **CSS Optimization**: Purge unused styles
4. **Minification**: Minify HTML, CSS, JS
5. **Caching**: Set appropriate cache headers

## Deployment

### Production Build

```bash
pnpm build
pnpm preview
```

### Environment Setup

```bash
# Production environment variables
VITE_API_URL=https://api.nyra.com
VITE_SITE_URL=https://nyra.com
VITE_ENVIRONMENT=production
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### Cloudflare Pages Deployment

```bash
# Build is automatically deployed from git
# Cloudflare configuration in wrangler.toml
```

## Accessibility

### WCAG 2.1 Compliance

- All images have alt text
- Heading hierarchy is correct (H1, H2, H3...)
- Form labels associated with inputs
- Keyboard navigation works
- Color contrast meets standards
- Focus indicators visible
- ARIA labels for complex components

## Claude Flow Integration

### Memory-Based Development

```bash
# Store landing page patterns
npx @claude-flow/cli@latest memory store \
  --key "landing-form-pattern" \
  --value "Lead capture form with email validation" \
  --namespace app-specific

# Search for CTA and hero patterns
npx @claude-flow/cli@latest memory search \
  --query "hero section CTA patterns"
```

### Task Coordination

```bash
# Pre-task: Get routing for new landing feature
npx @claude-flow/cli@latest hooks pre-task \
  --description "Implement testimonials section on landing page"

# Post-task: Store results
npx @claude-flow/cli@latest hooks post-task \
  --task-id "task-landing-testimonials" \
  --success true \
  --store-results true
```

## References

- **Project CLAUDE.md**: `CLAUDE.md` (root)
- **Apps CLAUDE.md**: `apps/CLAUDE.md`
- **Shared UI**: `apps/shared/ui/`
- **Docker Config**: `infra/docker/`

---

**Last Updated**: 2026-01-22
**Maintained By**: Development Team
