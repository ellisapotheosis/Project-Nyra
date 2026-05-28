# n8n Fallback Policy

Activepieces is primary for embedded/sold-app workflow builder use.

n8n remains available only if a required mortgage automation cannot be handled cleanly by:

1. Activepieces,
2. Letta orchestration,
3. OpenClaw agents,
4. OpenClaw cron jobs,
5. Composio,
6. Campaign Engine native scheduling.

If n8n remains necessary, do not expose raw n8n UI. Create a Project Nyra mortgage-drip-specific wrapper that only permits:

- call steps,
- SMS steps,
- voicemail/missed-call pings,
- email steps,
- SendGrid,
- Twilio,
- Calendly,
- Rebump,
- voice/convo/TTS steps,
- wait/branch/retry,
- STOP/DNC compliance gates,
- CRM task/update actions,
- quote request actions.

No generic n8n node universe for broker end users.
