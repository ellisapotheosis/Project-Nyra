---
name: pr-signal-triage
description: Filter PR bot/comment noise and extract only actionable engineering signals.
---

# PR Signal Triage

Use this skill when PR comment volume is high and signal is diluted by tooling noise.

## Why this exists
Recent PRs (#401-#410) include repeated non-actionable noise (`Sourcery private repo access`, `Greptile trial ended`) mixed with high-value deploy/review findings.

## Classification model
Classify each PR comment into one bucket:
1. `actionable-regression`
2. `deploy-failure`
3. `review-coverage-gap`
4. `tooling-noise`

## Extraction protocol
1. Pull full PR comments.
2. Tag each comment with one bucket.
3. Keep only buckets 1-3 in remediation list.
4. Summarize ignored noise separately.

## Evidence output format
- PR:
- Comment source:
- Bucket:
- Concrete signal:
- Required action:
- Owner:

## Example anchors
- `Too many files changed for review` -> `review-coverage-gap`
- `Cloudflare Pages Deployment Failed` -> `deploy-failure`
- Trial/paywall notices without code issues -> `tooling-noise`
