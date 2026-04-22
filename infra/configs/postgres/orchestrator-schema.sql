-- Project Nyra Orchestrator Schema
-- For use by n8n workflows and AI Assistant tracking

-- 1. Lead Intake Log (Raw)
CREATE TABLE IF NOT EXISTS lead_intake_log (
    id SERIAL PRIMARY KEY,
    lead_id UUID, -- Reference to CRM Lead ID if known
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    source VARCHAR(50),
    status VARCHAR(50),
    raw_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Local Leads Cache (for n8n drip logic)
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    lead_score INTEGER DEFAULT 0,
    status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Lead Campaigns (n8n drip state)
CREATE TABLE IF NOT EXISTS lead_campaigns (
    id SERIAL PRIMARY KEY,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    campaign_type VARCHAR(50) DEFAULT 'drip',
    status VARCHAR(20) DEFAULT 'active', -- active, paused, completed, unsubscribed
    sms_enabled BOOLEAN DEFAULT true,
    email_enabled BOOLEAN DEFAULT true,
    day_number INTEGER DEFAULT 1,
    last_sms_sent TIMESTAMP WITH TIME ZONE,
    last_email_sent TIMESTAMP WITH TIME ZONE,
    sms_count INTEGER DEFAULT 0,
    email_count INTEGER DEFAULT 0,
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SMS Activity Log
CREATE TABLE IF NOT EXISTS sms_activity_log (
    id SERIAL PRIMARY KEY,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    phone VARCHAR(50),
    message TEXT,
    message_type VARCHAR(50), -- welcome, reminder, etc.
    status VARCHAR(20), -- sent, delivered, failed
    direction VARCHAR(10) DEFAULT 'outbound', -- outbound, inbound
    provider_ref VARCHAR(255),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_campaign_status ON lead_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_lead ON lead_campaigns(lead_id);
