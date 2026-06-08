# Supabase Schema & RLS Plan

This document outlines the app-local state tables for Project Nyra, separated from the TwentyCRM business records.

## Core Tables

### 1. `app_settings`

Global and per-user application settings.

- `id`: uuid (primary key)
- `user_id`: uuid (references auth.users, nullable for global)
- `key`: text
- `value`: jsonb
- `updated_at`: timestamp

### 2. `audit_events`

Security and operational audit trail.

- `id`: uuid (primary key)
- `user_id`: uuid (references auth.users)
- `action`: text
- `resource`: text
- `metadata`: jsonb
- `created_at`: timestamp

### 3. `assistant_threads`

Persisted state for Nyra assistant conversations.

- `id`: uuid (primary key)
- `user_id`: uuid (references auth.users)
- `provider`: text (e.g., 'openclaw', 'dify')
- `external_thread_id`: text
- `metadata`: jsonb
- `created_at`: timestamp

### 4. `feature_flags`

Dynamic toggles for application features.

- `id`: uuid (primary key)
- `name`: text (unique)
- `enabled`: boolean
- `description`: text
- `rollout_percentage`: integer

## Row Level Security (RLS) Policies

### General Principles

- `authenticated` users can read `app_settings` where `user_id` is null (global) or matches their own.
- Only `service_role` (backend) can write to `audit_events`.
- Users can only read/write their own `assistant_threads`.
- `feature_flags` are readable by all authenticated users, writable only by admins.

## Migration SQL

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- App Settings
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, key)
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings or global settings"
  ON app_settings FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own settings"
  ON app_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Audit Events
CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit events"
  ON audit_events FOR SELECT
  TO authenticated
  USING (/* Add admin check logic here */ true);

-- Assistant Threads
CREATE TABLE assistant_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL,
  external_thread_id TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE assistant_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own threads"
  ON assistant_threads FOR ALL
  USING (auth.uid() = user_id);
```
