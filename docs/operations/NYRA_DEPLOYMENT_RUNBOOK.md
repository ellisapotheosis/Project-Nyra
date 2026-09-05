# Nyra deployment runbook

Canonical procedure. Supersedes every Nexus-era deployment document.

## Preconditions

| #   | Check                                       | Command                                         |
| --- | ------------------------------------------- | ----------------------------------------------- |
| 1   | on the right branch                         | `git status --short --branch`                   |
| 2   | rollback point exists                       | `git branch --list 'backup/*'`                  |
| 3   | runtime env rendered by the Infisical Agent | `ls -l runtime-secrets/`                        |
| 4   | image pins are digests, not tags            | `grep IMAGE= .env.example`                      |
| 5   | all profiles render                         | `./scripts/deploy/validate-compose-profiles.sh` |

Never hand-write a secret into `runtime-secrets/`. Render it.

## Access from the WSL2 hosts

The Windows hosts (`orchestrator`, `worker-rtx5090`, `worker-rtx3090ti`) run
WSL2 in **mirrored networking mode**. The Tailscale interface on the Windows
side is therefore visible _inside_ the guest as a real interface — the guest is
a first-class tailnet peer, not a NAT client:

```bash
ip addr show          # eth1: inet 100.64.0.11/32   (on worker-rtx5090)
                      # eth1: inet 100.64.0.10/32   (on orchestrator)
```

> An earlier revision of this document claimed "WSL2 is not itself a tailnet
> peer". That is **wrong** and was corrected after measurement. Do not build
> proxies or port-forwards around it.

Network traffic — `ssh`, `curl`, `ping` — works natively from WSL2 bash:

```bash
ssh oracle-vps 'hostname'
ping -c1 100.64.0.3
curl -fsS http://100.64.0.10:8081/health
```

The **only** reason to shell out to Windows is the `tailscale` CLI itself, which
is installed only on the Windows side:

```bash
powershell.exe -Command "& 'C:\Program Files\Tailscale\tailscale.exe' status"
```

If a WSL2-side `tailscale` binary reports "Logged out", you invoked the wrong
binary. Do not run `tailscale up`; the Windows side is already authenticated.

### orchestrator is a Windows SSH host

Inbound `ssh orchestrator '<posix command>'` lands in `cmd.exe`, not a POSIX
shell — `hostname -s` returns `hostname -s is not supported`. Anything that
needs Docker or these scripts must be re-entered into WSL:

```bash
ssh orchestrator 'wsl -d Ubuntu-24.04 -e bash -lc "<command>"'
```

## Deployment order

Do not reorder. In particular, **never invert step 13 and step 21** — MCP
registrations move to LiteLLM before Nexus is removed.

| #   | Step                                                  | Where               |
| --- | ----------------------------------------------------- | ------------------- |
| 1   | inventory + snapshot                                  | any                 |
| 2   | validate live Tailnet                                 | any                 |
| 3   | validate GPU resources                                | GPU hosts           |
| 4   | create working branch                                 | any                 |
| 5   | update root compose/profile structure                 | repo                |
| 6   | deploy `lmcache-redis`                                | `worker-rtx5090`    |
| 7   | migrate 5090 vLLM to vLLM+LMCache                     | `worker-rtx5090`    |
| 8   | migrate 3090 Ti vLLM                                  | `worker-rtx3090ti`  |
| 9   | verify both `/v1/models`                              | any Tailnet client  |
| 10  | deploy the memory-manager plane (embeddings + BitNet) | `orchestrator`      |
| 11  | stage LiteLLM v1.99.1                                 | `oracle-vps`        |
| 12  | migrate model routes                                  | repo + `oracle-vps` |
| 13  | **migrate MCP registrations**                         | repo + `oracle-vps` |
| 14  | enable scoped MCP Tool Search                         | `oracle-vps`        |
| 15  | enable + test semantic filtering                      | `oracle-vps`        |
| 16  | generate scoped keys                                  | `oracle-vps`        |
| 17  | migrate agent clients                                 | repo                |
| 18  | retarget the Cloudflare MCP Portal                    | Cloudflare          |
| 19  | run side-by-side parity                               | any                 |
| 20  | cut production traffic                                | Cloudflare          |
| 21  | **delete Nexus**                                      | repo + `oracle-vps` |
| 22  | purge the retired GPU worker                          | repo                |
| 23  | run negative searches                                 | repo                |
| 24  | run the full test suite                               | any                 |
| 25  | update docs                                           | repo                |
| 26  | generate the final migration report                   | repo                |

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

Rebinding this host's Ollama is still needed for `nyra-fast`
(`ollama/qwen3.5:latest`), which LiteLLM reaches at `http://100.64.0.11:11434`:

```bash
# on worker-rtx5090
sudo systemctl edit ollama      # add:  Environment="OLLAMA_HOST=100.64.0.11:11434"
sudo systemctl restart ollama
ssh oracle-vps 'curl -fsS http://100.64.0.11:11434/api/tags | head -c 200'
```

> **Superseded:** earlier revisions of this runbook told you to do the above in
> order to activate `nyra-embedding`. Embeddings no longer live on this host —
> see Step 10 below. This rebind is now only about the `nyra-fast` lane.

### Step 10: deploy the orchestrator memory-manager plane

`nyra-embedding` and `nyra-memory` are served by `orchestrator`
(`100.64.0.10`, "MiniApotheosis"), on CPU. Both GPU workers are pure inference.

**orchestrator's inbound SSH lands in a Windows shell**, not a POSIX one —
`ssh orchestrator 'hostname -s'` returns `hostname -s is not supported`. Docker
lives in the `Ubuntu-24.04` WSL distro, so the deployment has to be re-entered
into WSL. `deploy-all.sh` does this automatically via `deploy_remote_wsl`;
by hand it is:

```bash
cp infra/env/orchestrator.env.example .env      # then fill from Infisical
ssh orchestrator 'wsl -d Ubuntu-24.04 -e bash -lc \
  "cd ~/project-nyra && ./scripts/deploy/deploy-orchestrator.sh"'
```

First start is slow and that is expected: `memory-manager` compiles bitnet.cpp
from a pinned microsoft/BitNet commit and downloads ~1.1 GB of weights. The
health gate allows 30 minutes.

Verify both origins, from `oracle-vps`:

```bash
ssh oracle-vps 'curl -fsS http://100.64.0.10:8081/health'   # embeddings
ssh oracle-vps 'curl -fsS http://100.64.0.10:8087/health'   # memory-manager
```

Then verify the embedding **width**, which is a hard contract — anything other
than 768 means the wrong GGUF is loaded, and pointing mem0/Qdrant at it corrupts
the vector store:

```bash
curl -fsS http://100.64.0.10:8081/v1/embeddings \
  -H 'Content-Type: application/json' \
  -d '{"model":"nomic-embed-text","input":"dimension check"}' |
  python3 -c 'import json,sys; print(len(json.load(sys.stdin)["data"][0]["embedding"]))'
# must print exactly: 768
```

`deploy-orchestrator.sh` performs this check itself and aborts on any other
value.

No re-embedding is required. The model family and dimension count are unchanged
from the `worker-rtx5090` Ollama endpoint: measured cosine similarity between
the two endpoints on the same input is **0.999999581** at 768 dimensions.

Neither service holds a credential. They are unauthenticated Tailnet-only
origins behind LiteLLM, exactly like the vLLM workers.

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

Only after the orchestrator embedding endpoint answers (Step 10):

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

| Path                        | Classification                                                                                                                                     |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.agent/memory/**`          | agent episodic/semantic memory. Project policy: _"Never delete episodic or semantic memory entries."_ Historical record, not active configuration. |
| `.omc/`, `.playwright-mcp/` | ignored operational session artifacts                                                                                                              |
| `docs/refactor/**`          | the migration record, which must name what it removed                                                                                              |
| this file, line ~251        | the gate command itself necessarily contains its own pattern                                                                                       |

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
