-- Lead Capture & Management Database Schema

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(255) UNIQUE,

    -- Contact Information
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name VARCHAR(255),

    -- Company Information
    company VARCHAR(255),
    job_title VARCHAR(255),
    industry VARCHAR(100),
    company_size VARCHAR(50),
    annual_revenue DECIMAL(15, 2),

    -- Lead Details
    source VARCHAR(100) NOT NULL,
    campaign VARCHAR(255),
    medium VARCHAR(100),
    referring_url TEXT,
    landing_page TEXT,

    -- Scoring and Status
    score INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'new',
    stage VARCHAR(50) DEFAULT 'unqualified',
    temperature VARCHAR(20) DEFAULT 'cold',

    -- Assignment
    assigned_to UUID,
    assigned_at TIMESTAMP,
    territory VARCHAR(100),

    -- Enrichment Data
    enriched BOOLEAN DEFAULT false,
    enriched_at TIMESTAMP,
    enrichment_data JSONB,

    -- TwentyCRM Integration
    twenty_crm_id VARCHAR(255),
    twenty_crm_synced_at TIMESTAMP,

    -- Additional Data
    custom_fields JSONB DEFAULT '{}',
    tags TEXT[],
    notes TEXT,

    -- Metadata
    ip_address INET,
    user_agent TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    converted_at TIMESTAMP,

    -- Indexes
    CONSTRAINT leads_email_key UNIQUE (email)
);

-- Lead Activities table
CREATE TABLE IF NOT EXISTS lead_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,

    activity_type VARCHAR(50) NOT NULL,
    activity_data JSONB DEFAULT '{}',
    description TEXT,

    performed_by UUID,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lead Scoring Rules table
CREATE TABLE IF NOT EXISTS scoring_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,

    rule_type VARCHAR(50) NOT NULL,
    condition JSONB NOT NULL,
    score_impact INTEGER NOT NULL,

    active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lead Assignment Rules table
CREATE TABLE IF NOT EXISTS assignment_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,

    conditions JSONB NOT NULL,
    assign_to UUID,
    territory VARCHAR(100),

    priority INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users/Agents table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),

    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'agent',

    territory VARCHAR(100),
    capacity INTEGER DEFAULT 100,
    current_leads_count INTEGER DEFAULT 0,

    active BOOLEAN DEFAULT true,
    api_key VARCHAR(255) UNIQUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,

    events TEXT[] NOT NULL,
    headers JSONB DEFAULT '{}',
    secret VARCHAR(255),

    active BOOLEAN DEFAULT true,

    retry_count INTEGER DEFAULT 3,
    timeout_ms INTEGER DEFAULT 30000,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Webhook Deliveries table
CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,

    event_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,

    status VARCHAR(50) DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,

    request_headers JSONB,
    response_status INTEGER,
    response_body TEXT,
    error_message TEXT,

    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lead Duplicates table
CREATE TABLE IF NOT EXISTS lead_duplicates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    duplicate_lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,

    match_type VARCHAR(50) NOT NULL,
    confidence_score DECIMAL(5, 2) NOT NULL,
    match_details JSONB,

    resolved BOOLEAN DEFAULT false,
    resolved_action VARCHAR(50),
    resolved_at TIMESTAMP,
    resolved_by UUID,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT lead_duplicates_unique UNIQUE (lead_id, duplicate_lead_id)
);

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,

    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    scopes TEXT[] DEFAULT '{}',
    rate_limit INTEGER DEFAULT 1000,

    active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP,
    last_used_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_company ON leads(company);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_score ON leads(score DESC);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_twenty_crm_id ON leads(twenty_crm_id);

CREATE INDEX idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX idx_lead_activities_type ON lead_activities(activity_type);
CREATE INDEX idx_lead_activities_performed_at ON lead_activities(performed_at DESC);

CREATE INDEX idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX idx_webhook_deliveries_created_at ON webhook_deliveries(created_at DESC);

CREATE INDEX idx_lead_duplicates_lead_id ON lead_duplicates(lead_id);
CREATE INDEX idx_lead_duplicates_resolved ON lead_duplicates(resolved);

-- Full-text search indexes
CREATE INDEX idx_leads_full_name_trgm ON leads USING gin(full_name gin_trgm_ops);
CREATE INDEX idx_leads_company_trgm ON leads USING gin(company gin_trgm_ops);
CREATE INDEX idx_leads_email_trgm ON leads USING gin(email gin_trgm_ops);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scoring_rules_updated_at BEFORE UPDATE ON scoring_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignment_rules_updated_at BEFORE UPDATE ON assignment_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default scoring rules
INSERT INTO scoring_rules (name, description, rule_type, condition, score_impact, priority) VALUES
('Company Email', 'Higher score for business emails', 'email_domain', '{"exclude_domains": ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"]}', 15, 10),
('Job Title - Executive', 'C-level executives', 'job_title', '{"keywords": ["CEO", "CTO", "CFO", "COO", "Chief", "President", "VP", "Vice President"]}', 25, 20),
('Job Title - Manager', 'Managers and directors', 'job_title', '{"keywords": ["Manager", "Director", "Head of"]}', 15, 15),
('Company Size - Enterprise', 'Large companies (500+ employees)', 'company_size', '{"values": ["500-1000", "1000-5000", "5000+"]}', 20, 18),
('Company Size - Mid-Market', 'Mid-sized companies (50-500)', 'company_size', '{"values": ["50-100", "100-500"]}', 10, 17),
('High Revenue', 'Companies with high annual revenue', 'annual_revenue', '{"min": 10000000}', 15, 16),
('Form Completion', 'Completed contact form', 'source', '{"values": ["contact_form", "demo_request"]}', 10, 5),
('Referral', 'Came from referral', 'source', '{"values": ["referral", "partner"]}', 20, 12);

-- Insert default assignment rules
INSERT INTO assignment_rules (name, description, conditions, territory, priority) VALUES
('North America Territory', 'Assign leads from North America', '{"territory": ["US", "CA", "MX"]}', 'north_america', 10),
('Europe Territory', 'Assign leads from Europe', '{"territory": ["UK", "DE", "FR", "ES", "IT"]}', 'europe', 9),
('Enterprise Leads', 'High-value enterprise leads', '{"company_size": ["1000-5000", "5000+"], "score_min": 70}', 'enterprise', 20),
('SMB Leads', 'Small to medium business leads', '{"company_size": ["1-10", "10-50", "50-100"], "score_min": 40}', 'smb', 5);
