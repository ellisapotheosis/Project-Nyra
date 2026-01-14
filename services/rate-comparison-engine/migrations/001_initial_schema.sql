-- Mortgage Rate Comparison Engine - Initial Schema

-- Lenders Table
CREATE TABLE IF NOT EXISTS lenders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    website_url VARCHAR(500),
    scraper_enabled BOOLEAN DEFAULT true,
    scraper_config JSONB,
    logo_url VARCHAR(500),
    rating DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mortgage Rates Table
CREATE TABLE IF NOT EXISTS mortgage_rates (
    id SERIAL PRIMARY KEY,
    lender_id INTEGER NOT NULL REFERENCES lenders(id) ON DELETE CASCADE,
    rate_type VARCHAR(50) NOT NULL, -- '30-year-fixed', '15-year-fixed', '5/1-arm', etc.
    interest_rate DECIMAL(5,3) NOT NULL,
    apr DECIMAL(5,3) NOT NULL,
    points DECIMAL(4,2) DEFAULT 0,
    loan_amount_min DECIMAL(15,2),
    loan_amount_max DECIMAL(15,2),
    credit_score_min INTEGER,
    down_payment_min DECIMAL(5,2),
    fees JSONB, -- { "origination": 0, "processing": 0, "underwriting": 0 }
    effective_date DATE NOT NULL,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_interest_rate CHECK (interest_rate > 0 AND interest_rate < 100),
    CONSTRAINT valid_apr CHECK (apr > 0 AND apr < 100)
);

-- Historical Rates Table
CREATE TABLE IF NOT EXISTS historical_rates (
    id SERIAL PRIMARY KEY,
    lender_id INTEGER NOT NULL REFERENCES lenders(id) ON DELETE CASCADE,
    rate_type VARCHAR(50) NOT NULL,
    interest_rate DECIMAL(5,3) NOT NULL,
    apr DECIMAL(5,3) NOT NULL,
    points DECIMAL(4,2) DEFAULT 0,
    recorded_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Rate Alerts Table
CREATE TABLE IF NOT EXISTS rate_alerts (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    rate_type VARCHAR(50) NOT NULL,
    target_rate DECIMAL(5,3) NOT NULL,
    comparison_operator VARCHAR(10) NOT NULL, -- 'less_than', 'less_than_equal'
    loan_amount DECIMAL(15,2),
    credit_score INTEGER,
    down_payment DECIMAL(5,2),
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    notification_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_target_rate CHECK (target_rate > 0 AND target_rate < 100)
);

-- Rate Comparison Cache Table (for complex calculations)
CREATE TABLE IF NOT EXISTS rate_comparisons (
    id SERIAL PRIMARY KEY,
    comparison_hash VARCHAR(64) UNIQUE NOT NULL,
    loan_amount DECIMAL(15,2) NOT NULL,
    loan_term_years INTEGER NOT NULL,
    down_payment DECIMAL(5,2) NOT NULL,
    credit_score INTEGER NOT NULL,
    rate_type VARCHAR(50) NOT NULL,
    results JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Scraper Logs Table
CREATE TABLE IF NOT EXISTS scraper_logs (
    id SERIAL PRIMARY KEY,
    lender_id INTEGER REFERENCES lenders(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL, -- 'success', 'failed', 'partial'
    rates_scraped INTEGER DEFAULT 0,
    error_message TEXT,
    execution_time_ms INTEGER,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_mortgage_rates_lender ON mortgage_rates(lender_id);
CREATE INDEX idx_mortgage_rates_type ON mortgage_rates(rate_type);
CREATE INDEX idx_mortgage_rates_effective_date ON mortgage_rates(effective_date DESC);
CREATE INDEX idx_mortgage_rates_lookup ON mortgage_rates(rate_type, effective_date DESC, interest_rate);

CREATE INDEX idx_historical_rates_lender ON historical_rates(lender_id);
CREATE INDEX idx_historical_rates_type_date ON historical_rates(rate_type, recorded_date DESC);

CREATE INDEX idx_rate_alerts_active ON rate_alerts(is_active) WHERE is_active = true;
CREATE INDEX idx_rate_alerts_user ON rate_alerts(user_id);
CREATE INDEX idx_rate_alerts_type ON rate_alerts(rate_type);

CREATE INDEX idx_rate_comparisons_hash ON rate_comparisons(comparison_hash);
CREATE INDEX idx_rate_comparisons_expires ON rate_comparisons(expires_at);

CREATE INDEX idx_scraper_logs_lender ON scraper_logs(lender_id);
CREATE INDEX idx_scraper_logs_status ON scraper_logs(status);

-- Insert Sample Lenders
INSERT INTO lenders (name, website_url, scraper_enabled, rating) VALUES
('Quicken Loans', 'https://www.quickenloans.com', true, 4.5),
('Wells Fargo', 'https://www.wellsfargo.com', true, 4.2),
('Bank of America', 'https://www.bankofamerica.com', true, 4.3),
('Chase', 'https://www.chase.com', true, 4.4),
('US Bank', 'https://www.usbank.com', true, 4.1),
('Caliber Home Loans', 'https://www.caliberhomeloans.com', true, 4.0),
('Better.com', 'https://www.better.com', true, 4.6),
('Rocket Mortgage', 'https://www.rocketmortgage.com', true, 4.7)
ON CONFLICT (name) DO NOTHING;

-- Function to Update Updated_At Timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for Updated_At
CREATE TRIGGER update_lenders_updated_at BEFORE UPDATE ON lenders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rate_alerts_updated_at BEFORE UPDATE ON rate_alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to Archive Old Rates to Historical
CREATE OR REPLACE FUNCTION archive_old_rates()
RETURNS void AS $$
BEGIN
    INSERT INTO historical_rates (lender_id, rate_type, interest_rate, apr, points, recorded_date)
    SELECT lender_id, rate_type, interest_rate, apr, points, effective_date
    FROM mortgage_rates
    WHERE effective_date < CURRENT_DATE - INTERVAL '7 days'
    ON CONFLICT DO NOTHING;

    DELETE FROM mortgage_rates
    WHERE effective_date < CURRENT_DATE - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Cleanup Function for Expired Comparisons
CREATE OR REPLACE FUNCTION cleanup_expired_comparisons()
RETURNS void AS $$
BEGIN
    DELETE FROM rate_comparisons WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;
