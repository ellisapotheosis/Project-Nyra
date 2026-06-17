#!/bin/bash
# PHASE 3: Supabase Initialization on oracle-vps
# This script initializes all Supabase services and creates auth tables

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        PHASE 3: Supabase Initialization (oracle-vps)          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Load environment variables
if [ -f ".env.supabase" ]; then
  export $(cat .env.supabase | grep -v '^#' | xargs)
  echo "✅ Loaded .env.supabase"
fi

PROJECT_DIR="/home/ellisapotheosis/repos/project-nyra"
DOCKER_COMPOSE_FILE="$PROJECT_DIR/infra/hosts/oracle-vps/docker-compose.yml"
SUPABASE_OVERLAY="$PROJECT_DIR/infra/hosts/oracle-vps/docker-compose.supabase.yml"

# Step 1: Start Supabase services
echo "🚀 Starting Supabase services..."
docker compose -f "$DOCKER_COMPOSE_FILE" -f "$SUPABASE_OVERLAY" \
  up -d supabase-auth supabase-rest supabase-realtime supabase-studio

echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check health
echo "🏥 Checking service health..."
docker compose -f "$DOCKER_COMPOSE_FILE" -f "$SUPABASE_OVERLAY" ps

# Step 2: Create auth tables
echo ""
echo "📊 Creating auth tables and policies..."

POSTGRES_HOST="${POSTGRES_HOST:-supabase-db}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-changeme}"
POSTGRES_DB="${POSTGRES_DB:-supabase}"

# Run SQL migrations
psql "postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:5432/$POSTGRES_DB" << 'SQL'
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create auth profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR NOT NULL UNIQUE,
  full_name VARCHAR,
  mortgage_profile_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- RLS Policy: Users can update own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policy: Allow service role to manage
CREATE POLICY "Service role can manage profiles"
  ON public.profiles
  USING (current_setting('role') = 'service_role');

-- Create audit log table
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR NOT NULL,
  table_name VARCHAR NOT NULL,
  record_id UUID,
  changes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS on audit_log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- RLS: Only service role can read audit logs
CREATE POLICY "Service role can read audit logs"
  ON public.audit_log FOR SELECT
  USING (current_setting('role') = 'service_role');

GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
GRANT ALL ON public.profiles TO anon, authenticated, service_role;
GRANT ALL ON public.audit_log TO service_role;
SQL

echo "✅ Auth tables created"

# Step 3: Get Supabase credentials
echo ""
echo "🔑 Retrieving Supabase credentials..."
echo ""
echo "⚠️  Manual action: Get credentials from Supabase Studio:"
echo "   1. Open: http://localhost:3010"
echo "   2. Navigate to: Settings → API"
echo "   3. Copy: SUPABASE_ANON_KEY"
echo "   4. Copy: SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "   Then update Cloudflare Pages environment variables:"
echo "   SUPABASE_URL=https://supabase.projectnyra.com"
echo "   SUPABASE_ANON_KEY=<copied key>"
echo ""
echo "✅ PHASE 3 COMPLETE"
echo ""
