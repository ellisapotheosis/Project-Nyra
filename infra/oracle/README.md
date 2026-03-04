# Nyra Oracle One-VM + Terraform Pack

This folder now contains **two deployment layers**:

1. **Terraform (OCI infra provisioning)** for an Always Free Ampere A1 VM.
2. **Docker Compose (one-VM application stack)** for Nyra runtime services.

---

## Always Free sizing target (max power while staying $0/month)

Use:
- Shape: `VM.Standard.A1.Flex`
- `ocpu = 4`
- `memory_gb = 24`
- Run 24/7

Why this is free: Oracle Always Free A1 quota is 3,000 OCPU-hours + 18,000 GB-hours per month (≈ 4 OCPU / 24 GB continuously).

Storage guardrail:
- Keep **total boot + block volumes ≤ 200 GB** (home region)
- Keep backups within Always Free allowances (up to 5 backups)

---

## Directory Layout

```text
infra/oracle/
├── .env.example
├── docker-compose.oracle.yml
├── initdb/
│   └── 00_create_dbs.sql
├── main.tf
├── outputs.tf
├── README.md
├── terraform.tfvars.example
├── variables.tf
├── versions.tf
└── scripts/
    ├── 00_prereq_check.sh
    ├── 01_init.sh
    ├── 02_apply.sh
    └── 03_destroy.sh
```

---

## Part A — Provision Oracle VM with Terraform

### 1) Create OCI API key (one-time)

1. OCI Console → **Identity & Security** → **Users** → your user.
2. **API Keys** → **Add API Key**.
3. Generate or upload keypair.
4. Save:
   - private key (`~/.oci/oci_api_key.pem`)
   - fingerprint
   - user OCID
   - tenancy OCID

### 2) Configure variables

```bash
cd infra/oracle
cp terraform.tfvars.example terraform.tfvars
```

Populate required values:
- `tenancy_ocid`
- `user_ocid`
- `fingerprint`
- `private_key_path`
- `region`
- `compartment_ocid`
- `ssh_public_key`

Optional:
- `availability_domain` (useful for capacity retries)
- `ubuntu_version` (`22.04` or `24.04`)

### 3) Prereq check

```bash
./scripts/00_prereq_check.sh
```

### 4) Init/apply

```bash
./scripts/01_init.sh
./scripts/02_apply.sh
```

### 5) Get VM IP + SSH

```bash
terraform output -raw public_ip
ssh ubuntu@$(terraform output -raw public_ip)
```

### Capacity error handling

If OCI returns `Out of host capacity`:
1. Change `availability_domain` to another AD in the same region.
2. Or temporarily reduce to:
   - `ocpu = 2`
   - `memory_gb = 12`

---

## Part B — Run Nyra one-VM stack (Docker Compose)

This stack includes:
- RuVector Postgres
- Redis cache
- FalkorDB + Graphiti MCP
- TwentyCRM
- Activepieces
- n8n
- Moltbot/OpenClaw (`18789` / `18790`)
- Quote API (containerized from `services/quote-api`)
- Cloudflared optional profile

### 1) Configure environment

```bash
cd infra/oracle
cp .env.example .env
```

Set all `CHANGE_ME_*` values before first run.

### 2) Validate compose

```bash
docker compose --env-file .env -f docker-compose.oracle.yml config
```

### 3) Start services

```bash
docker compose --env-file .env -f docker-compose.oracle.yml up -d
```

### 4) Basic health checks

```bash
curl -fsS http://localhost:3000 >/dev/null && echo "twenty up"
curl -fsS http://localhost:8080 >/dev/null && echo "activepieces up"
curl -fsS http://localhost:5678 >/dev/null && echo "n8n up"
curl -fsS http://localhost:18789 >/dev/null && echo "moltbot up"
curl -fsS http://localhost:7070/health
```

### 5) Moltbot first-time onboarding

```bash
docker run -it --rm \
  -v clawdbot_config:/home/node/.clawdbot \
  moltbot/moltbot:latest onboard
```

Mem0 plugin (optional):

```bash
openclaw plugins install @mem0/openclaw-mem0
```

---

## Security notes

- No secrets are hardcoded in Terraform.
- Keep `.env` out of version control.
- Do not expose Postgres/Redis/FalkorDB ports publicly.
- Keep public ingress limited and front services with Cloudflare Access when possible.

---

## Destroy guard

Destructive operation is guarded.

```bash
./scripts/03_destroy.sh
# or non-interactive:
./scripts/03_destroy.sh "I AUTHORIZE DESTRUCTIVE ACTIONS"
```
