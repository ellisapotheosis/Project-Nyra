# Agent Least Privilege Matrix

| Capability | Borrower assistant | Broker assistant | Operator | Service | Dev agent |
| --- | --- | --- | --- | --- | --- |
| View borrower-visible quote | Yes | Yes | Yes | Service-owned | Local fixtures only |
| Generate quote | No | Proposal only | Proposal only | Quote service | Local tests only |
| Send email/SMS/voice | No | Approval request only | Approval request only | Communication service | No production sends |
| Mutate CRM | No | Approval request only | Approval request only | CRM API | Local tests only |
| Pause campaign | No | Approval request only | Yes through campaign service | Campaign service | Local tests only |
| Handle STOP/unsubscribe | Report intent | Report intent | Yes through compliance service | Compliance service | Local tests only |
| Read secrets | No | No | No readback | Runtime injection only | No readback |
| Access workers directly | No | No | Health summary only | Tailscale service calls | Local/private only |

## Enforcement Points

1. BFF route authentication and surface role resolution.
2. Nexus role-filtered tool listing.
3. Nexus tool-call authorization.
4. Owning service validation.
5. Compliance and approval service gates.
6. Audit logging for accepted and denied actions.
