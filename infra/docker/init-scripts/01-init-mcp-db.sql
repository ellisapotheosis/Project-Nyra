-- Initialize MCP Database Schema
-- Project Nyra - MCP Server Database Setup

-- Create extension for UUID support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- MCP Session Management
CREATE TABLE IF NOT EXISTS mcp_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_name VARCHAR(100) NOT NULL,
    session_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    INDEX idx_server_name (server_name),
    INDEX idx_expires_at (expires_at)
);

-- MCP Tool Call Logs
CREATE TABLE IF NOT EXISTS mcp_tool_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES mcp_sessions(id) ON DELETE CASCADE,
    server_name VARCHAR(100) NOT NULL,
    tool_name VARCHAR(200) NOT NULL,
    parameters JSONB,
    result JSONB,
    status VARCHAR(50) NOT NULL,
    execution_time_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_session_id (session_id),
    INDEX idx_server_name (server_name),
    INDEX idx_tool_name (tool_name),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- MCP Metrics
CREATE TABLE IF NOT EXISTS mcp_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_name VARCHAR(100) NOT NULL,
    metric_name VARCHAR(200) NOT NULL,
    metric_value NUMERIC,
    metric_unit VARCHAR(50),
    metadata JSONB,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_server_name (server_name),
    INDEX idx_metric_name (metric_name),
    INDEX idx_recorded_at (recorded_at)
);

-- Archon OS Knowledge Base Cache
CREATE TABLE IF NOT EXISTS archon_knowledge_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    knowledge_id VARCHAR(200) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    embedding VECTOR(1536),
    metadata JSONB,
    cached_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    INDEX idx_knowledge_id (knowledge_id),
    INDEX idx_expires_at (expires_at)
);

-- Archon OS Task Cache
CREATE TABLE IF NOT EXISTS archon_task_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id VARCHAR(200) NOT NULL UNIQUE,
    task_data JSONB NOT NULL,
    status VARCHAR(50) NOT NULL,
    cached_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    INDEX idx_task_id (task_id),
    INDEX idx_status (status),
    INDEX idx_expires_at (expires_at)
);

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to mcp_sessions
CREATE TRIGGER update_mcp_sessions_updated_at
    BEFORE UPDATE ON mcp_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust user as needed)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mcp_prod;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO mcp_prod;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mcp_sessions_server_created
    ON mcp_sessions(server_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_mcp_tool_calls_server_created
    ON mcp_tool_calls(server_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_mcp_metrics_server_recorded
    ON mcp_metrics(server_name, recorded_at DESC);

-- Comments for documentation
COMMENT ON TABLE mcp_sessions IS 'MCP server session management';
COMMENT ON TABLE mcp_tool_calls IS 'MCP tool call logging and auditing';
COMMENT ON TABLE mcp_metrics IS 'MCP server performance metrics';
COMMENT ON TABLE archon_knowledge_cache IS 'Cached knowledge base entries from Archon OS';
COMMENT ON TABLE archon_task_cache IS 'Cached task data from Archon OS';
