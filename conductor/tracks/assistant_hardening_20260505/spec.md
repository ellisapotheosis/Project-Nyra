# Specification: Assistant Hardening and Landing Lead Capture

## Overview

This track focuses on production-readiness for the AI assistant and the lead ingestion flow from the public landing page. It ensures the assistant is safe and auditable, and that leads are correctly captured and attributed.

## Objectives

- **Assistant Token Gate**: Ensure the internal chat proxy uses token-based authorization.
- **Proposed Action Cards**: UI for assistant-suggested tasks (with approval buttons) to avoid direct state mutation.
- **Audit Logging**: Log assistant-triggered tool requests.
- **Landing Integration**: Wire public landing page form to `crmApi.ingestLead`.
- **Consent Enforcement**: Enforce mandatory consent checkboxes and log consent timestamps/source.

## Success Criteria

- Assistant cannot perform actions without explicit broker approval via cards.
- All landing page leads are automatically created in Twenty CRM with source attribution.
