# Specification: Campaign Builder MVP (Mortgage drip sequence editor)

## Overview

This track replaces the current placeholder campaign builder with a functional sequence editor. It allows brokers to define and manage multi-channel mortgage drip campaigns without interacting with n8n directly.

## Objectives

- **Visual Sequence Editor**: A card-based editor for adding, removing, and reordering touchpoints.
- **Multi-channel Support**: Support for SMS, Email, Voicemail Drops, and Broker Alert steps.
- **Persistence**: Save templates to the `campaign-engine` via `campaignApi`.

## Success Criteria

- Brokers can build a 7-day nurture sequence.
- Sequences are saved and retrievable via the UI.
