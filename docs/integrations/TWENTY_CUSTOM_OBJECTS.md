# TWENTY_CUSTOM_OBJECTS.md

## Overview
Project Nyra requires several custom objects in TwentyCRM to store mortgage-specific data. This document defines the schema for those objects.

## 1. MortgageLead (mortgageLeads)
Link this to the **Person** object. This is the canonical lead object used by `services/crm-api`.

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `personId` | Relation | Related Twenty Person/contact. |
| `loanPurpose` | Select | PURCHASE, REFI_CASH, REFI_RATE, HELOC |
| `loanAmount` | Currency (Micros) | Requested loan amount. |
| `propertyValue` | Currency (Micros) | Estimated property value when known. |
| `propertyState` | Text | 2-letter state code. |
| `campaignStatus` | Select | PENDING, ACTIVE, PAUSED, STOPPED |
| `creditScore` | Number | FICO score (optional). |
| `timeframe` | Select/Text | Purchase/refinance timeframe when provided. |
| `source` | Text | Lead source, form, partner, or campaign. |
| `metadata` | JSON | Dedupe keys, raw attribution, consent evidence, ingestion trace. |

## 2. Quote (quotes)
Link this to the **MortgageLead** object.

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `leadId` | Relation | Related MortgageLead. |
| `status` | Select | DRAFT, READY, APPROVED, SENT, EXPIRED |
| `interestRate` | Number (Decimal) | The selected interest rate. |
| `loanAmount` | Currency (Micros) | The quoted loan amount. |
| `metadata` | JSON | Full comparison data, assumptions, input hash, and calculation trace. |

## 3. CommunicationLog (communicationLogs)
Link this to the **Person** object.

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `channel` | Select | SMS, EMAIL, CALL, VOICEMAIL |
| `direction` | Select | INBOUND, OUTBOUND |
| `content` | Text (Rich) | The raw message body. |
| `providerId` | Text | Twilio/SendGrid reference ID. |

## 4. CampaignEnrollment (campaignEnrollments)

Link this to the **MortgageLead** or local lead metadata mirror.

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `leadId` | Relation/Text | Related MortgageLead id. |
| `campaignId` | Relation/Text | Campaign definition id. |
| `campaignName` | Text | Human readable campaign name. |
| `status` | Select | pending, active, paused, stopped, completed |
| `channelPreferences` | Multi-select | email, sms, voice |
| `nextTouch` | DateTime | Next planned workflow execution. |
| `metadata` | JSON | Pause reason, STOP evidence, workflow correlation ids. |

## 5. Compliance / Suppression Mirror

Twenty should expose contact-level fields or a custom suppression object for immediate enforcement:

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `consentEmail` | Select | UNKNOWN, OPTED_IN, OPTED_OUT, DO_NOT_CONTACT |
| `consentSms` | Select | UNKNOWN, OPTED_IN, OPTED_OUT, DO_NOT_CONTACT |
| `consentVoice` | Select | UNKNOWN, OPTED_IN, OPTED_OUT, DO_NOT_CONTACT |
| `consentTimestamp` | DateTime | Consent capture timestamp. |
| `doNotContact` | Boolean | Hard stop for all outbound communication. |
| `suppressionReason` | Text | STOP, unsubscribe, broker override, provider complaint, etc. |

## CRM API Mapping

- `POST /api/leads` searches Twenty contacts by email or phone before creating a new person/contact.
- A successful intake creates or updates the person/contact, then creates a `mortgageLead` with `campaignStatus: PENDING`.
- `POST /api/leads/:id/campaigns/enroll` mirrors campaign enrollment and marks the mortgage lead `ACTIVE`.
- `POST /api/leads/:id/campaigns/pause` pauses the enrollment mirror and marks the mortgage lead `PAUSED`.
- `POST /api/webhooks/reply` pauses campaigns on any reply and marks the mortgage lead `STOPPED` when STOP/unsubscribe intent is detected.

## Setup Notes

- Use Twenty custom-object API names that match the GraphQL operations in `packages/crm-client/src/index.ts`.
- Store money in micros where Twenty expects currency micros; quote-api canonical JSON uses cents in `amountCents`.
- Do not store provider credentials in Twenty custom-object metadata.
- Do not let agents or UI components mutate these objects directly. Use `services/crm-api`.
