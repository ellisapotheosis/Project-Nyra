-- TwentyCRM Production Database Initialization
-- This script sets up the initial database structure for TwentyCRM

-- Create database if not exists (handled by Docker)
-- CREATE DATABASE IF NOT EXISTS twenty;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE twenty TO twenty;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schema for Nyra integration
CREATE SCHEMA IF NOT EXISTS nyra_integration;
GRANT ALL ON SCHEMA nyra_integration TO twenty;

-- Create table for storing Nyra-specific lead data
CREATE TABLE IF NOT EXISTS nyra_integration.lead_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    twenty_lead_id UUID NOT NULL,
    nyra_lead_score INTEGER,
    nyra_lead_grade VARCHAR(1) CHECK (nyra_lead_grade IN ('A', 'B', 'C', 'D')),
    credit_score_range VARCHAR(50),
    annual_income DECIMAL(12,2),
    down_payment_percent DECIMAL(5,2),
    employment_years INTEGER,
    liquid_assets DECIMAL(12,2),
    loan_amount DECIMAL(12,2),
    property_type VARCHAR(50),
    occupancy_type VARCHAR(50),
    purchase_type VARCHAR(50),
    rate_lock_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lead_metadata_twenty_lead_id ON nyra_integration.lead_metadata(twenty_lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_metadata_lead_grade ON nyra_integration.lead_metadata(nyra_lead_grade);
CREATE INDEX IF NOT EXISTS idx_lead_metadata_created_at ON nyra_integration.lead_metadata(created_at);

-- Create table for quotes
CREATE TABLE IF NOT EXISTS nyra_integration.quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    twenty_lead_id UUID NOT NULL,
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    loan_amount DECIMAL(12,2) NOT NULL,
    interest_rate DECIMAL(6,3) NOT NULL,
    apr DECIMAL(6,3) NOT NULL,
    monthly_payment DECIMAL(10,2) NOT NULL,
    loan_term_years INTEGER NOT NULL DEFAULT 30,
    product_type VARCHAR(100) NOT NULL,
    rate_lock_expires_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'locked', 'expired', 'withdrawn')),
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for quotes
CREATE INDEX IF NOT EXISTS idx_quotes_twenty_lead_id ON nyra_integration.quotes(twenty_lead_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON nyra_integration.quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON nyra_integration.quotes(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION nyra_integration.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_lead_metadata_updated_at BEFORE UPDATE ON nyra_integration.lead_metadata FOR EACH ROW EXECUTE FUNCTION nyra_integration.update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON nyra_integration.quotes FOR EACH ROW EXECUTE FUNCTION nyra_integration.update_updated_at_column();

-- Insert sample data for development/testing
-- This will be populated by the application
