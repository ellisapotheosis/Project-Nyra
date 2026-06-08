# Project Nyra Integration Options Matrix

This document outlines potential integrations for future phases of Project Nyra.

## 1. Mortgage Pricing (PPE)

| Provider               | Type      | Pros                             | Cons                                        | Priority |
| ---------------------- | --------- | -------------------------------- | ------------------------------------------- | -------- |
| **LenderPrice**        | API / Web | Industry leader, broad coverage. | Paid, requires official broker credentials. | High     |
| **Optimal Blue**       | API       | Very robust, granular pricing.   | High cost, complex API.                     | Medium   |
| **Nyra Deterministic** | Internal  | Free, fast, fully controlled.    | Limited by manual rate updates.             | Current  |

## 2. Credit Data

| Provider               | Type   | Pros                               | Cons                                | Priority |
| ---------------------- | ------ | ---------------------------------- | ----------------------------------- | -------- |
| **Certified Credit**   | API    | Soft-pull support, mortgage focus. | Paid per pull.                      | High     |
| **Equifax / Experian** | API    | Direct source.                     | High barrier to entry (audit/cost). | Low      |
| **Self-Reported**      | Manual | Free, no compliance risk.          | Lower accuracy.                     | Current  |

## 3. Communication

| Provider            | Type | Pros                           | Cons                        | Priority |
| ------------------- | ---- | ------------------------------ | --------------------------- | -------- |
| **Twilio**          | API  | Gold standard for SMS/Voice.   | Pay-per-use, TCPA overhead. | Current  |
| **SendGrid**        | API  | Reliable transactional email.  | Pay-per-use.                | Current  |
| **Microsoft Graph** | API  | Use existing Office 365 seats. | Complexity of OAuth scopes. | Current  |

## 4. Automation & Glue

| Provider          | Type        | Pros                                 | Cons                             | Priority |
| ----------------- | ----------- | ------------------------------------ | -------------------------------- | -------- |
| **n8n**           | Self-hosted | Extremely flexible, no per-run cost. | Infrastructure overhead.         | Current  |
| **Supabase Edge** | Serverless  | Fast, scales with database.          | Cold start, locking to provider. | Low      |

## Recommendations

1. **Free/Open Source First**: Stick with n8n self-hosted and the Nyra Deterministic pricing model until volume justifies paid PPE.
2. **First Paid Upgrade**: Certified Credit soft-pulls to improve lead qualification accuracy.
3. **API Constraints**: Always wrap external integrations in a `nyra-domain` adapter to minimize lock-in.
