-- Project Nyra - Seed Data
-- Sample data for development and testing
-- Created: 2026-01-13

-- Sample Borrower
INSERT INTO borrowers (email, phone, first_name, last_name, credit_score, property_value, down_payment, loan_amount, property_state, property_zip, status, source)
VALUES 
    ('john.doe@example.com', '555-0100', 'John', 'Doe', 750, 450000, 90000, 360000, 'CA', '90210', 'active', 'website'),
    ('jane.smith@example.com', '555-0101', 'Jane', 'Smith', 680, 350000, 35000, 315000, 'TX', '75001', 'active', 'referral'),
    ('bob.johnson@example.com', '555-0102', 'Bob', 'Johnson', 720, 500000, 100000, 400000, 'FL', '33139', 'new', 'website');

-- Sample Message Templates
INSERT INTO message_templates (name, channel, subject, content, category)
VALUES 
    ('welcome_email', 'email', 'Welcome to RateHunter - Your Mortgage Journey Starts Here', 
     'Hi {{first_name}},\n\nThank you for choosing RateHunter for your mortgage needs. We''re excited to help you find the best rates.\n\nYour personalized quote is ready. Based on a {{loan_amount}} loan, we estimate monthly payments of {{monthly_payment}}.\n\nNext steps:\n1. Review your quote\n2. Submit your application\n3. Get pre-approved\n\nBest regards,\nThe RateHunter Team', 
     'onboarding'),
    
    ('day_3_followup_sms', 'sms', NULL, 
     'Hi {{first_name}}, just checking in on your mortgage quote. Have questions? Reply YES for a callback from our team.', 
     'followup'),
    
    ('rate_alert_email', 'email', 'Good News! Rates Just Dropped',
     'Hi {{first_name}},\n\nGreat news! Interest rates have decreased. Your previous rate was {{old_rate}}%, and you may now qualify for {{new_rate}}%.\n\nThis could save you ${{monthly_savings}}/month!\n\nLock in this rate before it changes.\n\nThe RateHunter Team',
     'alert');

-- Sample Consent Records
INSERT INTO consent_records (borrower_id, consent_type, channel, granted, granted_at, method)
SELECT 
    id, 
    'marketing_communications', 
    'all', 
    TRUE, 
    CURRENT_TIMESTAMP,
    'web_form'
FROM borrowers
WHERE email = 'john.doe@example.com';
