# Nyra deployment runbook

Canonical procedure. Supersedes every Nexus-era deployment document.

## Preconditions

| # | Check | Command |
|---|---|---|
| 1 | on the right branch | `git status --short --branch` |
| 2 | rollback point exists | `git branch --list 'backup/*'` |
| 3 | runtime env rendered by the Infisical Agent | `ls -l runtime-secrets/` |
| 4 | image pins are digests, not tags | `grep IMAGE= .env.example` |
| 5 | all profiles render | `./scripts/deploy/validate-compose-profiles.sh` |

Never hand-write a secret into `runtime-secrets/`. Render it.

## Access from `worker-rtx5090` (WSL2)

Tailscale runs on the **Windows** side. WSL2 is not itself a tailnet peer, but
it **does** have working outbound IP routing to `100.64.0.0/10` via Windows.

```bash
# works from WSL2 bash - use this
ssh oracle-vps 'hostname'
ping -c1 100.64.0.3

# tailscale CLI queries need the Windows detour
powershell.exe -Command "& 'C:\Program Files\Tailscale\tailscale.exe' status"
```

If the WSL2-side `tailscale` binary reports "Logged out", you invoked the wrong
binary. Do not run `tailscale up`; the Windows side is already authenticated.

## Deployment order

Do not reorder. In particular, **never invert step 13 and step 21** — MCP
registrations move to LiteLLM before Nexus is removed.

| # | Step | Where |
|---|---|---|
| 1 | inventory + snapshot | any |
| 2 | validate live Tailnet | any |
| 3 | validate GPU resources | GPU hosts |
| 4 | create working branch | any |
| 5 | update root compose/profile structure | repo |
| 6 | deploy `lmcache-redis` | `worker-rtx5090` |
| 7 | migrate 5090 vLLM to vLLM+LMCache | `worker-rtx5090` |
| 8 | migrate 3090 Ti vLLM | `worker-rtx3090ti` |
| 9 | verify both `/v1/models` | any Tailnet client |
| 10 | move embedding capability off the retired worker | `worker-rtx5090` |
| 11 | stage LiteLLM v1.99.1 | `oracle-vps` |
| 12 | migrate model routes | repo + `oracle-vps` |
| 13 | **migrate MCP registrations** | repo + `oracle-vps` |
| 14 | enable scoped MCP Tool Search | `oracle-vps` |
| 15 | enable + test semantic filtering | `oracle-vps` |
| 16 | generate scoped keys | `oracle-vps` |
| 17 | migrate agent clients | repo |
| 18 | retarget the Cloudflare MCP Portal | Cloudflare |
| 19 | run side-by-side parity | any |
| 20 | cut production traffic | Cloudflare |
| 21 | **delete Nexus** | repo + `oracle-vps` |
| 22 | purge the retired GPU worker | repo |
| 23 | run negative searches | repo |
| 24 | run the full test suite | any |
| 25 | update docs | repo |
| 26 | generate the final migration report | repo |

## Step 6-7: `worker-rtx5090`

```bash
cp infra/env/worker-rtx5090.env.example .env      # then fill from Infisical
./scripts/deploy/deploy-worker-5090.sh
```

The script refuses to run if `nvidia-smi -L` cannot reach the GPU. Inside a
sandboxed WSL2 shell this reports
`Failed to initialize NVML: GPU access blocked by the operating system`; run
from a shell with GPU passthrough.

**Before the first production start**, validate the vLLM CLI against the pinned
image — the `--kv-transfer-config` syntax in `compose.yaml` has not been
verified against a running vLLM:

```bash
docker run --rm --entrypoint vllm \
  lmcache/vllm-openai@sha256:cb0a7630e91a39dc67bfb2c3486fa6616c3b2f254592117df6e6fb712ffb8999 \
  serve --help | less
```

Set `VLLM_MODEL_5090`, `VLLM_MAX_MODEL_LEN_5090` and `LMCACHE_REDIS_MAXMEMORY`
from measurement. They have no defaults on purpose.

### Step 10: activate the embedding endpoint

Ollama on `worker-rtx5090` currently binds `127.0.0.1:11434`, so Oracle cannot
reach it and `nyra-embedding` has no origin.

```bash
# on worker-rtx5090
sudo systemctl edit ollama      # add:  Environment="OLLAMA_HOST=100.64.0.11:11434"
sudo systemctl restart ollama

# verify from oracle-vps
ssh oracle-vps 'curl -fsS http://100.64.0.11:11434/api/tags | head -c 200'
```

`nomic-embed-text` is already pulled on that host. Keeping the **same** model
preserves the existing 768-dimension Qdrant collections — no re-embedding.

## Step 11-12: `oracle-vps`

**Port conflict, check first.** A `tailscale serve` TCP forward occupies
`100.64.0.3:4000` and points at `localhost:4000`, where nothing listens — the
current container publishes `127.0.0.1:4010`. The documented internal base URL
has therefore been a dead forward.

```bash
ssh oracle-vps 'tailscale serve status | grep -A3 ":4000"'
ssh oracle-vps 'sudo tailscale serve --tcp 4000 off'
```

`deploy-oracle.sh` refuses to run while that forward exists.

```bash
ssh oracle-vps 'cd ~/project-nyra && ./scripts/deploy/deploy-oracle.sh'
```

Verify:

```bash
curl -fsS http://100.64.0.3:4000/health/readiness
```

## Step 14-16: scoped keys

Run from a host that holds `LITELLM_MASTER_KEY`. **The master key is used only
to mint keys — never for acceptance tests.**

```bash
curl -sS http://100.64.0.3:4000/key/generate \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
        "key_alias": "nyra-dev",
        "models": ["nyra-general","nyra-fast","nyra-coding","nyra-reasoning"],
        "object_permission": {
          "mcp_tool_search_enabled": true,
          "mcp_access_groups": ["nyra-dev"]
        },
        "rpm_limit": 120,
        "duration": "90d"
      }'
```

Repeat for `nyra-mortgage` (`mcp_access_groups: ["nyra-mortgage"]`),
`nyra-automation`, `nyra-observability` and `nyra-admin`.

Mint one key with `"mcp_tool_search_enabled": false` — the parity suite needs it
as the negative control for the permission gate.

Store every key in Infisical. Never in a file in this repo.

### Step 15: enable semantic filtering

Only after the embedding endpoint answers:

```bash
curl -sS http://100.64.0.3:4000/v1/embeddings \
  -H "Authorization: Bearer $NYRA_LITELLM_DEV_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"model":"nyra-embedding","input":"mortgage lead lookup"}'
```

Expect a 200 and a 768-element vector. Then flip
`litellm_settings.mcp_semantic_tool_filter.enabled` to `true` and redeploy the
`oracle` profile.

## Step 18-20: Cloudflare cutover

Today `mcp-gateway.projectnyra.com` reaches Grafbase Nexus through Caddy:

```
mcp-gateway.projectnyra.com -> caddy -> nexus:3000
```

**Preserve the security boundary. Change only the origin.**

1. Inventory the current Nexus-facing tunnel route, Access application, MCP
   portal, linked MCP server and service-token policy.
2. Point the origin at LiteLLM's MCP endpoint (`/mcp` on the tunnel origin).
3. Confirm `code_mode = off` and that
   `?optimize_context=search_and_execute` is **not** appended.
4. Test old and new side by side where practical.
5. Run: MCP initialize, `tools/list`, virtual tool search, virtual tool call,
   service-auth access, human OAuth access, a denied client, DLP/logging, and a
   timeout.
6. Only then move production traffic.

Do not expose LiteLLM's master/admin interface just because the MCP data plane
is reachable.

## Step 19: parity

```bash
export LITELLM_BASE_URL=http://100.64.0.3:4000
export NYRA_LITELLM_DEV_KEY=... NYRA_LITELLM_MORTGAGE_KEY=... NYRA_LITELLM_NOSEARCH_KEY=...
export NYRA_MCP_PORTAL_URL=... CF_ACCESS_CLIENT_ID=... CF_ACCESS_CLIENT_SECRET=...

pip install -r tests/integration/requirements.txt
pytest tests/integration/mcp -v -s
```

Read the `NEXUS DELETION GATE` block. **Nexus may be deleted only when it reads
`GATE: MET`.** See `NYRA_MCP_RUNBOOK.md`.

## Step 21: delete Nexus

Only after the gate is met and production traffic has moved.

```bash
git rm -r services/nexus-router
git rm .github/workflows/nexus-router-ci.yml
git rm infra/hosts/oracle-vps/docker-compose.nexus-router-mcp.yml
git rm infra/hosts/oracle-vps/nexus-router-mcp-config.yml
git rm infra/mcp-gateway/nexus-router-mcp-config.yml
git rm infra/hosts/oracle-vps/cloudflared-config-nexus-router.yml
git rm scripts/validate-nexus-router.sh
git rm -r tests/integration/nexus-router
git rm -r infra/images/nexus-router infra/configs/nexus
```

On the host:

```bash
ssh oracle-vps 'docker rm -f oracle-vps-nexus-router nyra-network-nyra-nexus'
```

Then re-run the negative gate:

```bash
! git grep -nEi 'services/nexus-router|nexus-router:|NEXUS_MCP_URL|NEXUS_ROUTER_URL' -- ':!docs/archive/**'
```

Search plain `nexus` separately — unrelated legitimate terminology exists
(`01_Webapp_Nexus`, `flow-nexus` skills). Classify every remaining hit
explicitly.

## Step 22-23: retired worker + negative searches

```bash
! git grep -nEi 'worker[-_]?rtx3060|worker3060|rtx[-_]?3060|100\.64\.0\.12' -- ':!docs/archive/**'
```

Known classified exceptions — each is a documented non-hit, not an oversight:

| Path | Classification |
|---|---|
| `.agent/memory/**` | agent episodic/semantic memory. Project policy: *"Never delete episodic or semantic memory entries."* Historical record, not active configuration. |
| `.omc/`, `.playwright-mcp/` | ignored operational session artifacts |
| `docs/refactor/**` | the migration record, which must name what it removed |
| this file, line ~251 | the gate command itself necessarily contains its own pattern |

## Step 24: full validation

```bash
./scripts/deploy/validate-compose-profiles.sh
shellcheck -S warning scripts/deploy/*.sh
make -n help                       # Makefile parses
pytest tests/integration/mcp -v -s
gitleaks detect --config .gitleaks.toml
```

Do not suppress validation merely to make CI green.

## Security acceptance

```bash
ssh oracle-vps 'ss -lntup'
ssh oracle-vps 'docker ps --format "table {{.Names}}\t{{.Ports}}"'
powershell.exe -Command "& 'C:\Program Files\Tailscale\tailscale.exe' status"
```

Verify: LiteLLM not publicly bound; vLLM `:8000` not public; neither Redis
public; OmniRoute not public; Infisical management interfaces not public;
Cloudflare is the only public ingress; Tailnet ACLs restrict worker services; no
secrets in git; no master key in any agent env; no provider key in prompts; no
retired GPU worker; no Nexus runtime.

Test public-domain reachability from **outside** the Tailnet.
