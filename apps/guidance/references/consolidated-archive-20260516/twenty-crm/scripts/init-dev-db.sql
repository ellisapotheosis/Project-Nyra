-- TwentyCRM Development Database Initialization
-- This script sets up the development database with sample data

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schema for Nyra integration
CREATE SCHEMA IF NOT EXISTS nyra_integration;

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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lead_metadata_twenty_lead_id ON nyra_integration.lead_metadata(twenty_lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_metadata_lead_grade ON nyra_integration.lead_metadata(nyra_lead_grade);

-- Create quotes table
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

-- Create sample data for development
INSERT INTO nyra_integration.lead_metadata (
    twenty_lead_id,
    nyra_lead_score,
    nyra_lead_grade,
    credit_score_range,
    annual_income,
    down_payment_percent,
    employment_years,
    liquid_assets,
    loan_amount,
    property_type,
    occupancy_type,
    purchase_type
) VALUES
    (uuid_generate_v4(), 92, 'A', '800+', 125000, 20.0, 7, 75000, 450000, 'single-family', 'primary', 'purchase'),
    (uuid_generate_v4(), 78, 'B', '740-799', 85000, 15.0, 3, 45000, 325000, 'condo', 'primary', 'purchase'),
    (uuid_generate_v4(), 65, 'C', '670-739', 65000, 10.0, 2, 25000, 275000, 'townhome', 'primary', 'refinance'),
    (uuid_generate_v4(), 45, 'D', '580-669', 45000, 5.0, 1, 10000, 200000, 'single-family', 'investment', 'purchase');

-- Insert sample quotes
INSERT INTO nyra_integration.quotes (
    twenty_lead_id,
    quote_number,
    loan_amount,
    interest_rate,
    apr,
    monthly_payment,
    product_type,
    rate_lock_expires_at,
    status,
    created_by
)
SELECT
    lm.twenty_lead_id,
    'DEV-Q-' || lpad(row_number() OVER (ORDER BY lm.created_at)::text, 6, '0'),
    lm.loan_amount,
    CASE lm.nyra_lead_grade
        WHEN 'A' THEN 6.375
        WHEN 'B' THEN 6.500
        WHEN 'C' THEN 6.750
        ELSE 7.000
    END,
    CASE lm.nyra_lead_grade
        WHEN 'A' THEN 6.421
        WHEN 'B' THEN 6.552
        WHEN 'C' THEN 6.798
        ELSE 7.045
    END,
    CASE lm.nyra_lead_grade
        WHEN 'A' THEN 2825
        WHEN 'B' THEN 2057
        WHEN 'C' THEN 1842
        ELSE 1330
    END,
    CASE lm.property_type
        WHEN 'condo' THEN '30Y Conventional Condo'
        WHEN 'investment' THEN '30Y Investment Property'
        ELSE '30Y Conventional Fixed'
    END,
    NOW() + INTERVAL '30 days',
    'active',
    'dev-system'
FROM nyra_integration.lead_metadata lm;
