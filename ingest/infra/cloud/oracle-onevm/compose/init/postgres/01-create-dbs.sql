-- Create per-app databases (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'twenty') THEN
    CREATE DATABASE twenty;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nyra_ai') THEN
    CREATE DATABASE nyra_ai;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'n8n') THEN
    CREATE DATABASE n8n;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'activepieces') THEN
    CREATE DATABASE activepieces;
  END IF;
END $$;
