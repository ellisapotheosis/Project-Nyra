-- ============================================================================
-- PostgreSQL Initialization Script
-- Creates databases and extensions for Project Nyra services
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create schemas for different services
CREATE SCHEMA IF NOT EXISTS claude_flow;
CREATE SCHEMA IF NOT EXISTS archon;
CREATE SCHEMA IF NOT EXISTS graphiti;
CREATE SCHEMA IF NOT EXISTS mem0;

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA claude_flow TO nyra;
GRANT ALL PRIVILEGES ON SCHEMA archon TO nyra;
GRANT ALL PRIVILEGES ON SCHEMA graphiti TO nyra;
GRANT ALL PRIVILEGES ON SCHEMA mem0 TO nyra;

-- Create tables for Claude Flow
CREATE TABLE IF NOT EXISTS claude_flow.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    state JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS claude_flow.agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(100) NOT NULL,
    config JSONB,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS claude_flow.memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) NOT NULL,
    namespace VARCHAR(100) DEFAULT 'default',
    value TEXT,
    embedding VECTOR(1536),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(key, namespace)
);

CREATE INDEX IF NOT EXISTS idx_memory_namespace ON claude_flow.memory(namespace);
CREATE INDEX IF NOT EXISTS idx_memory_key ON claude_flow.memory(key);

-- Create tables for Archon
CREATE TABLE IF NOT EXISTS archon.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    input JSONB,
    output JSONB,
    error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS archon.workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    definition JSONB,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON archon.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_type ON archon.tasks(type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_claude_flow_sessions_updated_at BEFORE UPDATE ON claude_flow.sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_claude_flow_agents_updated_at BEFORE UPDATE ON claude_flow.agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_claude_flow_memory_updated_at BEFORE UPDATE ON claude_flow.memory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_archon_tasks_updated_at BEFORE UPDATE ON archon.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_archon_workflows_updated_at BEFORE UPDATE ON archon.workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial data
INSERT INTO claude_flow.sessions (session_id, state) VALUES
    ('bootstrap', '{"initialized": true, "version": "1.0.0"}'::jsonb)
ON CONFLICT (session_id) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Project Nyra database initialization completed successfully';
END $$;
