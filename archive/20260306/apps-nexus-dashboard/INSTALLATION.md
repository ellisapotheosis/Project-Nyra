# Nexus Dashboard - Complete Installation Guide

## Prerequisites

Before installing, ensure you have:

- **Node.js**: Version 18.0.0 or higher
- **pnpm**: Version 10.0.0 or higher
- **Git**: For cloning the repository
- **Nexus Router**: Running on http://localhost:8000 (optional for demo mode)

## Installation Steps

### Option 1: Install from Monorepo (Recommended)

```bash
# Navigate to the Project Nyra monorepo root
cd Project-Nyra

# Install all dependencies (this includes nexus-dashboard)
pnpm install

# Start the dashboard
pnpm --filter @nyra/nexus-dashboard dev
```

The dashboard will be available at **http://localhost:3005**

### Option 2: Install Standalone

```bash
# Navigate to the dashboard directory
cd apps/nexus-dashboard

# Install dependencies
pnpm install

# Create environment file
cp .env.example .env.local

# Start development server
pnpm dev
```

## Configuration

### Environment Variables

Create a `.env.local` file in the dashboard root:

```env
# Required: Nexus Router API URL
NEXT_PUBLIC_NEXUS_URL=http://localhost:8000

# Optional: WebSocket URL (defaults to API URL)
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws

# Optional: API Key for authenticated requests
NEXT_PUBLIC_API_KEY=

# Optional: Enable debug mode
NEXT_PUBLIC_DEBUG=false
```

### Port Configuration

By default, the dashboard runs on port **3005**. To change this:

Edit `package.json`:
```json
{
  "scripts": {
    "dev": "next dev -p 3006"  // Change to your preferred port
  }
}
```

## Verification

### 1. Check Dependencies

```bash
# From the dashboard directory
pnpm list
```

Expected key dependencies:
- next@^15.1.0
- react@^19.0.0
- tailwindcss@^4.0.0
- zustand@^5.0.2
- recharts@^2.15.0
- fuse.js@^7.0.0

### 2. Check Build

```bash
# Build the project
pnpm build

# Expected output:
# ✓ Compiled successfully
# ✓ Collecting page data
# ✓ Generating static pages
# ✓ Finalizing page optimization
```

### 3. Check TypeScript

```bash
# Run type check
pnpm type-check

# Should complete without errors
```

### 4. Check Development Server

```bash
# Start dev server
pnpm dev

# Expected output:
# ▲ Next.js 15.1.0
# - Local:        http://localhost:3005
# - Ready in Xms
```

Visit http://localhost:3005 - you should see the dashboard homepage.

## File Structure Verification

Verify all required files exist:

```bash
# From dashboard directory
ls -la

# Should include:
# - package.json
# - tsconfig.json
# - next.config.js
# - tailwind.config.ts
# - postcss.config.mjs
# - .eslintrc.json
# - src/
# - public/
# - README.md
```

## Common Installation Issues

### Issue 1: Port Already in Use

**Error**: `Port 3005 is already in use`

**Solution**:
```bash
# Find and kill the process using port 3005
# Windows:
netstat -ano | findstr :3005
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:3005 | xargs kill -9

# Or change the port in package.json
```

### Issue 2: Module Not Found

**Error**: `Cannot find module 'xxx'`

**Solution**:
```bash
# Clear caches and reinstall
rm -rf node_modules
rm -rf .next
rm pnpm-lock.yaml
pnpm install
```

### Issue 3: TypeScript Errors

**Error**: `Type errors in components`

**Solution**:
```bash
# Update TypeScript
pnpm add -D typescript@latest

# Regenerate types
rm -rf .next
pnpm dev
```

### Issue 4: Tailwind Styles Not Loading

**Error**: Styles not applying

**Solution**:
```bash
# Check Tailwind config
cat tailwind.config.ts

# Restart dev server
pnpm dev
```

### Issue 5: API Connection Failed

**Error**: API requests failing

**Solution**:
1. Verify Nexus Router is running: `curl http://localhost:8000/health`
2. Check `.env.local` has correct URL
3. Check browser console for CORS errors
4. Enable demo mode (dashboard works without API)

## Testing the Installation

### 1. Homepage Test

- Navigate to http://localhost:3005
- Verify metrics cards display
- Check performance chart renders
- Confirm system status shows "Connected"

### 2. Navigation Test

Click each sidebar link:
- Dashboard (/)
- MCP Servers (/servers)
- Tool Search (/tools)
- GPU Workers (/gpu)
- Model Routes (/routes)
- Configuration (/config)

Each page should load without errors.

### 3. Search Test

- Go to Tool Search (/tools)
- Type in the search box
- Verify results filter in real-time
- Check fuzzy search works (typos still find results)

### 4. Interaction Test

- Toggle switches on Configuration page
- Edit a model route on Routes page
- Click test button on Server card
- Verify all interactions work smoothly

## Demo Mode

The dashboard includes demo data and will work without a running Nexus Router API:

- **Metrics**: Shows sample values
- **Servers**: Displays 3 mock servers
- **Tools**: Shows 5 sample tools
- **GPU Workers**: Displays 3 mock GPU workers
- **Routes**: Shows 4 sample routes

This allows you to explore the dashboard before connecting to a real API.

## Production Deployment

### Build for Production

```bash
# Create optimized production build
pnpm build

# Start production server
pnpm start
```

### Deploy to Vercel

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel --prod
```

### Deploy to Netlify

```bash
# Install Netlify CLI
pnpm add -g netlify-cli

# Deploy
netlify deploy --prod
```

### Environment Variables for Production

Set these in your deployment platform:

- `NEXT_PUBLIC_NEXUS_URL` - Your production Nexus Router URL
- `NEXT_PUBLIC_WS_URL` - Your production WebSocket URL
- `NEXT_PUBLIC_API_KEY` - Your production API key

## Next Steps

After successful installation:

1. **Explore the Dashboard**: Navigate through all pages
2. **Read Documentation**: Check README.md for feature details
3. **Configure Environment**: Set up .env.local with your API URL
4. **Connect to API**: Point to your running Nexus Router instance
5. **Customize**: Modify colors, add features, extend functionality

## Support

If you encounter issues:

1. Check this installation guide
2. Review SETUP.md for quick reference
3. Read README.md for detailed documentation
4. Check PROJECT_SUMMARY.md for architecture details
5. Open a GitHub issue with error details

## Verification Checklist

- [ ] Node.js 18+ installed
- [ ] pnpm installed
- [ ] Dependencies installed (`pnpm install`)
- [ ] Environment file created (`.env.local`)
- [ ] Development server starts (`pnpm dev`)
- [ ] Dashboard accessible at http://localhost:3005
- [ ] All pages load without errors
- [ ] Search functionality works
- [ ] Charts render correctly
- [ ] Interactive elements respond
- [ ] Build succeeds (`pnpm build`)
- [ ] Type check passes (`pnpm type-check`)

## Success!

If all checks pass, you have successfully installed the Nexus Router Dashboard!

Visit http://localhost:3005 to start using the dashboard.

---

**Need Help?** Check the documentation files or open an issue on GitHub.
