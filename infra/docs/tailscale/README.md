# Tailscale Notes

- Oracle, orchestrator, and all workers must join same tailnet.
- DB/cache services remain tailnet-internal only.
- Use ACLs to allow orchestrator->workers inference traffic.
