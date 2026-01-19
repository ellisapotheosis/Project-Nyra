# Archon OS Database Setup Instructions

## Overview

This directory contains the complete database setup script for Archon OS. Since the Supabase MCP server authentication is experiencing issues, you'll need to manually execute the migration through your Supabase Dashboard.

## Your Supabase Project Details

- **Project ID**: `sycgcpjeqcwypfbqrshg`
- **Project URL**: `https://bttmpxdgjjnhqmqfnygy.supabase.co`
- **Dashboard URL**: `https://supabase.com/dashboard/project/sycgcpjeqcwypfbqrshg`

## Quick Setup Steps

### 1. Access SQL Editor

Navigate to your Supabase project's SQL Editor:
```
https://supabase.com/dashboard/project/sycgcpjeqcwypfbqrshg/sql/new
```

### 2. Copy Migration SQL

Open the file [`complete_setup.sql`](./complete_setup.sql) and copy its entire contents.

### 3. Execute Migration

1. Paste the SQL into the SQL Editor
2. Click **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`)
3. Wait for execution to complete (should take 10-30 seconds)

### 4. Verify Success

After execution, verify the following tables were created:

**Configuration Tables:**
- `archon_settings` - Application configuration and credentials

**Knowledge Base Tables:**
- `archon_sources` - Documentation sources
- `archon_crawled_pages` - Chunked documentation pages
- `archon_code_examples` - Extracted code examples
- `archon_page_metadata` - Full page content storage

**Projects & Tasks Tables:**
- `archon_projects` - Project management
- `archon_tasks` - Task tracking with priorities
- `archon_project_sources` - Project-source relationships
- `archon_document_versions` - Version control for documents

**System Tables:**
- `archon_migrations` - Migration tracking
- `archon_prompts` - Agent system prompts

## What This Migration Does

### Extensions Enabled
- ✅ `vector` - PostgreSQL vector similarity search
- ✅ `pgcrypto` - Cryptographic functions
- ✅ `pg_trgm` - Trigram-based fuzzy text search

### Key Features Configured
- ✅ Multi-dimensional embedding support (384D, 768D, 1024D, 1536D, 3072D)
- ✅ Hybrid search combining vector + full-text search
- ✅ Row-level security (RLS) policies
- ✅ Automatic timestamp triggers
- ✅ Soft delete for tasks
- ✅ Performance-optimized indexes

### Initial Configuration Loaded
- Server configuration (MCP transport, host, port)
- RAG strategy settings (hybrid search, agentic RAG, reranking)
- Code extraction parameters
- Crawling performance tuning
- API key placeholders (OpenAI, Google, Anthropic, OpenRouter, Grok)
- Default agent prompts (document_builder, feature_builder, data_builder)

## Troubleshooting

### If You See Errors

**"Extension vector not available"**
- Navigate to Database → Extensions in Supabase Dashboard
- Search for and enable `pgvector` extension
- Re-run the migration

**"Permission denied"**
- Ensure you're logged in with admin/owner access
- Check that you're using the SQL Editor, not the Table Editor

**"Duplicate object" errors**
- These are safe to ignore - the script is idempotent
- Objects already exist and won't be recreated

## Next Steps After Setup

1. **Add API Keys** (via Settings UI or SQL):
   ```sql
   -- Example: Add your OpenAI API key
   UPDATE archon_settings 
   SET encrypted_value = crypt('your-api-key-here', gen_salt('bf'))
   WHERE key = 'OPENAI_API_KEY';
   ```

2. **Verify Tables**:
   ```sql
   -- List all Archon tables
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name LIKE 'archon_%';
   ```

3. **Check Migration Status**:
   ```sql
   -- View applied migrations
   SELECT * FROM archon_migrations ORDER BY applied_at DESC;
   ```

## Alternative: Execute via CLI

If you prefer command-line execution, you can use the Supabase CLI:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref sycgcpjeqcwypfbqrshg

# Execute migration
supabase db execute -f ./complete_setup.sql --project-ref sycgcpjeqcwypfbqrshg
```

## Support

If you encounter issues:
1. Check the Supabase logs in Dashboard → Logs
2. Verify extensions are enabled in Database → Extensions
3. Ensure your project is not paused (Dashboard → Settings → General)

---

**Created**: 2026-01-19  
**Archon Version**: 0.1.0  
**Migration File**: [`complete_setup.sql`](./complete_setup.sql)
