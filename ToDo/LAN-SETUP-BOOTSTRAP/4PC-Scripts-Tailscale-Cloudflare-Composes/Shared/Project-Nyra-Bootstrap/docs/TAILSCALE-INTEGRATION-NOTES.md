# Tailscale Integration - Implementation Notes

## Implementation Complete

Date: 2026-01-15

### Created Files

#### Configuration Files
- `bootstrap/configs/tailscale/docker-compose.tailscale.yml` - Reusable Docker Compose snippet
- `bootstrap/configs/tailscale/tailscale-acls.json` - Access Control List configuration
- `bootstrap/configs/tailscale/auth-key-template.txt` - Auth key generation guide

#### Setup Scripts (Orchestrator)
- `bootstrap/orchestrator-mini/scripts/setup-tailscale.sh` - Bash setup script for Linux/WSL
- `bootstrap/orchestrator-mini/scripts/setup-tailscale.ps1` - PowerShell setup script for Windows

#### Setup Scripts (Worker Nodes)
- `bootstrap/gaming-pc/scripts/setup-tailscale.sh` - Gaming PC bash script
- `bootstrap/gaming-pc/scripts/setup-tailscale.ps1` - Gaming PC PowerShell script
- `bootstrap/work-laptop/scripts/setup-tailscale.sh` - Work laptop bash script
- `bootstrap/work-laptop/scripts/setup-tailscale.ps1` - Work laptop PowerShell script
- `bootstrap/media-server/scripts/setup-tailscale.sh` - Media server bash script
- `bootstrap/media-server/scripts/setup-tailscale.ps1` - Media server PowerShell script

#### GUI Installer Integration
- `bootstrap/installer/src/services/tailscaleService.ts` - Tailscale service API
- `bootstrap/installer/src/components/TailscaleSetup.tsx` - React setup component

#### Documentation
- `bootstrap/docs/TAILSCALE-SETUP.md` - Comprehensive setup and usage guide

### Manual Steps Required

#### 1. Update InstallationProgress Component

The file `bootstrap/installer/src/components/InstallationProgress.tsx` needs to be manually updated to include the Tailscale phase:

**Changes needed:**

1. Add Tailscale to phase labels:
```typescript
const phaseLabels: Record<string, string> = {
  selection: 'Selection',
  windows: 'Windows Bootstrap',
  wsl: 'WSL Bootstrap',
  deployment: 'File Deployment',
  tailscale: 'Tailscale Setup',  // ADD THIS LINE
  validation: 'Validation',
  complete: 'Complete',
  error: 'Error',
};
```

2. Update phase indicators array:
```typescript
{['selection', 'windows', 'wsl', 'deployment', 'tailscale', 'validation', 'complete'].map(
  // ... rest of the code
)}
```

#### 2. Integrate TailscaleSetup Component

In your installation flow, add the TailscaleSetup component after deployment:

```typescript
import { TailscaleSetup } from '../components/TailscaleSetup';

// In your installation orchestrator
if (currentPhase === 'tailscale') {
  return (
    <TailscaleSetup
      nodeType={pcType === 'orchestrator-mini' ? 'orchestrator' : 'worker'}
      hostname={pcName}
      onComplete={(success, nodeInfo) => {
        if (success) {
          // Proceed to validation
          setPhase('validation');
        }
      }}
      onProgress={(message) => {
        // Log progress
        addLog({ level: 'info', message, component: 'Tailscale' });
      }}
    />
  );
}
```

#### 3. Generate Tailscale Auth Keys

For each PC, generate auth keys in the Tailscale admin console:

1. Go to https://login.tailscale.com/admin/settings/keys
2. Click "Generate auth key"
3. Configure:
   - **Orchestrator**: Tags: `tag:orchestrator,tag:exit-node`, Pre-approved: Routes + Exit node
   - **Workers**: Tags: `tag:worker,tag:[pc-name]`, Pre-approved: Routes
4. Store in Infisical:
   ```bash
   infisical secrets set TAILSCALE_AUTH_KEY_ORCHESTRATOR tskey-auth-xxxxx --env prod --path /project-nyra/tailscale
   infisical secrets set TAILSCALE_AUTH_KEY_GAMING_PC tskey-auth-xxxxx --env prod --path /project-nyra/tailscale
   infisical secrets set TAILSCALE_AUTH_KEY_WORK_LAPTOP tskey-auth-xxxxx --env prod --path /project-nyra/tailscale
   infisical secrets set TAILSCALE_AUTH_KEY_MEDIA_SERVER tskey-auth-xxxxx --env prod --path /project-nyra/tailscale
   ```

#### 4. Apply ACL Configuration

1. Go to https://login.tailscale.com/admin/acls
2. Copy contents of `bootstrap/configs/tailscale/tailscale-acls.json`
3. Paste into ACL editor
4. Click "Save"

#### 5. Test the Setup

For each PC:

**Automated (GUI Installer):**
- Run the GUI installer
- It will detect network info and set up Tailscale automatically
- For orchestrator, approve exit node and subnet routes in admin console

**Manual (Scripts):**
```bash
# Orchestrator
cd bootstrap/orchestrator-mini/scripts
sudo ./setup-tailscale.sh  # Linux
# OR
.\setup-tailscale.ps1  # Windows (as Admin)

# Workers
cd bootstrap/[pc-name]/scripts
sudo ./setup-tailscale.sh  # Linux
# OR
.\setup-tailscale.ps1  # Windows (as Admin)
```

**Manual (Docker):**
1. Add Tailscale service from `docker-compose.tailscale.yml` to your `docker-compose.yml`
2. Set environment variables in `.env`:
   ```env
   HOSTNAME=orchestrator-mini
   TAILSCALE_AUTH_KEY=tskey-auth-xxxxx
   TAILSCALE_EXIT_NODE=true  # orchestrator only
   TAILSCALE_ROUTES=10.0.0.0/24  # orchestrator only
   ```
3. Run: `docker-compose up -d tailscale`

#### 6. Verify Connectivity

After setup:
```bash
# Check status
tailscale status

# Get IP
tailscale ip -4

# Test connectivity
ping orchestrator-mini-tailscale
ping gaming-pc-tailscale
ping work-laptop-tailscale
ping media-server-tailscale

# Test MagicDNS
nslookup orchestrator-mini-tailscale
```

### Architecture Summary

**Mesh Topology:**
- Orchestrator: Exit node + Subnet router (10.0.0.0/24)
- Workers: Standard nodes with route acceptance
- All nodes: MagicDNS enabled for name resolution

**Use Cases:**
- **Tailscale**: Internal PC-to-PC communication, service orchestration, SSH
- **Cloudflared**: External public access, custom domains, DDoS protection

**Security:**
- Auth keys stored in Infisical
- ACLs enforce least privilege
- WireGuard encryption (end-to-end)
- Regular key rotation (90 days)

### Troubleshooting

See `bootstrap/docs/TAILSCALE-SETUP.md` for comprehensive troubleshooting guide.

Common issues:
1. **Connection failed**: Check firewall (UDP 41641), restart service
2. **DNS not resolving**: Re-enable with `tailscale up --accept-dns`
3. **Subnet routes not working**: Approve in admin console, enable IP forwarding
4. **Exit node unavailable**: Approve in admin console
5. **Slow performance**: Check if using DERP relay vs direct connection

### Next Steps

1. Generate and store auth keys in Infisical
2. Apply ACL configuration
3. Run setup scripts on each PC
4. Test connectivity between all nodes
5. Update Docker Compose files to use Tailscale IPs
6. Configure services to communicate via Tailscale mesh

### Performance Notes

- **Latency**: 1-5ms (direct P2P), 20-50ms (DERP relay)
- **Throughput**: 500-1000 Mbps (LAN), 100-200 Mbps (Internet)
- **Overhead**: ~1-2% CPU, ~50-100 MB memory per node

### References

- Main documentation: `bootstrap/docs/TAILSCALE-SETUP.md`
- ACL configuration: `bootstrap/configs/tailscale/tailscale-acls.json`
- Docker snippet: `bootstrap/configs/tailscale/docker-compose.tailscale.yml`
- Auth key guide: `bootstrap/configs/tailscale/auth-key-template.txt`

---

**Status**: Implementation Complete - Manual Integration Required
**Last Updated**: 2026-01-15
