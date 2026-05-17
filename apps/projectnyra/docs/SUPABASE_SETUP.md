# Supabase Configuration Guide

This document outlines the Supabase setup required for Project Nyra webapp authentication, data management, and Row-Level Security (RLS) policies.

## Environment Setup

Add these environment variables to `.env.local`:

```env
# Supabase Project
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Database Schema

### 1. Users Table (auth.users - Managed by Supabase Auth)

Supabase automatically manages the `auth.users` table. Additional user metadata:

```sql
-- Create profiles table to extend auth.users
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'user', -- 'user', 'broker', 'admin'
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

### 2. Leads Table

```sql
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  borrower_name TEXT NOT NULL,
  borrower_email TEXT NOT NULL,
  borrower_phone TEXT,
  loan_amount DECIMAL(15,2),
  loan_type TEXT, -- 'purchase', 'refinance', 'heloc'
  credit_score INTEGER,
  status TEXT DEFAULT 'lead', -- 'lead', 'qualified', 'pre-approved', 'closed'
  source TEXT, -- 'website', 'referral', 'campaign'
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX leads_user_id_idx ON public.leads(user_id);
CREATE INDEX leads_status_idx ON public.leads(status);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
```

### 3. Campaigns Table

```sql
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed'
  workflow JSONB, -- Campaign workflow definition
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX campaigns_user_id_idx ON public.campaigns(user_id);
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
```

### 4. Quotes Table

```sql
CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  rate DECIMAL(5,3),
  term_months INTEGER,
  monthly_payment DECIMAL(10,2),
  total_cost DECIMAL(15,2),
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'expired'
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX quotes_user_id_idx ON public.quotes(user_id);
CREATE INDEX quotes_lead_id_idx ON public.quotes(lead_id);
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
```

### 5. Events Table (Compliance Logging)

```sql
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL, -- 'lead_created', 'quote_generated', 'loan_approved', etc.
  resource_id UUID,
  resource_type TEXT, -- 'lead', 'campaign', 'quote'
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX events_user_id_idx ON public.events(user_id);
CREATE INDEX events_event_type_idx ON public.events(event_type);
CREATE INDEX events_created_at_idx ON public.events(created_at);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
```

### 6. Compliance Events Table

```sql
CREATE TABLE public.compliance_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL, -- 'disclosure_sent', 'trid_check', 'fair_lending_audit'
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  details JSONB,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX compliance_events_lead_id_idx ON public.compliance_events(lead_id);
CREATE INDEX compliance_events_event_type_idx ON public.compliance_events(event_type);
ALTER TABLE public.compliance_events ENABLE ROW LEVEL SECURITY;
```

## Row-Level Security (RLS) Policies

### Profiles RLS Policies

```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
```

### Leads RLS Policies

```sql
-- Users can view their own leads
CREATE POLICY "Users can view own leads" ON public.leads
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create leads
CREATE POLICY "Authenticated users can create leads" ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own leads
CREATE POLICY "Users can update own leads" ON public.leads
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own leads
CREATE POLICY "Users can delete own leads" ON public.leads
  FOR DELETE USING (auth.uid() = user_id);

-- Admins can view all leads
CREATE POLICY "Admins can view all leads" ON public.leads
  FOR SELECT USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
```

### Campaigns RLS Policies

```sql
-- Users can view their own campaigns
CREATE POLICY "Users can view own campaigns" ON public.campaigns
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create campaigns
CREATE POLICY "Authenticated users can create campaigns" ON public.campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own campaigns
CREATE POLICY "Users can update own campaigns" ON public.campaigns
  FOR UPDATE USING (auth.uid() = user_id);
```

### Quotes RLS Policies

```sql
-- Users can view their own quotes
CREATE POLICY "Users can view own quotes" ON public.quotes
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create quotes
CREATE POLICY "Authenticated users can create quotes" ON public.quotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own quotes
CREATE POLICY "Users can update own quotes" ON public.quotes
  FOR UPDATE USING (auth.uid() = user_id);
```

### Events & Compliance RLS Policies

```sql
-- Users can view their own events
CREATE POLICY "Users can view own events" ON public.events
  FOR SELECT USING (auth.uid() = user_id);

-- System can insert events
CREATE POLICY "System can insert events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view compliance events for their leads
CREATE POLICY "Users can view lead compliance events" ON public.compliance_events
  FOR SELECT USING (
    lead_id IN (
      SELECT id FROM public.leads WHERE user_id = auth.uid()
    )
  );

-- System can insert compliance events
CREATE POLICY "System can insert compliance events" ON public.compliance_events
  FOR INSERT WITH CHECK (
    lead_id IN (
      SELECT id FROM public.leads WHERE user_id = auth.uid()
    )
  );
```

## Authentication Setup

### Supabase Auth Configuration

1. **Enable Email/Password Authentication**
   - Go to Supabase Dashboard → Authentication → Providers
   - Enable "Email" provider
   - Configure email templates for signup verification and password reset

2. **Configure Redirect URLs**
   - Add to Supabase project settings:
     - Development: `http://localhost:3000/auth/callback`
     - Production: `https://projectnyra.com/auth/callback`

3. **Email Configuration**
   - Set up SMTP or use Supabase email template service
   - Configure email subjects and content for verification and password reset

### Session Management

Sessions are automatically managed by Supabase through HTTP-only cookies. The `@supabase/supabase-js` library handles:

- Session token storage
- Automatic token refresh
- Logout on token expiration

## Testing RLS Policies

```sql
-- Test user can only see their own leads
SELECT * FROM public.leads WHERE user_id = auth.uid();

-- Test user cannot see other users' leads (should return empty)
SELECT * FROM public.leads WHERE user_id != auth.uid();

-- Test admin can see all leads
SELECT * FROM public.leads;
```

## Backup and Security

1. **Enable Row Level Security on all tables** ✓
2. **Enable column encryption for sensitive data**:
   - SSN, credit score, income should be encrypted
3. **Set up automated backups** in Supabase dashboard
4. **Use service role key only on backend** (never expose to client)
5. **Rotate API keys regularly**

## References

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase RLS Policies](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Best Practices](https://supabase.com/docs/guides/database/best-practices)
