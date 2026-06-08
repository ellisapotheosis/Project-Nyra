-- nyra mortgage schema extensions for TwentyCRM
-- Adds borrower/loan/campaign/communication/quote tables plus compliance metadata

CREATE TABLE IF NOT EXISTS nyra_integration.borrowers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    twenty_lead_id UUID REFERENCES nyra_integration.lead_metadata(twenty_lead_id),

    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(30),
    nmls_id VARCHAR(50),
    ssn_encrypted VARCHAR(255),
    date_of_birth DATE,
    marital_status VARCHAR(20),
    dependents INTEGER,

    employer_name VARCHAR(255),
    job_title VARCHAR(100),
    employment_start_date DATE,
    employment_type VARCHAR(50),
    annual_income DECIMAL(12,2),
    gross_monthly_income DECIMAL(12,2),
    additional_income DECIMAL(12,2),
    employment_status VARCHAR(50),

    credit_score INTEGER,
    credit_report_date DATE,
    total_monthly_debts DECIMAL(10,2),
    dti_ratio DECIMAL(5,2),
    assets_total DECIMAL(12,2),
    liabilities_total DECIMAL(12,2),

    current_address TEXT,
    residence_type VARCHAR(50),
    monthly_housing_payment DECIMAL(10,2),
    years_at_residence DECIMAL(4,1),

    has_co_borrower BOOLEAN DEFAULT false,
    co_borrower_id UUID REFERENCES nyra_integration.borrowers(id),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_borrowers_twenty_lead_id ON nyra_integration.borrowers(twenty_lead_id);
CREATE INDEX IF NOT EXISTS idx_borrowers_credit_score ON nyra_integration.borrowers(credit_score);

ALTER TABLE nyra_integration.lead_metadata 
    ADD COLUMN IF NOT EXISTS consent_email BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS consent_sms BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS consent_voice BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS lead_source VARCHAR(50),
    ADD COLUMN IF NOT EXISTS do_not_contact BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS channel_preferences JSONB DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS nyra_integration.loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    borrower_id UUID REFERENCES nyra_integration.borrowers(id),
    twenty_lead_id UUID,

    loan_id VARCHAR(50) UNIQUE,
    loan_number VARCHAR(50) UNIQUE,
    los_loan_id VARCHAR(100),
    loan_type VARCHAR(30),
    loan_purpose VARCHAR(30),
    loan_amount DECIMAL(14,2),
    property_value DECIMAL(14,2),
    down_payment DECIMAL(12,2),
    ltv_ratio DECIMAL(5,2),
    interest_rate DECIMAL(6,4),
    apr DECIMAL(6,4),
    term_months INTEGER DEFAULT 360,
    monthly_payment DECIMAL(12,2),
    property_type VARCHAR(50),
    occupancy VARCHAR(50),
    dti_ratio DECIMAL(5,2),
    credit_score INTEGER,
    payment_option VARCHAR(50),
    notes TEXT,

    status VARCHAR(50) CHECK (status IN (
        'inquiry', 'pre_qualified', 'pre_approved', 'in_underwriting',
        'conditional_approval', 'clear_to_close', 'funded', 'closed', 'denied', 'withdrawn'
    )) DEFAULT 'inquiry',
    estimated_close_date DATE,
    lock_expiration TIMESTAMPTZ,
    assigned_loan_officer VARCHAR(255),
    source VARCHAR(50),
    timeline JSONB DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loans_lead_id ON nyra_integration.loans(twenty_lead_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON nyra_integration.loans(status);

CREATE TABLE IF NOT EXISTS nyra_integration.campaign_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID REFERENCES nyra_integration.lead_metadata(id),
    campaign_name VARCHAR(100) NOT NULL,
    campaign_type VARCHAR(50) CHECK (campaign_type IN (
        'new_lead_nurture', 'pre_approval', 'application_progress',
        'post_close', 'rate_alert', 're_engagement'
    )),
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    current_step INTEGER DEFAULT 0,
    status VARCHAR(20) CHECK (status IN ('active','paused','completed','unsubscribed')) DEFAULT 'active',
    last_touch TIMESTAMPTZ,
    next_touch TIMESTAMPTZ,
    channel_preferences VARCHAR[],
    decision_reason VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_enrollments_contact ON nyra_integration.campaign_enrollments(contact_id);
CREATE INDEX IF NOT EXISTS idx_campaign_enrollments_status ON nyra_integration.campaign_enrollments(status);

CREATE TABLE IF NOT EXISTS nyra_integration.communication_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID REFERENCES nyra_integration.lead_metadata(id),
    loan_id UUID REFERENCES nyra_integration.loans(id),
    campaign_enrollment_id UUID REFERENCES nyra_integration.campaign_enrollments(id),
    channel VARCHAR(30) CHECK (channel IN ('email','sms','voice_call','voicemail','in_app_chat')),
    direction VARCHAR(10) CHECK (direction IN ('inbound','outbound')),
    description TEXT,
    provider VARCHAR(50),
    provider_reference VARCHAR(255),
    content_preview TEXT,
    full_content TEXT,
    sent_at TIMESTAMPTZ,
    delivered BOOLEAN DEFAULT false,
    opened BOOLEAN DEFAULT false,
    clicked BOOLEAN DEFAULT false,
    replied BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comm_logs_contact ON nyra_integration.communication_logs(contact_id);
CREATE INDEX IF NOT EXISTS idx_comm_logs_loan ON nyra_integration.communication_logs(loan_id);
CREATE INDEX IF NOT EXISTS idx_comm_logs_channel ON nyra_integration.communication_logs(channel);

CREATE TABLE IF NOT EXISTS nyra_integration.quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id UUID REFERENCES nyra_integration.loans(id) ON DELETE SET NULL,
    twenty_lead_id UUID,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    scenarios JSONB NOT NULL DEFAULT '[]'::jsonb,
    pdf_url TEXT,
    sent_to_borrower BOOLEAN DEFAULT false,
    expires_at TIMESTAMPTZ,
    valid_for_days INTEGER DEFAULT 7,
    status VARCHAR(20) CHECK (status IN ('draft','sent','viewed','expired','accepted')) DEFAULT 'draft',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotes_loan_id ON nyra_integration.quotes(loan_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON nyra_integration.quotes(status);

CREATE TABLE IF NOT EXISTS nyra_integration.pipeline_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pipeline_sort ON nyra_integration.pipeline_stages(sort_order);

CREATE OR REPLACE FUNCTION nyra_integration.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_borrowers_updated_at BEFORE UPDATE ON nyra_integration.borrowers FOR EACH ROW EXECUTE FUNCTION nyra_integration.update_updated_at_column();
CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON nyra_integration.loans FOR EACH ROW EXECUTE FUNCTION nyra_integration.update_updated_at_column();
CREATE TRIGGER update_campaign_enrollments_updated_at BEFORE UPDATE ON nyra_integration.campaign_enrollments FOR EACH ROW EXECUTE FUNCTION nyra_integration.update_updated_at_column();
CREATE TRIGGER update_comm_logs_updated_at BEFORE UPDATE ON nyra_integration.communication_logs FOR EACH ROW EXECUTE FUNCTION nyra_integration.update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON nyra_integration.quotes FOR EACH ROW EXECUTE FUNCTION nyra_integration.update_updated_at_column();
CREATE TRIGGER update_pipeline_stages_updated_at BEFORE UPDATE ON nyra_integration.pipeline_stages FOR EACH ROW EXECUTE FUNCTION nyra_integration.update_updated_at_column();
