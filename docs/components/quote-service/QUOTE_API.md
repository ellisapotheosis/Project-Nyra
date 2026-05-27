# QUOTE_API.md

## Role

Deterministic calculation of mortgage scenarios.

## Outputs

Every quote MUST return 3 distinct options:

1. **Lowest Payment**: Optimized for monthly cash flow.
2. **Balanced**: Recommended mortgage structure.
3. **Lowest Cost**: Optimized for long-term savings and break-even.

## Implementation

Currently using a deterministic mock engine in `packages/integration-adapters`. Future implementation will wire to real pricing engines.
