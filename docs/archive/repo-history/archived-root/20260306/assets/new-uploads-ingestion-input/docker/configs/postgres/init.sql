-- Orchestrator PostgreSQL Initialization Script

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create databases for services
CREATE DATABASE openwebui;
CREATE DATABASE lobechat;
CREATE DATABASE grafana;

-- Create application schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS api;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Create users table
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS auth.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create API keys table
CREATE TABLE IF NOT EXISTS api.api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    permissions JSONB DEFAULT '{}',
    rate_limit INTEGER DEFAULT 1000,
    is_active BOOLEAN DEFAULT true,
    last_used TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create request logs table
CREATE TABLE IF NOT EXISTS api.request_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    api_key_id UUID REFERENCES api.api_keys(id) ON DELETE SET NULL,
    method VARCHAR(10) NOT NULL,
    path TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create analytics events table
CREATE TABLE IF NOT EXISTS analytics.events (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON auth.users(email);
CREATE INDEX idx_users_username ON auth.users(username);
CREATE INDEX idx_users_role ON auth.users(role);
CREATE INDEX idx_users_created_at ON auth.users(created_at);

CREATE INDEX idx_sessions_user_id ON auth.sessions(user_id);
CREATE INDEX idx_sessions_token ON auth.sessions(token);
CREATE INDEX idx_sessions_expires_at ON auth.sessions(expires_at);

CREATE INDEX idx_api_keys_user_id ON api.api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api.api_keys(key_hash);
CREATE INDEX idx_api_keys_is_active ON api.api_keys(is_active);

CREATE INDEX idx_request_logs_user_id ON api.request_logs(user_id);
CREATE INDEX idx_request_logs_created_at ON api.request_logs(created_at);
CREATE INDEX idx_request_logs_status_code ON api.request_logs(status_code);
CREATE INDEX idx_request_logs_path ON api.request_logs USING gin(path gin_trgm_ops);

CREATE INDEX idx_events_user_id ON analytics.events(user_id);
CREATE INDEX idx_events_type ON analytics.events(event_type);
CREATE INDEX idx_events_created_at ON analytics.events(created_at);
CREATE INDEX idx_events_data ON analytics.events USING gin(event_data);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function for cleaning old sessions
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM auth.sessions WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Create function for cleaning old logs
CREATE OR REPLACE FUNCTION clean_old_logs(retention_days INTEGER DEFAULT 90)
RETURNS void AS $$
BEGIN
    DELETE FROM api.request_logs WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '1 day' * retention_days;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT USAGE ON SCHEMA auth TO PUBLIC;
GRANT USAGE ON SCHEMA api TO PUBLIC;
GRANT USAGE ON SCHEMA analytics TO PUBLIC;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA auth TO PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA api TO PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA analytics TO PUBLIC;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA auth TO PUBLIC;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA api TO PUBLIC;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA analytics TO PUBLIC;

-- Create maintenance schedule comment
COMMENT ON FUNCTION clean_expired_sessions() IS 'Run daily to clean expired sessions';
COMMENT ON FUNCTION clean_old_logs(INTEGER) IS 'Run weekly to clean old request logs';

-- Insert default admin user (password: admin - CHANGE IN PRODUCTION!)
INSERT INTO auth.users (email, username, password_hash, full_name, role)
VALUES (
    'admin@localhost',
    'admin',
    '$2b$10$YourHashedPasswordHere', -- Hash 'admin' with bcrypt
    'System Administrator',
    'admin'
) ON CONFLICT (email) DO NOTHING;
