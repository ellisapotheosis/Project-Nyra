# Environment Setup Guide

This guide covers setting up environment variables for Project Nyra webapp development and production.

## Development Setup

1. **Copy environment template:**

   ```bash
   cp .env.example .env.local
   ```

2. **Configure Supabase:**
   - Create a project at [supabase.com](https://supabase.com)
   - Get your project URL from `Settings → Configuration → API`
   - Get your anon key from `Settings → API → Project API Keys → anon (public)`
   - Get your service role key from `Settings → API → Project API Keys → service_role (secret)`

3. **Update .env.local with Supabase credentials:**

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Set callback URL in Supabase:**
   - Go to `Authentication → URL Configuration`
   - Add callback URL: `http://localhost:3000/auth/callback`

## Running Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
open http://localhost:3000
```

## Database Setup

Once environment is configured, create the Supabase tables:

1. Go to Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy and paste the SQL from `docs/SUPABASE_SETUP.md` under "Database Schema"
4. Execute the SQL

## Testing Authentication

1. **Signup:**
   - Go to http://localhost:3000/auth/signup
   - Fill in email, password, and full name
   - Submit form

2. **Login:**
   - Go to http://localhost:3000/auth/login
   - Use your registered email and password
   - Should redirect to /dashboard

3. **Protected Routes:**
   - Try accessing `/dashboard` without logging in
   - Should redirect to login page

4. **Logout:**
   - From protected page, sign out
   - Should return to login page

## Production Setup

1. **Set environment variables on deployment platform:**

   For Vercel:

   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   ```

2. **Configure production callback URL:**
   - In Supabase, add: `https://yourdomain.com/auth/callback`

3. **Ensure proper CORS:**
   - Supabase → SQL Editor
   - Run: `ALTER POLICY auth_header ON auth.users USING (true);`

## Troubleshooting

### "Invalid API key" error

- Verify NEXT_PUBLIC_SUPABASE_URL format: `https://project-id.supabase.co`
- Check NEXT_PUBLIC_SUPABASE_ANON_KEY is correctly copied

### "User already exists" error

- Email is already registered
- Try signing up with different email or reset in Supabase dashboard

### Redirect loop on login

- Verify middleware.ts is correctly configured
- Check AuthProvider is wrapping the app in layout.tsx

### Session expires immediately

- Verify SUPABASE_SERVICE_ROLE_KEY is set for backend operations
- Check cookie settings in login endpoint

### Tables don't exist

- Run the SQL schema creation from `docs/SUPABASE_SETUP.md`
- Verify RLS policies are enabled on all tables

## Environment Variables Reference

| Variable                        | Purpose                                         | Example                       |
| ------------------------------- | ----------------------------------------------- | ----------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                            | `https://abc123.supabase.co`  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public API key for client-side auth             | `eyJhbGc...`                  |
| `SUPABASE_SERVICE_ROLE_KEY`     | Secret key for backend operations (server-only) | `eyJhbGc...`                  |
| `NEXT_PUBLIC_APP_URL`           | Application base URL                            | `http://localhost:3000`       |
| `ENVIRONMENT`                   | Environment name                                | `development` or `production` |

## Next Steps

1. ✅ Set up Supabase project and get credentials
2. ✅ Configure .env.local with credentials
3. ✅ Create database tables using SQL schema
4. ✅ Test signup → login → dashboard flow
5. ✅ Deploy to production with proper environment variables
