-- NYRA Distributed Memory Database Schemas
-- PostgreSQL with pgvector extension for vector embeddings
-- Designed for distributed deployment across 4 PCs with replication

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- KNOWLEDGE GRAPH SCHEMA
-- =====================================================

-- Knowledge nodes table with vector embeddings
CREATE TABLE knowledge_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    node_id VARCHAR(64) UNIQUE NOT NULL, -- Computed hash ID from content
    type VARCHAR(50) NOT NULL CHECK (type IN ('entity', 'concept', 'relationship', 'memory', 'session')),
    data JSONB NOT NULL,
    embeddings vector(384), -- 384-dimensional vector for sentence transformers
    metadata JSONB NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    checksum VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source_node VARCHAR(50) NOT NULL, -- orchestrator, worker1, worker2, worker3, cloud
    access_pattern VARCHAR(10) DEFAULT 'hot' CHECK (access_pattern IN ('hot', 'warm', 'cold')),
    confidence DECIMAL(3,2) DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1)
);

-- Knowledge relationships table
CREATE TABLE knowledge_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_node_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
    to_node_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
    relationship_type VARCHAR(100) NOT NULL,
    strength DECIMAL(3,2) DEFAULT 1.0 CHECK (strength >= 0 AND strength <= 1),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(from_node_id, to_node_id, relationship_type)
);

-- Vector similarity search index
CREATE INDEX idx_knowledge_embeddings ON knowledge_nodes USING ivfflat (embeddings vector_cosine_ops) WITH (lists = 100);

-- Performance indexes
CREATE INDEX idx_knowledge_nodes_type ON knowledge_nodes(type);
CREATE INDEX idx_knowledge_nodes_source ON knowledge_nodes(source_node);
CREATE INDEX idx_knowledge_nodes_access ON knowledge_nodes(access_pattern);
CREATE INDEX idx_knowledge_nodes_updated ON knowledge_nodes(updated_at DESC);
CREATE INDEX idx_knowledge_relationships_from ON knowledge_relationships(from_node_id);
CREATE INDEX idx_knowledge_relationships_to ON knowledge_relationships(to_node_id);
CREATE INDEX idx_knowledge_relationships_type ON knowledge_relationships(relationship_type);

-- Full text search indexes
CREATE INDEX idx_knowledge_data_gin ON knowledge_nodes USING gin (data);
CREATE INDEX idx_knowledge_metadata_gin ON knowledge_nodes USING gin (metadata);

-- =====================================================
-- SESSION MANAGEMENT SCHEMA
-- =====================================================

-- User sessions table
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(100) UNIQUE NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    device_id VARCHAR(100) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB NOT NULL DEFAULT '{}',
    version INTEGER NOT NULL DEFAULT 1,
    checksum VARCHAR(64) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'merged', 'archived')),
    location VARCHAR(50) NOT NULL -- orchestrator, worker1, worker2, worker3, cloud
);

-- Conversation contexts within sessions
CREATE TABLE conversation_contexts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
    message_id VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'agent', 'system')),
    content TEXT NOT NULL,
    embeddings vector(384),
    related_nodes UUID[] DEFAULT '{}',
    context_window INTEGER NOT NULL,
    importance DECIMAL(3,2) DEFAULT 0.5 CHECK (importance >= 0 AND importance <= 1),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Agent states within sessions
CREATE TABLE agent_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
    agent_id VARCHAR(100) NOT NULL,
    agent_type VARCHAR(50) NOT NULL,
    current_task TEXT,
    memory_data JSONB DEFAULT '{}',
    learning_state JSONB DEFAULT '{}',
    performance_metrics JSONB DEFAULT '{}',
    last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id, agent_id)
);

-- Workflow states
CREATE TABLE workflow_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
    workflow_id VARCHAR(100) NOT NULL,
    current_step INTEGER DEFAULT 0,
    completed_steps TEXT[] DEFAULT '{}',
    pending_steps TEXT[] DEFAULT '{}',
    variables JSONB DEFAULT '{}',
    branching_history JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id, workflow_id)
);

-- Memory anchors for important information
CREATE TABLE memory_anchors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
    anchor_id VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('episodic', 'semantic', 'procedural', 'working')),
    content JSONB NOT NULL,
    importance DECIMAL(3,2) DEFAULT 0.5 CHECK (importance >= 0 AND importance <= 1),
    associated_nodes UUID[] DEFAULT '{}',
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    access_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(100) UNIQUE NOT NULL,
    communication_style VARCHAR(20) DEFAULT 'technical',
    response_length VARCHAR(20) DEFAULT 'detailed',
    domain_focus TEXT[] DEFAULT '{}',
    learning_style VARCHAR(20) DEFAULT 'mixed',
    privacy_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session management indexes
CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_device ON user_sessions(device_id);
CREATE INDEX idx_sessions_activity ON user_sessions(last_activity DESC);
CREATE INDEX idx_sessions_location ON user_sessions(location);
CREATE INDEX idx_conversation_session ON conversation_contexts(session_id);
CREATE INDEX idx_conversation_embeddings ON conversation_contexts USING ivfflat (embeddings vector_cosine_ops) WITH (lists = 50);
CREATE INDEX idx_conversation_timestamp ON conversation_contexts(timestamp DESC);
CREATE INDEX idx_agent_states_session ON agent_states(session_id);
CREATE INDEX idx_agent_states_agent ON agent_states(agent_id);
CREATE INDEX idx_memory_anchors_session ON memory_anchors(session_id);
CREATE INDEX idx_memory_anchors_importance ON memory_anchors(importance DESC);

-- =====================================================
-- LEARNING SYSTEMS SCHEMA
-- =====================================================

-- Learning patterns discovered by the system
CREATE TABLE learning_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pattern_id VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('behavioral', 'performance', 'contextual', 'workflow', 'user_preference')),
    pattern_data JSONB NOT NULL,
    confidence DECIMAL(3,2) DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
    frequency INTEGER DEFAULT 1,
    last_observed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    context_conditions JSONB DEFAULT '[]',
    outcomes JSONB DEFAULT '[]',
    adaptations UUID[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adaptations generated from learning patterns
CREATE TABLE adaptations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    adaptation_id VARCHAR(100) UNIQUE NOT NULL,
    trigger_pattern_id UUID REFERENCES learning_patterns(id) ON DELETE SET NULL,
    action_type VARCHAR(30) NOT NULL CHECK (action_type IN ('parameter_adjustment', 'behavior_change', 'workflow_optimization', 'resource_reallocation')),
    target VARCHAR(200) NOT NULL, -- Agent ID, workflow ID, etc.
    changes JSONB NOT NULL,
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    expected_impact DECIMAL(3,2) DEFAULT 0.5,
    effectiveness DECIMAL(3,2),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    rollbackable BOOLEAN DEFAULT TRUE,
    rollback_data JSONB,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'rolled_back'))
);

-- Learning models for ML algorithms
CREATE TABLE learning_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('neural_network', 'decision_tree', 'svm', 'ensemble', 'reinforcement_learning')),
    parameters JSONB NOT NULL,
    performance_metrics JSONB NOT NULL,
    last_trained TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    version INTEGER NOT NULL DEFAULT 1,
    training_data_count INTEGER DEFAULT 0,
    model_size_bytes BIGINT DEFAULT 0,
    node_location VARCHAR(50) NOT NULL -- Which node stores the model
);

-- Training data for models
CREATE TABLE training_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID NOT NULL REFERENCES learning_models(id) ON DELETE CASCADE,
    input_vector JSONB NOT NULL, -- Stored as JSON array
    output_vector JSONB NOT NULL, -- Stored as JSON array
    weight DECIMAL(3,2) DEFAULT 1.0,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    context_data JSONB DEFAULT '{}'
);

-- Feedback loops for continuous improvement
CREATE TABLE feedback_loops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loop_id VARCHAR(100) UNIQUE NOT NULL,
    source VARCHAR(20) NOT NULL CHECK (source IN ('user', 'system', 'agent', 'external')),
    metric_name VARCHAR(100) NOT NULL,
    target_value DECIMAL(10,4) NOT NULL,
    current_value DECIMAL(10,4) NOT NULL,
    trend VARCHAR(20) DEFAULT 'stable' CHECK (trend IN ('improving', 'declining', 'stable')),
    actions JSONB DEFAULT '[]',
    last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge evolution tracking
CREATE TABLE knowledge_evolution (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    node_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
    evolution_type VARCHAR(20) NOT NULL CHECK (evolution_type IN ('refinement', 'expansion', 'correction', 'deprecation')),
    old_value JSONB,
    new_value JSONB,
    confidence DECIMAL(3,2) DEFAULT 0.5,
    evidence JSONB DEFAULT '[]',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    applied_by VARCHAR(100) NOT NULL -- System component that applied the evolution
);

-- Learning system indexes
CREATE INDEX idx_patterns_type ON learning_patterns(type);
CREATE INDEX idx_patterns_confidence ON learning_patterns(confidence DESC);
CREATE INDEX idx_patterns_frequency ON learning_patterns(frequency DESC);
CREATE INDEX idx_adaptations_target ON adaptations(target);
CREATE INDEX idx_adaptations_status ON adaptations(status);
CREATE INDEX idx_adaptations_effectiveness ON adaptations(effectiveness DESC);
CREATE INDEX idx_models_type ON learning_models(type);
CREATE INDEX idx_models_location ON learning_models(node_location);
CREATE INDEX idx_training_data_model ON training_data(model_id);
CREATE INDEX idx_feedback_loops_metric ON feedback_loops(metric_name);
CREATE INDEX idx_knowledge_evolution_node ON knowledge_evolution(node_id);
CREATE INDEX idx_knowledge_evolution_type ON knowledge_evolution(evolution_type);

-- =====================================================
-- DISTRIBUTED STORAGE SCHEMA
-- =====================================================

-- Storage nodes in the distributed system
CREATE TABLE storage_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    node_id VARCHAR(50) UNIQUE NOT NULL,
    node_type VARCHAR(20) NOT NULL CHECK (node_type IN ('orchestrator', 'worker', 'cloud', 'edge')),
    capabilities JSONB NOT NULL,
    location JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'online' CHECK (status IN ('online', 'offline', 'degraded', 'maintenance')),
    metrics JSONB NOT NULL DEFAULT '{}',
    last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data partitions across nodes
CREATE TABLE data_partitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partition_id VARCHAR(100) UNIQUE NOT NULL,
    partition_type VARCHAR(20) NOT NULL CHECK (partition_type IN ('primary', 'replica', 'backup')),
    data_type VARCHAR(30) NOT NULL CHECK (data_type IN ('knowledge_graph', 'session_data', 'learning_models', 'cache', 'logs')),
    shard_key VARCHAR(200) NOT NULL,
    size_bytes BIGINT DEFAULT 0,
    node_ids TEXT[] NOT NULL, -- Array of node IDs storing this partition
    consistency_level VARCHAR(20) DEFAULT 'eventual',
    replication_factor INTEGER DEFAULT 2,
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    checksum VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Storage transactions for ACID operations
CREATE TABLE storage_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('read', 'write', 'delete', 'batch')),
    keys TEXT[] NOT NULL,
    node_id VARCHAR(50) NOT NULL,
    consistency_level VARCHAR(20) NOT NULL,
    timeout_seconds INTEGER DEFAULT 30,
    retry_attempts INTEGER DEFAULT 0,
    max_retry_attempts INTEGER DEFAULT 3,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'committed', 'aborted', 'timeout')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Cache entries for performance optimization
CREATE TABLE cache_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cache_key VARCHAR(500) NOT NULL,
    data_type VARCHAR(30) NOT NULL,
    value_data JSONB NOT NULL,
    value_size INTEGER NOT NULL,
    ttl_seconds INTEGER,
    access_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    node_id VARCHAR(50) NOT NULL,
    UNIQUE(cache_key, node_id)
);

-- Replication logs for data synchronization
CREATE TABLE replication_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_node VARCHAR(50) NOT NULL,
    target_node VARCHAR(50) NOT NULL,
    partition_id VARCHAR(100) NOT NULL,
    operation_type VARCHAR(20) NOT NULL CHECK (operation_type IN ('insert', 'update', 'delete')),
    data_key VARCHAR(500) NOT NULL,
    data_value JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    applied BOOLEAN DEFAULT FALSE,
    applied_at TIMESTAMP WITH TIME ZONE,
    conflict_resolution VARCHAR(30),
    error_message TEXT
);

-- Distributed storage indexes
CREATE INDEX idx_storage_nodes_type ON storage_nodes(node_type);
CREATE INDEX idx_storage_nodes_status ON storage_nodes(status);
CREATE INDEX idx_partitions_type ON data_partitions(data_type);
CREATE INDEX idx_partitions_nodes ON data_partitions USING gin (node_ids);
CREATE INDEX idx_transactions_status ON storage_transactions(status);
CREATE INDEX idx_transactions_node ON storage_transactions(node_id);
CREATE INDEX idx_cache_key ON cache_entries(cache_key);
CREATE INDEX idx_cache_expires ON cache_entries(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_cache_accessed ON cache_entries(last_accessed DESC);
CREATE INDEX idx_replication_target ON replication_logs(target_node, applied);
CREATE INDEX idx_replication_timestamp ON replication_logs(timestamp DESC);

-- =====================================================
-- PERFORMANCE MONITORING SCHEMA
-- =====================================================

-- System metrics collection
CREATE TABLE system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    node_id VARCHAR(50) NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,6) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    labels JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance alerts
CREATE TABLE performance_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    affected_nodes TEXT[] DEFAULT '{}',
    alert_data JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    acknowledged_by VARCHAR(100),
    resolved_by VARCHAR(100)
);

-- Performance monitoring indexes
CREATE INDEX idx_system_metrics_node_time ON system_metrics(node_id, timestamp DESC);
CREATE INDEX idx_system_metrics_type ON system_metrics(metric_type, metric_name);
CREATE INDEX idx_performance_alerts_status ON performance_alerts(status);
CREATE INDEX idx_performance_alerts_severity ON performance_alerts(severity);
CREATE INDEX idx_performance_alerts_created ON performance_alerts(created_at DESC);

-- =====================================================
-- SECURITY AND AUDIT SCHEMA
-- =====================================================

-- Audit log for security and compliance
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL,
    user_id VARCHAR(100),
    session_id VARCHAR(100),
    node_id VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(200),
    action VARCHAR(50) NOT NULL,
    outcome VARCHAR(20) NOT NULL CHECK (outcome IN ('success', 'failure', 'error')),
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Access control for distributed resources
CREATE TABLE access_control (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    principal_id VARCHAR(100) NOT NULL, -- user, service, or agent ID
    principal_type VARCHAR(20) NOT NULL CHECK (principal_type IN ('user', 'service', 'agent')),
    resource_type VARCHAR(50) NOT NULL,
    resource_pattern VARCHAR(200) NOT NULL, -- Pattern or specific resource ID
    permissions TEXT[] NOT NULL, -- read, write, delete, admin
    conditions JSONB DEFAULT '{}', -- Time, location, or other conditions
    granted_by VARCHAR(100) NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_by VARCHAR(100)
);

-- Security indexes
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp DESC);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_node ON audit_log(node_id);
CREATE INDEX idx_audit_log_event_type ON audit_log(event_type);
CREATE INDEX idx_access_control_principal ON access_control(principal_id, principal_type);
CREATE INDEX idx_access_control_resource ON access_control(resource_type, resource_pattern);
CREATE INDEX idx_access_control_active ON access_control(revoked) WHERE revoked = FALSE;

-- =====================================================
-- TRIGGERS AND STORED PROCEDURES
-- =====================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update timestamp triggers
CREATE TRIGGER update_knowledge_nodes_updated_at BEFORE UPDATE ON knowledge_nodes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_knowledge_relationships_updated_at BEFORE UPDATE ON knowledge_relationships FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_workflow_states_updated_at BEFORE UPDATE ON workflow_states FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_learning_patterns_updated_at BEFORE UPDATE ON learning_patterns FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_storage_nodes_updated_at BEFORE UPDATE ON storage_nodes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Vector similarity search function
CREATE OR REPLACE FUNCTION search_similar_knowledge(
    query_embedding vector(384),
    similarity_threshold float DEFAULT 0.7,
    max_results int DEFAULT 10
)
RETURNS TABLE(
    id UUID,
    node_id VARCHAR(64),
    data JSONB,
    similarity DECIMAL(5,4)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        kn.id,
        kn.node_id,
        kn.data,
        ROUND((1 - (kn.embeddings <=> query_embedding))::decimal, 4) as similarity
    FROM knowledge_nodes kn
    WHERE (1 - (kn.embeddings <=> query_embedding)) >= similarity_threshold
    ORDER BY kn.embeddings <=> query_embedding
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Session context retrieval with smart windowing
CREATE OR REPLACE FUNCTION get_session_context(
    p_session_id UUID,
    max_messages int DEFAULT 100,
    importance_threshold float DEFAULT 0.5
)
RETURNS TABLE(
    message_id VARCHAR(100),
    role VARCHAR(20),
    content TEXT,
    importance DECIMAL(3,2),
    timestamp TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- Get recent messages and high importance messages
    RETURN QUERY
    (
        -- Recent messages (70% of limit)
        SELECT cc.message_id, cc.role, cc.content, cc.importance, cc.timestamp
        FROM conversation_contexts cc
        WHERE cc.session_id = p_session_id
        ORDER BY cc.timestamp DESC
        LIMIT (max_messages * 0.7)::int
    )
    UNION ALL
    (
        -- High importance messages not in recent set (30% of limit)
        SELECT cc.message_id, cc.role, cc.content, cc.importance, cc.timestamp
        FROM conversation_contexts cc
        WHERE cc.session_id = p_session_id
        AND cc.importance >= importance_threshold
        AND cc.id NOT IN (
            SELECT id FROM conversation_contexts
            WHERE session_id = p_session_id
            ORDER BY timestamp DESC
            LIMIT (max_messages * 0.7)::int
        )
        ORDER BY cc.importance DESC, cc.timestamp DESC
        LIMIT (max_messages * 0.3)::int
    )
    ORDER BY timestamp;
END;
$$ LANGUAGE plpgsql;

-- Node health check function
CREATE OR REPLACE FUNCTION check_node_health(p_node_id VARCHAR(50))
RETURNS JSONB AS $$
DECLARE
    health_status JSONB;
    last_heartbeat_age INTERVAL;
    metrics JSONB;
BEGIN
    -- Get last heartbeat age
    SELECT NOW() - last_heartbeat INTO last_heartbeat_age
    FROM storage_nodes
    WHERE node_id = p_node_id;

    -- Get latest metrics
    SELECT sn.metrics INTO metrics
    FROM storage_nodes sn
    WHERE sn.node_id = p_node_id;

    -- Build health status
    health_status = jsonb_build_object(
        'node_id', p_node_id,
        'last_heartbeat_age_seconds', EXTRACT(EPOCH FROM last_heartbeat_age),
        'is_healthy', CASE
            WHEN last_heartbeat_age < INTERVAL '2 minutes' THEN true
            ELSE false
        END,
        'metrics', metrics,
        'checked_at', NOW()
    );

    RETURN health_status;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MATERIALIZED VIEWS FOR PERFORMANCE
-- =====================================================

-- Aggregated knowledge graph statistics
CREATE MATERIALIZED VIEW knowledge_graph_stats AS
SELECT
    type,
    source_node,
    access_pattern,
    COUNT(*) as node_count,
    AVG(confidence) as avg_confidence,
    MAX(updated_at) as last_update
FROM knowledge_nodes
GROUP BY type, source_node, access_pattern;

-- Session activity summary
CREATE MATERIALIZED VIEW session_activity_stats AS
SELECT
    DATE(s.last_activity) as activity_date,
    s.location,
    COUNT(DISTINCT s.user_id) as unique_users,
    COUNT(*) as total_sessions,
    AVG(EXTRACT(EPOCH FROM (s.last_activity - s.start_time))) as avg_duration_seconds
FROM user_sessions s
WHERE s.status = 'active'
GROUP BY DATE(s.last_activity), s.location;

-- Performance metrics summary
CREATE MATERIALIZED VIEW performance_summary AS
SELECT
    DATE(timestamp) as metric_date,
    node_id,
    metric_type,
    AVG(metric_value) as avg_value,
    MIN(metric_value) as min_value,
    MAX(metric_value) as max_value,
    COUNT(*) as sample_count
FROM system_metrics
GROUP BY DATE(timestamp), node_id, metric_type;

-- Create indexes on materialized views
CREATE INDEX idx_knowledge_stats_type ON knowledge_graph_stats(type);
CREATE INDEX idx_session_stats_date ON session_activity_stats(activity_date);
CREATE INDEX idx_performance_summary_node ON performance_summary(node_id, metric_date);

-- =====================================================
-- PARTITIONING SETUP
-- =====================================================

-- Partition audit log by date for better performance
CREATE TABLE audit_log_template (
    LIKE audit_log INCLUDING DEFAULTS INCLUDING CONSTRAINTS
);

-- Function to create monthly audit log partitions
CREATE OR REPLACE FUNCTION create_audit_log_partition(start_date DATE)
RETURNS void AS $$
DECLARE
    end_date DATE;
    partition_name TEXT;
BEGIN
    end_date := start_date + INTERVAL '1 month';
    partition_name := 'audit_log_' || to_char(start_date, 'YYYY_MM');

    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I PARTITION OF audit_log
        FOR VALUES FROM (%L) TO (%L)',
        partition_name, start_date, end_date
    );

    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_timestamp ON %I(timestamp)', partition_name, partition_name);
END;
$$ LANGUAGE plpgsql;

-- Create partitions for current and next 12 months
DO $$
DECLARE
    start_date DATE := DATE_TRUNC('month', CURRENT_DATE);
    i INTEGER;
BEGIN
    FOR i IN 0..12 LOOP
        PERFORM create_audit_log_partition(start_date + (i || ' months')::INTERVAL);
    END LOOP;
END $$;

-- =====================================================
-- INITIAL DATA AND CONFIGURATION
-- =====================================================

-- Insert default storage node (orchestrator)
INSERT INTO storage_nodes (node_id, node_type, capabilities, location, status, metrics)
VALUES (
    'orchestrator',
    'orchestrator',
    '{
        "storage": {"total": 1099511627776, "available": 824633720832, "type": "ssd", "iops": 50000, "latency": 0.1},
        "computing": {"cpu": "Ryzen 7 6800H", "cores": 16, "memory": 17179869184},
        "network": {"bandwidth": 1000, "latency": 0, "reliability": 0.99}
    }',
    '{"region": "local", "zone": "primary", "networkZone": "local"}',
    'online',
    '{
        "cpu": 15.5, "memory": 45.2, "storage": 25.0,
        "network": {"bytesIn": 0, "bytesOut": 0, "connections": 0},
        "requests": {"count": 0, "avgLatency": 0, "errorRate": 0}
    }'
);

-- Insert default user preferences
INSERT INTO user_preferences (user_id, communication_style, response_length, domain_focus, learning_style, privacy_settings)
VALUES (
    'default',
    'technical',
    'detailed',
    ARRAY['development', 'ai', 'infrastructure'],
    'mixed',
    '{
        "dataRetention": 30,
        "shareAcrossDevices": true,
        "anonymizePersonalInfo": false,
        "encryptSensitiveData": true
    }'
);

-- Grant permissions for application user
-- Note: Replace 'nyra_app' with your actual application database user
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO nyra_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO nyra_app;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO nyra_app;

COMMIT;