-- LiteLLM Database Initialization
-- Creates tables for tracking usage, costs, and configuration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- USAGE TRACKING
-- ========================================
CREATE TABLE IF NOT EXISTS usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id VARCHAR(255) NOT NULL,
    tenant_id VARCHAR(255),
    model VARCHAR(255) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    request_type VARCHAR(50) NOT NULL,
    input_tokens INTEGER NOT NULL DEFAULT 0,
    output_tokens INTEGER NOT NULL DEFAULT 0,
    total_tokens INTEGER NOT NULL DEFAULT 0,
    cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
    latency_ms INTEGER,
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Indexes for usage logs
CREATE INDEX IF NOT EXISTS idx_usage_logs_tenant ON usage_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_model ON usage_logs(model);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created ON usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_logs_success ON usage_logs(success);

-- ========================================
-- COST TRACKING
-- ========================================
CREATE TABLE IF NOT EXISTS cost_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    model VARCHAR(255) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    total_requests INTEGER NOT NULL DEFAULT 0,
    successful_requests INTEGER NOT NULL DEFAULT 0,
    failed_requests INTEGER NOT NULL DEFAULT 0,
    total_tokens INTEGER NOT NULL DEFAULT 0,
    input_tokens INTEGER NOT NULL DEFAULT 0,
    output_tokens INTEGER NOT NULL DEFAULT 0,
    total_cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, date, model, provider)
);

-- Indexes for cost tracking
CREATE INDEX IF NOT EXISTS idx_cost_tracking_tenant_date ON cost_tracking(tenant_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_cost_tracking_date ON cost_tracking(date DESC);

-- ========================================
-- BUDGET MANAGEMENT
-- ========================================
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_id VARCHAR(255) NOT NULL UNIQUE,
    max_budget DECIMAL(10, 2) NOT NULL,
    current_spend DECIMAL(10, 2) NOT NULL DEFAULT 0,
    time_period VARCHAR(50) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    alert_threshold DECIMAL(3, 2) NOT NULL DEFAULT 0.80,
    block_on_exceed BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- TENANT MANAGEMENT
-- ========================================
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL UNIQUE,
    api_key VARCHAR(255) NOT NULL,
    allowed_models TEXT[],
    budget_id VARCHAR(255),
    rate_limit_per_minute INTEGER NOT NULL DEFAULT 60,
    rate_limit_per_hour INTEGER NOT NULL DEFAULT 1000,
    rate_limit_per_day INTEGER NOT NULL DEFAULT 10000,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Indexes for tenants
CREATE INDEX IF NOT EXISTS idx_tenants_api_key ON tenants(api_key);
CREATE INDEX IF NOT EXISTS idx_tenants_active ON tenants(is_active);

-- ========================================
-- WORKER HEALTH TRACKING
-- ========================================
CREATE TABLE IF NOT EXISTS worker_health (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id VARCHAR(255) NOT NULL,
    worker_url VARCHAR(500) NOT NULL,
    worker_type VARCHAR(100) NOT NULL,
    is_healthy BOOLEAN NOT NULL DEFAULT true,
    response_time_ms INTEGER,
    last_check TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    error_count INTEGER NOT NULL DEFAULT 0,
    success_count INTEGER NOT NULL DEFAULT 0,
    metadata JSONB
);

-- Indexes for worker health
CREATE INDEX IF NOT EXISTS idx_worker_health_id ON worker_health(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_health_check ON worker_health(last_check DESC);
CREATE INDEX IF NOT EXISTS idx_worker_health_healthy ON worker_health(is_healthy);

-- ========================================
-- AUDIT LOGS
-- ========================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- ========================================
-- VIEWS FOR ANALYTICS
-- ========================================

-- Daily cost summary by tenant
CREATE OR REPLACE VIEW daily_cost_summary AS
SELECT
    tenant_id,
    date,
    SUM(total_requests) as total_requests,
    SUM(total_tokens) as total_tokens,
    SUM(total_cost) as total_cost,
    COUNT(DISTINCT model) as unique_models
FROM cost_tracking
GROUP BY tenant_id, date
ORDER BY date DESC, total_cost DESC;

-- Worker health summary
CREATE OR REPLACE VIEW worker_health_summary AS
SELECT
    worker_id,
    worker_type,
    is_healthy,
    AVG(response_time_ms) as avg_response_time,
    error_count,
    success_count,
    CASE
        WHEN success_count + error_count > 0
        THEN ROUND((success_count::DECIMAL / (success_count + error_count)) * 100, 2)
        ELSE 0
    END as success_rate,
    last_check
FROM worker_health
GROUP BY worker_id, worker_type, is_healthy, error_count, success_count, last_check
ORDER BY last_check DESC;

-- Budget utilization
CREATE OR REPLACE VIEW budget_utilization AS
SELECT
    budget_id,
    max_budget,
    current_spend,
    ROUND((current_spend / max_budget) * 100, 2) as utilization_percent,
    max_budget - current_spend as remaining_budget,
    period_start,
    period_end,
    is_active
FROM budgets
ORDER BY utilization_percent DESC;

-- ========================================
-- FUNCTIONS
-- ========================================

-- Function to update cost tracking (upsert)
CREATE OR REPLACE FUNCTION upsert_cost_tracking(
    p_tenant_id VARCHAR,
    p_date DATE,
    p_model VARCHAR,
    p_provider VARCHAR,
    p_tokens INTEGER,
    p_input_tokens INTEGER,
    p_output_tokens INTEGER,
    p_cost DECIMAL,
    p_success BOOLEAN
) RETURNS VOID AS $$
BEGIN
    INSERT INTO cost_tracking (
        tenant_id, date, model, provider,
        total_requests, successful_requests, failed_requests,
        total_tokens, input_tokens, output_tokens, total_cost
    )
    VALUES (
        p_tenant_id, p_date, p_model, p_provider,
        1,
        CASE WHEN p_success THEN 1 ELSE 0 END,
        CASE WHEN p_success THEN 0 ELSE 1 END,
        p_tokens, p_input_tokens, p_output_tokens, p_cost
    )
    ON CONFLICT (tenant_id, date, model, provider)
    DO UPDATE SET
        total_requests = cost_tracking.total_requests + 1,
        successful_requests = cost_tracking.successful_requests + CASE WHEN p_success THEN 1 ELSE 0 END,
        failed_requests = cost_tracking.failed_requests + CASE WHEN p_success THEN 0 ELSE 1 END,
        total_tokens = cost_tracking.total_tokens + p_tokens,
        input_tokens = cost_tracking.input_tokens + p_input_tokens,
        output_tokens = cost_tracking.output_tokens + p_output_tokens,
        total_cost = cost_tracking.total_cost + p_cost,
        updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Function to update budget spend
CREATE OR REPLACE FUNCTION update_budget_spend(
    p_budget_id VARCHAR,
    p_cost DECIMAL
) RETURNS VOID AS $$
BEGIN
    UPDATE budgets
    SET
        current_spend = current_spend + p_cost,
        updated_at = CURRENT_TIMESTAMP
    WHERE budget_id = p_budget_id
    AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- INITIAL DATA
-- ========================================

-- Insert default budgets
INSERT INTO budgets (budget_id, max_budget, time_period, period_start, period_end)
VALUES
    ('global', 1000.0, 'monthly', DATE_TRUNC('month', CURRENT_DATE), DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day'),
    ('engineering', 500.0, 'monthly', DATE_TRUNC('month', CURRENT_DATE), DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day'),
    ('research', 300.0, 'monthly', DATE_TRUNC('month', CURRENT_DATE), DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day'),
    ('production', 200.0, 'monthly', DATE_TRUNC('month', CURRENT_DATE), DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')
ON CONFLICT (budget_id) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'LiteLLM database initialized successfully!';
END $$;
