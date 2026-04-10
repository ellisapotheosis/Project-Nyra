# Landing - Claude Flow V3 Configuration

## 🚨 AUTOMATIC SWARM ORCHESTRATION

**CLI coordinates, Task tool agents do the actual work!**

---

## 🤖 INTELLIGENT 3-TIER MODEL ROUTING (ADR-026)

| Tier | Handler | Latency | Cost | Use Cases |
|------|---------|---------|------|-----------|
| **1** | Agent Booster | <1ms | $0 | Simple transforms |
| **2** | Haiku | ~500ms | $0.0002 | Simple tasks |
| **3** | Sonnet/Opus | 2-5s | $0.003-$0.015 | Complex reasoning |

---

## 🛡️ ANTI-DRIFT CONFIG (PREFERRED)

```bash
npx @archon-os/cli@latest swarm init --topology hierarchical --max-agents 6 --strategy specialized
```

---

## 🔄 AUTO-START SWARM PROTOCOL & ⏸️ CRITICAL: Spawn and Wait Pattern

1. Tell user concurrent tasks
2. STOP - no more tool calls
3. WAIT - let agents work
4. RESPOND - synthesize results

---

## 🧠 AUTO-LEARNING PROTOCOL

```bash
# Before: Search memory
npx @archon-os/cli@latest memory search --query '[keywords]' --namespace patterns

# After: Store results
npx @archon-os/cli@latest memory store --namespace patterns --key '[pattern]' --value '[result]'
npx @archon-os/cli@latest hooks post-task --task-id '[id]' --success true --store-results true
```

---

## 🚀 V3 CLI Commands & 🚀 Available Agents & 🪝 V3 Hooks System

```bash
npx @archon-os/cli@latest swarm init --topology hierarchical --max-agents 6
npx @archon-os/cli@latest memory store/search/retrieve --key/query/--key
npx @archon-os/cli@latest hooks pre-task/post-task/post-edit [options]
```

Available Agents: `coder`, `seo-specialist`, `performance-engineer`, `reviewer`, `tester`

---

## 📝 Memory Commands Reference

```bash
npx @archon-os/cli@latest memory store --key "landing-pattern" --value "content" --namespace patterns
npx @archon-os/cli@latest memory search --query "landing page seo" --namespace patterns
```

---

## 🚨 CRITICAL: CONCURRENT EXECUTION & FILE MANAGEMENT

**GOLDEN RULE: "1 MESSAGE = ALL RELATED OPERATIONS"**

---

## 🎯 Landing - RateHunter Public Landing Pages

## 🎯 APPLICATION CONTEXT

**Purpose**: Static landing pages and marketing sites for RateHunter.net, optimized for Cloudflare Pages deployment with edge caching, SEO, and conversion optimization.

**Primary Site**: ratehunter-landing (Next.js 14)
**Deployment**: Cloudflare Pages (Free tier)
**CDN**: 300+ global edge locations
**Type**: Static Site Generation (SSG) + Edge Functions

## 🚨 CRITICAL DEVELOPMENT RULES

### SEO & Performance First
**MANDATORY**: All landing pages must achieve:
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Lighthouse Score**: 95+ on all metrics
- **Mobile-First**: Fully responsive designs
- **Edge Optimization**: Leverage Cloudflare edge caching

### Parallel Page Development Pattern
**MANDATORY**: Develop all pages and components concurrently:

```javascript
// ✅ CORRECT: Batch landing page development in ONE message
[Single Message]:
  // Landing pages (Next.js)
  - Write("ratehunter-landing/app/page.tsx", homepage)
  - Write("ratehunter-landing/app/about/page.tsx", aboutPage)
  - Write("ratehunter-landing/app/contact/page.tsx", contactPage)
  - Write("ratehunter-landing/app/privacy/page.tsx", privacyPage)

  // Components
  - Write("ratehunter-landing/components/hero-section.tsx", heroComponent)
  - Write("ratehunter-landing/components/features.tsx", featuresComponent)
  - Write("ratehunter-landing/components/testimonials.tsx", testimonialsComponent)
  - Write("ratehunter-landing/components/cta.tsx", ctaComponent)

  // SEO assets
  - Write("ratehunter-landing/public/robots.txt", robotsTxt)
  - Write("ratehunter-landing/public/sitemap.xml", sitemap)
  - Write("ratehunter-landing/app/manifest.json", pwaManifest)

  // Cloudflare configuration
  - Write("ratehunter-landing/_headers", securityHeaders)
  - Write("ratehunter-landing/_redirects", redirectRules)

// ❌ WRONG: Sequential page development
[Message 1]: Write homepage
[Message 2]: Write about page
[Message 3]: Write contact page
```

### Cloudflare Pages Optimization
**CRITICAL**: Leverage Cloudflare features for maximum performance:

- **Edge Caching**: Cache static assets at edge locations
- **Auto-Minify**: Enable JS/CSS/HTML minification
- **Brotli Compression**: Automatic compression
- **HTTP/3**: QUIC protocol support
- **Image Optimization**: Cloudflare Images integration
- **Web Analytics**: Privacy-friendly analytics

## 📊 LANDING ARCHITECTURE

### RateHunter Landing Structure
```
apps/landing/ratehunter-landing/
├── app/
│   ├── page.tsx                    # Homepage (hero, features, CTA)
│   ├── layout.tsx                  # Root layout with SEO
│   ├── about/page.tsx              # About page
│   ├── contact/page.tsx            # Contact form
│   ├── privacy/page.tsx            # Privacy policy
│   ├── terms/page.tsx              # Terms of service
│   └── api/
│       └── contact/route.ts        # Contact form handler
├── components/
│   ├── hero-section.tsx            # Hero with CTA
│   ├── features.tsx                # Feature highlights
│   ├── testimonials.tsx            # Customer reviews
│   ├── cta-section.tsx             # Call-to-action
│   ├── navigation.tsx              # Header navigation
│   └── footer.tsx                  # Footer with links
├── public/
│   ├── robots.txt                  # SEO robots file
│   ├── sitemap.xml                 # XML sitemap
│   ├── manifest.json               # PWA manifest
│   └── images/                     # Optimized images
├── _headers                        # Cloudflare security headers
├── _redirects                      # URL redirects
├── next.config.js                  # Next.js + Cloudflare config
├── QUICK-START.md                  # 15-minute deploy guide
├── CLOUDFLARE-SETUP.md             # Complete setup guide
└── DEPLOYMENT-CHECKLIST.md         # Production checklist
```

## 🧠 CLAUDE FLOW INTEGRATION

### Available Agents
```yaml
agents:
  landing_page_optimizer:
    role: Landing page development and conversion optimization
    focus: [hero-sections, cta-optimization, social-proof]
    responsibilities:
      - Create compelling hero sections
      - Design conversion-focused CTAs
      - Implement testimonials and social proof
      - A/B testing recommendations

  seo_specialist:
    role: Search engine optimization
    focus: [meta-tags, structured-data, sitemaps, keywords]
    responsibilities:
      - Comprehensive metadata for mortgage keywords
      - Schema.org structured data
      - XML sitemap generation
      - robots.txt optimization

  performance_engineer:
    role: Web performance optimization
    focus: [core-web-vitals, bundle-optimization, edge-caching]
    responsibilities:
      - Achieve LCP < 2.5s
      - Minimize JavaScript bundle
      - Optimize images and fonts
      - Configure edge caching strategies

  cloudflare_specialist:
    role: Cloudflare Pages deployment expert
    focus: [edge-functions, security-headers, cdn-config]
    responsibilities:
      - Configure Cloudflare Pages builds
      - Implement security headers
      - Set up edge functions
      - Optimize CDN caching
```

### Recommended Workflows

**1. New Landing Page**
```bash
# Get routing recommendation
npx @archon-os/cli@latest hooks pre-task \
  --description "Create new landing page with SEO and performance optimization"

# Initialize swarm for parallel development
npx @archon-os/cli@latest swarm init --topology hierarchical --max-agents 4 --strategy specialized

# Spawn agents: landing_page_optimizer, seo_specialist, performance_engineer, cloudflare_specialist
```

**2. Performance Optimization**
```bash
# Run performance benchmark
npx @archon-os/cli@latest performance benchmark --suite all

# Analyze bottlenecks
npx @archon-os/cli@latest performance profile --target "landing-pages"

# Store optimization learnings
npx @archon-os/cli@latest hooks post-task \
  --task-id "perf-opt-001" \
  --success true \
  --store-results true
```

**3. SEO Enhancement**
```bash
# Search for successful SEO patterns
npx @archon-os/cli@latest memory search \
  --query "landing page SEO mortgage keywords" \
  --namespace patterns

# Store new SEO strategy
npx @archon-os/cli@latest memory store \
  --namespace patterns \
  --key "seo-mortgage-landing" \
  --value "Successful keywords and meta strategies"
```

## 🔧 CLOUDFLARE PAGES SETUP

### Quick Deploy (5 Minutes)
```bash
# 1. Push to GitHub
git push origin main

# 2. Connect in Cloudflare Dashboard
# https://dash.cloudflare.com/ > Pages > Create Project

# 3. Build Settings
Framework: Next.js
Build command: npm run build
Build output: .next
Node version: 18
```

### Security Headers (_headers file)
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';
  Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### Performance Headers
```
/*.js
  Cache-Control: public, max-age=31536000, immutable

/*.css
  Cache-Control: public, max-age=31536000, immutable

/images/*
  Cache-Control: public, max-age=31536000, immutable
```

## 📈 PERFORMANCE TARGETS

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Lighthouse Scores
- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100

### Load Times
- **First Byte**: < 200ms (edge caching)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s

### Bundle Sizes
- Initial JavaScript: < 150KB
- Total JavaScript: < 400KB
- CSS: < 30KB
- Images: WebP format, lazy loaded

## 🔒 SECURITY & COMPLIANCE

### Security Features
- **CSP**: Content Security Policy headers
- **HSTS**: HTTP Strict Transport Security
- **XSS Protection**: Cross-site scripting prevention
- **HTTPS Only**: Automatic SSL certificates
- **Secure Cookies**: HttpOnly, Secure, SameSite flags

### Mortgage Compliance
- **Equal Housing Opportunity**: Display EHO logo
- **Privacy Policy**: CCPA/GDPR compliant
- **Terms of Service**: Clear lending disclaimers
- **Cookie Consent**: User privacy controls
- **Accessibility**: WCAG 2.1 Level AA compliance

## 🧪 TESTING & VALIDATION

### Pre-Deployment Checklist
```bash
# 1. Build locally
npm run build

# 2. Test production build
npm run start

# 3. Run Lighthouse
lighthouse https://localhost:3000 --view

# 4. Check security headers
curl -I https://localhost:3000

# 5. Validate sitemap
curl https://localhost:3000/sitemap.xml

# 6. Test robots.txt
curl https://localhost:3000/robots.txt
```

### Post-Deployment Validation
- [ ] Homepage loads < 2.5s
- [ ] All pages mobile-responsive
- [ ] Forms submit successfully
- [ ] Analytics tracking works
- [ ] Security headers present
- [ ] Sitemap accessible
- [ ] robots.txt correct
- [ ] Lighthouse score 95+

## 🔄 AUTO-LEARNING PROTOCOL

### Before Landing Page Development
```bash
# Search for successful landing page patterns
npx @archon-os/cli@latest memory search \
  --query "high converting mortgage landing pages" \
  --namespace patterns

# Load learned optimizations
npx @archon-os/cli@latest hooks route \
  --task "Create conversion-optimized landing page"
```

### After Successful Launch
```bash
# Store successful pattern
npx @archon-os/cli@latest memory store \
  --namespace patterns \
  --key "landing-success-$(date +%Y%m%d)" \
  --value "Achieved 95+ Lighthouse, <2.5s LCP, conversion rate X%"

# Train neural patterns
npx @archon-os/cli@latest neural train \
  --pattern-type landing-optimization \
  --epochs 10
```

## 📚 RELATED DOCUMENTATION

- **Root CLAUDE.md**: V3 orchestration patterns
- **apps/web/ratehunter/CLAUDE.md**: Full RateHunter app with backend
- **QUICK-START.md**: 15-minute deployment guide
- **CLOUDFLARE-SETUP.md**: Complete Cloudflare configuration
- **DEPLOYMENT-CHECKLIST.md**: Production launch checklist

---

**Landing pages are the first impression for potential customers. Every element must be optimized for speed, SEO, conversion, and mobile experience. Cloudflare Pages provides free hosting with enterprise CDN performance.**
