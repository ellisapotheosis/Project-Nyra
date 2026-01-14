-- Project Nyra - Initial Database Schema
-- PostgreSQL schema for all business services
-- Created: 2026-01-13

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- BORROWERS / LEADS
-- =============================================================================

CREATE TABLE borrowers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    credit_score INTEGER CHECK (credit_score BETWEEN 300 AND 850),
    property_value DECIMAL(12, 2),
    down_payment DECIMAL(12, 2),
    loan_amount DECIMAL(12, 2),
    property_state CHAR(2),
    property_zip VARCHAR(10),
    status VARCHAR(50) DEFAULT 'new',
    source VARCHAR(100),
    notes TEXT,
    twenty_crm_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_borrowers_email ON borrowers(email);
CREATE INDEX idx_borrowers_phone ON borrowers(phone);
CREATE INDEX idx_borrowers_status ON borrowers(status);
CREATE INDEX idx_borrowers_created_at ON borrowers(created_at);

-- =============================================================================
-- QUOTES
-- =============================================================================

CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    borrower_id UUID NOT NULL REFERENCES borrowers(id) ON DELETE CASCADE,
    loan_amount DECIMAL(12, 2) NOT NULL,
    property_value DECIMAL(12, 2) NOT NULL,
    down_payment DECIMAL(12, 2) NOT NULL,
    credit_score INTEGER NOT NULL,
    loan_type VARCHAR(50) NOT NULL,
    loan_term INTEGER NOT NULL,
    ltv_ratio DECIMAL(5, 2),
    interest_rate DECIMAL(5, 3) NOT NULL,
    monthly_payment DECIMAL(10, 2) NOT NULL,
    principal_and_interest DECIMAL(10, 2) NOT NULL,
    pmi_monthly DECIMAL(10, 2) DEFAULT 0,
    estimated_taxes DECIMAL(10, 2),
    estimated_insurance DECIMAL(10, 2),
    total_monthly_payment DECIMAL(10, 2) NOT NULL,
    closing_costs DECIMAL(10, 2),
    apr DECIMAL(5, 3),
    approval_likelihood VARCHAR(50),
    approval_confidence DECIMAL(3, 2),
    property_state CHAR(2),
    property_zip VARCHAR(10),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_quotes_borrower_id ON quotes(borrower_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_created_at ON quotes(created_at);
CREATE INDEX idx_quotes_interest_rate ON quotes(interest_rate);

-- =============================================================================
-- CAMPAIGNS
-- =============================================================================

CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    borrower_id UUID NOT NULL REFERENCES borrowers(id) ON DELETE CASCADE,
    campaign_type VARCHAR(100) NOT NULL DEFAULT '45_day_drip',
    name VARCHAR(200),
    status VARCHAR(50) DEFAULT 'pending',
    current_day INTEGER DEFAULT 0,
    total_days INTEGER DEFAULT 45,
    next_action_at TIMESTAMP WITH TIME ZONE,
    paused_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campaigns_borrower_id ON campaigns(borrower_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_next_action_at ON campaigns(next_action_at);
CREATE INDEX idx_campaigns_campaign_type ON campaigns(campaign_type);

-- =============================================================================
-- MESSAGES
-- =============================================================================

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    borrower_id UUID NOT NULL REFERENCES borrowers(id) ON DELETE CASCADE,
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('sms', 'email', 'voice')),
    template_id VARCHAR(100),
    subject VARCHAR(500),
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    twilio_message_sid VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_campaign_id ON messages(campaign_id);
CREATE INDEX idx_messages_borrower_id ON messages(borrower_id);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_channel ON messages(channel);
CREATE INDEX idx_messages_scheduled_at ON messages(scheduled_at);
CREATE INDEX idx_messages_sent_at ON messages(sent_at);

-- =============================================================================
-- MESSAGE TEMPLATES
-- =============================================================================

CREATE TABLE message_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL UNIQUE,
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('sms', 'email', 'voice')),
    subject VARCHAR(500),
    content TEXT NOT NULL,
    variables JSONB,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_message_templates_name ON message_templates(name);
CREATE INDEX idx_message_templates_channel ON message_templates(channel);
CREATE INDEX idx_message_templates_category ON message_templates(category);

-- =============================================================================
-- USER PREFERENCES
-- =============================================================================

CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    borrower_id UUID NOT NULL REFERENCES borrowers(id) ON DELETE CASCADE,
    preference_key VARCHAR(100) NOT NULL,
    preference_value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(borrower_id, preference_key)
);

CREATE INDEX idx_user_preferences_borrower_id ON user_preferences(borrower_id);
CREATE INDEX idx_user_preferences_key ON user_preferences(preference_key);

-- =============================================================================
-- TRIGGER FOR UPDATED_AT
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_borrowers_updated_at BEFORE UPDATE ON borrowers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_templates_updated_at BEFORE UPDATE ON message_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
