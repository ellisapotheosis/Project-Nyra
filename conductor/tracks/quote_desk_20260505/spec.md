# Specification: Quote Desk MVP (FastAPI integration and broker approval gates)

## Overview

This track implements the broker-facing side of the mortgage quote system. It connects the webapp to the Python-based `quote-api` and introduces mandatory broker approval gates before a quote can be delivered to a borrower.

## Objectives

- **Scenario Generation UI**: Interface to input loan parameters and request scenarios.
- **3-Option Comparison**: Display Conventional, FHA, and VA/USDA side-by-side.
- **Broker Approval Gate**: UI to review assumptions, add notes, and mark a quote as "APPROVED" for borrower delivery.
- **Persistence**: Store quotes in the `crm-api` with link to the Twenty record.

## Success Criteria

- Brokers can generate deterministic quotes from within the webapp.
- No borrower can receive a quote until a broker has clicked "APPROVE".
