-- Project Nyra - Audit Logging Schema
-- Comprehensive audit trail for compliance
-- Created: 2026-01-13

-- =============================================================================
-- AUDIT LOGS
-- =============================================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    borrower_id UUID REFERENCES borrowers(id) ON DELETE SET NULL,
    service VARCHAR(100) NOT NULL,
    action VARCHAR(200) NOT NULL,
    endpoint VARCHAR(500),
    method VARCHAR(10),
    input_data JSONB,
    output_data JSONB,
    decision VARCHAR(100),
    rationale TEXT,
    confidence_score DECIMAL(3, 2),
    compliance_status VARCHAR(50),
    user_agent TEXT,
    ip_address INET,
    session_id VARCHAR(100),
    duration_ms INTEGER,
    status_code INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_borrower_id ON audit_logs(borrower_id);
CREATE INDEX idx_audit_logs_service ON audit_logs(service);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_compliance_status ON audit_logs(compliance_status);
CREATE INDEX idx_audit_logs_session_id ON audit_logs(session_id);

-- =============================================================================
-- COMPLIANCE EVENTS
-- =============================================================================

CREATE TABLE compliance_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_log_id UUID REFERENCES audit_logs(id) ON DELETE CASCADE,
    borrower_id UUID REFERENCES borrowers(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    regulation VARCHAR(50),
    rule_violated TEXT,
    action_taken VARCHAR(200),
    escalated BOOLEAN DEFAULT FALSE,
    escalated_to VARCHAR(200),
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_compliance_events_audit_log_id ON compliance_events(audit_log_id);
CREATE INDEX idx_compliance_events_borrower_id ON compliance_events(borrower_id);
CREATE INDEX idx_compliance_events_severity ON compliance_events(severity);
CREATE INDEX idx_compliance_events_escalated ON compliance_events(escalated);
CREATE INDEX idx_compliance_events_created_at ON compliance_events(created_at DESC);

-- =============================================================================
-- HUMAN ESCALATIONS
-- =============================================================================

CREATE TABLE human_escalations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    borrower_id UUID REFERENCES borrowers(id) ON DELETE SET NULL,
    audit_log_id UUID REFERENCES audit_logs(id) ON DELETE SET NULL,
    compliance_event_id UUID REFERENCES compliance_events(id) ON DELETE SET NULL,
    reason VARCHAR(500) NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to VARCHAR(200),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'cancelled')),
    context JSONB,
    resolution TEXT,
    resolved_by VARCHAR(200),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_human_escalations_borrower_id ON human_escalations(borrower_id);
CREATE INDEX idx_human_escalations_status ON human_escalations(status);
CREATE INDEX idx_human_escalations_priority ON human_escalations(priority);
CREATE INDEX idx_human_escalations_assigned_to ON human_escalations(assigned_to);
CREATE INDEX idx_human_escalations_created_at ON human_escalations(created_at DESC);

CREATE TRIGGER update_human_escalations_updated_at BEFORE UPDATE ON human_escalations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- CONSENT TRACKING
-- =============================================================================

CREATE TABLE consent_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    borrower_id UUID NOT NULL REFERENCES borrowers(id) ON DELETE CASCADE,
    consent_type VARCHAR(100) NOT NULL,
    channel VARCHAR(20) CHECK (channel IN ('sms', 'email', 'voice', 'all')),
    granted BOOLEAN DEFAULT FALSE,
    granted_at TIMESTAMP WITH TIME ZONE,
    revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT,
    method VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_consent_records_borrower_id ON consent_records(borrower_id);
CREATE INDEX idx_consent_records_consent_type ON consent_records(consent_type);
CREATE INDEX idx_consent_records_granted ON consent_records(granted);
CREATE INDEX idx_consent_records_channel ON consent_records(channel);

CREATE TRIGGER update_consent_records_updated_at BEFORE UPDATE ON consent_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
