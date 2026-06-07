# Integration Options Matrix - 2026-05-20

This matrix supports prompt `22_integrations_research_discovery.md`. It is intentionally recommendation-oriented and does not add dependencies.

## Sources Checked

- Twilio US SMS pricing: https://www.twilio.com/en-us/sms/pricing/us
- Twilio SendGrid product/pricing entry point: https://www.twilio.com/en-us/sendgrid
- Microsoft Graph `sendMail`: https://learn.microsoft.com/en-us/graph/api/user-sendmail
- n8n pricing/community edition: https://n8n.io/pricing/
- Activepieces self-host install overview: https://www.activepieces.com/docs/install/overview
- Twenty self-host docs: https://docs.twenty.com/developers/self-host/self-host
- Supabase pricing: https://supabase.com/pricing

## Recommendations

| Capability                    | Default                            | Free/Cheap Path                                                                                       | Upgrade Path                                                                | Constraint                                                                           |
| ----------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| CRM system of record          | Twenty CRM                         | Self-host Twenty for data control                                                                     | Paid Twenty licenses/support if needed                                      | All business mutations must route through Nyra services, not assistant direct writes |
| Workflow execution            | n8n                                | Self-host community edition for internal execution glue                                               | n8n cloud/enterprise only if ops burden or enterprise controls justify it   | n8n cannot own campaign definitions or business state                                |
| Secondary workflow/connectors | Activepieces                       | Self-host Community Edition for connector coverage and MCP experiments                                | Activepieces paid/enterprise features only after connector needs are proven | Internal glue only; not system of record                                             |
| SMS/voice                     | Twilio                             | Pay-as-you-go, start with low-volume 10DLC/toll-free path                                             | Volume discounts/short codes after throughput is real                       | A2P registration, carrier fees, STOP handling, and consent gates are mandatory       |
| Transactional email           | SendGrid or Microsoft Graph        | Microsoft Graph if sending through owned Microsoft 365 mailbox; SendGrid for API-first deliverability | Dedicated SendGrid plan/support as volume grows                             | Send only through communication-service with audit and approval gates                |
| Internal mailbox/drafts       | Microsoft Graph                    | Use draft/send APIs with least-privilege permissions                                                  | Add app permissions only when delegated flow is insufficient                | `202 Accepted` from Graph means accepted, not delivered                              |
| Auth/app backend              | Supabase-compatible stack          | Self-host/local Supabase-compatible auth and Postgres services where practical                        | Supabase cloud when operations cost exceeds hosting savings                 | Clerk is not the target auth provider unless reauthorized                            |
| Scheduling                    | Cal.com or Microsoft bookings path | Prefer existing Microsoft 365 if already owned; Cal.com only if product scheduling UX is needed       | Managed scheduling after broker workflow proves it                          | Must not bypass CRM/audit timeline                                                   |

## Priority Order

1. Keep Twenty, compliance-service, approval-service, communication-service, and quote-service as the core business boundaries.
2. Use Microsoft Graph for owner mailbox/draft workflows before adding another paid email workflow tool.
3. Use Twilio for SMS/voice only behind compliance and approval gates.
4. Keep n8n and Activepieces self-hosted/internal until a concrete managed feature is worth paying for.
5. Revisit SendGrid plan tier only after sender-domain verification, warmup, bounce handling, and volume expectations are known.

## Notes

- Twilio US SMS pricing is usage-based and includes per-message pricing plus carrier fees and number leasing; budget estimates should include A2P 10DLC registration and failed-message processing fees.
- Activepieces docs state Community Edition is free/open source and deployable with Docker/Docker Compose/Kubernetes.
- n8n pricing page confirms a self-hosted Community Edition is available on GitHub.
- Twenty self-host docs emphasize data ownership, compliance/data residency, and customization.
- Microsoft Graph `sendMail` returns `202 Accepted`; delivery status still needs provider/log callbacks or mailbox telemetry.
