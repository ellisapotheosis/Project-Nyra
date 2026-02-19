# Campaign migration (from your DOCX into Nyra)

Your original campaign scripts are preserved in:
- `assets/uploads/Campaign Day 1 to 5.docx`
- `assets/uploads/Campaign 6 to 36.docx`

This package also includes machine-converted YAML:
- `assets/campaigns/day1-5.yaml`
- `assets/campaigns/day6-36.yaml`

## How to use the YAML
The YAML is a neutral “source of truth” for campaigns:
- Nyra Admin can edit it
- n8n can execute it (read YAML -> schedule steps)
- Activepieces can deliver each step (SMS/email/voicemail connectors)

## Recommended runner pattern (n8n)
1) Webhook: `POST /campaigns/enroll`
2) Node: Load campaign YAML by name
3) Node: Expand placeholders (first_name, calendly_link, etc.)
4) Node: For each step:
   - Wait node (delay)
   - Call Activepieces workflow: `send_message` with channel + text
5) Writeback to TwentyCRM (activity timeline)

## Hard compliance controls
- SMS/voice: require explicit consent flag in Twenty.
- Quiet hours per borrower timezone.
- Add global opt-out keywords: STOP, UNSUBSCRIBE, etc.
- All outbound messages log:
  - campaign id, step id, channel, timestamp, tool used, consent check result.

## Known conversion limitations
- Some long paragraphs were truncated as `...` during export. Replace with full text from the DOCX.
- Voicemail scripts may not be present in the extracted text; add them manually.

## Prompt to finish the migration (paste into claude-flow)
See `prompts/claude-flow/02_CAMPAIGN_RUNNER_PROMPT.md`.
