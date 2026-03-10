# Oracle Always Free: How to stay at $0/month (Nyra)

Generated: 2026-03-03 10:01:14

## The Always Free quotas that matter for Ampere A1 (VM.Standard.A1.Flex)

Oracle's Always Free docs state:
- **3,000 OCPU hours/month** and **18,000 GB hours/month** are free for **VM.Standard.A1.Flex**. This is "equivalent to 4 OCPUs and 24 GB of memory" for Always Free usage. 
- Always Free compute must be created in your **home region**.
- Block volume: **200 GB total** (boot + block combined) and **5 volume backups**, in the **home region**.

## The math (how Oracle bills A1 within the free bucket)

You stay free if:

- `sum_over_instances(OCPU * hours_running_in_month) <= 3000`
- `sum_over_instances(GB_RAM * hours_running_in_month) <= 18000`

A safe "max power while free" setting is **one A1 instance** at:

- **OCPU = 4**
- **RAM = 24 GB**
- running 24/7

For a 31‑day month (744 hours):
- OCPU-hours: 4 * 744 = 2,976 (within 3,000)
- GB-hours: 24 * 744 = 17,856 (within 18,000)

So 4/24 running nonstop is still under the free quota, with a small buffer.

### Alternative: split into two instances (same free usage, better isolation)
- Instance A (core data): 2 OCPU / 12 GB
- Instance B (apps): 2 OCPU / 12 GB
Both running 24/7 uses the same monthly totals as 4/24, but isolates failures.

## Storage settings (to stay in the 200 GB Always Free block volume bucket)

Oracle Always Free block volume is **200 GB total** (boot + block). Boot volume counts.

Recommendations:
- If you only run one instance: boot volume 100 GB is okay, leaving 100 GB for additional volumes.
- If you run two instances: keep boot volumes ~50 GB each (minimum is around 47–50 GB depending on current limits) so you don't consume the full 200 GB just on boots.

## Guardrails to prevent surprise charges

1) Keep all Always Free resources in the home region.
2) Avoid paid services by default (load balancers, extra public IPs, NAT gateways, large backups).
3) Set OCI Budgets/alerts + compartment quotas.
4) Prefer Cloudflared outbound tunnels over opening inbound ports.

## Citations
See: Oracle Always Free resources documentation and A1 pricing page.
