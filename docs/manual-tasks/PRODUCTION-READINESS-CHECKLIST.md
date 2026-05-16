# Production Readiness Checklist - RateHunter Platform

**Last Updated**: 2026-01-21
**Version**: 1.0
**Owner**: Infrastructure Team
**Estimated Total Time**: 6-8 weeks

---

## Table of Contents

1. [Infrastructure Setup](#infrastructure-setup)
2. [Hardware Configuration](#hardware-configuration)
3. [External Service Setup](#external-service-setup)
4. [Security & Compliance](#security--compliance)
5. [Testing & Validation](#testing--validation)
6. [Go-Live Preparation](#go-live-preparation)

---

## Infrastructure Setup (Manual)

**Total Estimated Time**: 2-3 weeks
**Dependencies**: Domain budget, Cloudflare account access
**Team**: DevOps, Network Engineers

### 1. Purchase Domain Name (ratehunter.net)

**Time Estimate**: 2-4 hours
**Cost**: $12-50/year
**Prerequisites**: Budget approval, payment method

#### Steps:
- [ ] **Research domain availability**
  - Check ratehunter.net on multiple registrars (Namecheap, GoDaddy, Cloudflare)
  - Verify WHOIS information
  - Check trademark conflicts
  - Time: 30 minutes

- [ ] **Select registrar**
  - Compare pricing (registration + renewal)
  - Review privacy protection options
  - Check domain transfer policies
  - Verify registrar reputation
  - Time: 30 minutes

- [ ] **Complete purchase**
  - Create registrar account
  - Enable WHOIS privacy protection
  - Set auto-renewal if desired
  - Configure registrar 2FA
  - Save receipt and account credentials in password manager
  - Time: 1 hour

- [ ] **Configure initial DNS settings**
  - Note registrar nameservers
  - Prepare for Cloudflare migration
  - Document DNS management credentials
  - Time: 30 minutes

**Validation**: Domain resolves via WHOIS lookup, account access confirmed

---

### 2. Configure Cloudflare Account and DNS

**Time Estimate**: 4-6 hours
**Cost**: $20/month (Pro plan recommended)
**Prerequisites**: Domain name, email access, payment method

#### Steps:
- [ ] **Create Cloudflare account**
  - Sign up at cloudflare.com
  - Verify email address
  - Enable 2FA (TOTP or hardware key)
  - Set up account security settings
  - Time: 30 minutes

- [ ] **Add site to Cloudflare**
  - Click "Add Site" in dashboard
  - Enter ratehunter.net
  - Select plan (Pro recommended for advanced DDoS)
  - Time: 15 minutes

- [ ] **Update nameservers at registrar**
  - Copy Cloudflare nameservers (e.g., kyle.ns.cloudflare.com)
  - Log in to domain registrar
  - Update nameserver records
  - Save changes and note propagation time (2-48 hours)
  - Time: 30 minutes

- [ ] **Wait for DNS propagation**
  - Monitor Cloudflare dashboard for activation
  - Use `dig ratehunter.net NS` to verify
  - Test from multiple locations
  - Time: 2-48 hours (mostly waiting)

- [ ] **Configure DNS records**
  - Add A record for root domain (@) pointing to Cloudflare Pages
  - Add CNAME for www pointing to Pages
  - Add MX records for email (if applicable)
  - Add TXT records for domain verification
  - Set TTL to 300 seconds initially
  - Time: 1 hour

- [ ] **Enable Cloudflare security features**
  - Enable "Under Attack Mode" preparedness
  - Configure SSL/TLS to "Full (strict)"
  - Enable "Always Use HTTPS"
  - Enable "Automatic HTTPS Rewrites"
  - Configure WAF rules
  - Set up rate limiting rules
  - Time: 2 hours

- [ ] **Configure caching rules**
  - Set page rules for static assets (2-day cache)
  - Configure cache level (Standard)
  - Enable "Respect Existing Headers"
  - Set up cache purge API access
  - Time: 1 hour

**Validation**:
- DNS propagation complete (`nslookup ratehunter.net`)
- SSL certificate issued and active
- Security score A+ on Cloudflare dashboard

---

### 3. Set Up Cloudflare Pages Project

**Time Estimate**: 3-4 hours
**Prerequisites**: Cloudflare account, GitHub repository access
**Dependencies**: Completed DNS configuration

#### Steps:
- [ ] **Connect GitHub repository**
  - Navigate to Pages in Cloudflare dashboard
  - Click "Create a project"
  - Connect GitHub account (authorize Cloudflare app)
  - Select repository (ratehunter-landing)
  - Time: 30 minutes

- [ ] **Configure build settings**
  - Framework preset: Astro
  - Build command: `npm run build`
  - Build output directory: `dist`
  - Root directory: `/` or specific subdirectory
  - Node version: 20.x
  - Time: 30 minutes

- [ ] **Set environment variables**
  - Add production API keys
  - Configure PUBLIC_* variables for client-side
  - Set ANTHROPIC_API_KEY, OPENAI_API_KEY, etc.
  - Store secrets in Infisical, reference in Cloudflare
  - Time: 1 hour

- [ ] **Configure custom domain**
  - Add ratehunter.net as custom domain
  - Verify DNS records (auto-configured if using Cloudflare DNS)
  - Enable "Always Use HTTPS"
  - Wait for SSL certificate provisioning (1-5 minutes)
  - Time: 30 minutes

- [ ] **Set up preview deployments**
  - Enable automatic deployments for all branches
  - Configure preview URLs (branch-name.ratehunter.pages.dev)
  - Set up branch protection rules
  - Time: 30 minutes

- [ ] **Configure deployment settings**
  - Set production branch (main)
  - Enable build caching
  - Configure concurrent builds (if needed)
  - Set up deployment notifications (Slack/email)
  - Time: 30 minutes

- [ ] **Test initial deployment**
  - Trigger manual deployment
  - Monitor build logs
  - Verify deployment success
  - Test site accessibility
  - Time: 30 minutes

**Validation**:
- Site accessible at ratehunter.net
- SSL certificate valid (check with ssllabs.com)
- Build logs show no errors
- Preview deployments working

---

### 4. Configure cloudflared Tunnels on Each PC

**Time Estimate**: 6-8 hours (2 hours per PC × 3-4 PCs)
**Prerequisites**: PCs accessible, admin access, Cloudflare account
**Dependencies**: Cloudflare account configured

#### Steps (Per PC):

##### PC #1: Compute-01 (Coordinator - RTX 5090)
- [ ] **Install cloudflared**
  - Download from https://github.com/cloudflare/cloudflared/releases
  - Windows: Install MSI package
  - Linux: `sudo dpkg -i cloudflared.deb`
  - Verify: `cloudflared --version`
  - Time: 15 minutes

- [ ] **Authenticate cloudflared**
  - Run: `cloudflared tunnel login`
  - Browser opens for Cloudflare authentication
  - Select domain (ratehunter.net)
  - Save cert to `~/.cloudflared/cert.pem`
  - Time: 10 minutes

- [ ] **Create tunnel**
  - Run: `cloudflared tunnel create compute-01`
  - Note tunnel UUID (save to password manager)
  - Save tunnel credentials JSON
  - Time: 5 minutes

- [ ] **Configure tunnel routing**
  - Create config file: `~/.cloudflared/config.yml`
  ```yaml
  tunnel: <TUNNEL_UUID>
  credentials-file: /path/to/<TUNNEL_UUID>.json

  ingress:
    - hostname: compute-01.ratehunter.net
      service: http://localhost:8080
    - hostname: api.projectnyra.com
      service: http://localhost:3000
    - service: http_status:404
  ```
  - Time: 20 minutes

- [ ] **Create DNS records**
  - Run: `cloudflared tunnel route dns compute-01 compute-01.ratehunter.net`
  - Verify CNAME record created in Cloudflare DNS
  - Time: 10 minutes

- [ ] **Install as system service**
  - Windows: `cloudflared service install`
  - Linux: `sudo cloudflared service install`
  - Start service: `cloudflared service start`
  - Enable auto-start on boot
  - Time: 15 minutes

- [ ] **Test tunnel connectivity**
  - Start local service on port 8080
  - Access via https://compute-01.ratehunter.net
  - Check tunnel status: `cloudflared tunnel info compute-01`
  - Monitor logs: `cloudflared tunnel logs compute-01`
  - Time: 20 minutes

- [ ] **Configure firewall rules**
  - Allow outbound HTTPS (443) to Cloudflare
  - Block direct inbound connections (tunnel handles routing)
  - Document rules in security policy
  - Time: 15 minutes

##### PC #2: Worker-01 (RTX 3090)
- [ ] Repeat above steps with tunnel name `worker-01`
- [ ] Configure hostname: `worker-01.ratehunter.net`
- [ ] Set service port: `http://localhost:8081`
- [ ] Time: 2 hours

##### PC #3: Worker-02 (RTX 3060)
- [ ] Repeat above steps with tunnel name `worker-02`
- [ ] Configure hostname: `worker-02.ratehunter.net`
- [ ] Set service port: `http://localhost:8082`
- [ ] Time: 2 hours

##### PC #4: Worker-03 (Additional if available)
- [ ] Repeat above steps with tunnel name `worker-03`
- [ ] Configure hostname: `worker-03.ratehunter.net`
- [ ] Set service port: `http://localhost:8083`
- [ ] Time: 2 hours

**Validation**:
- All tunnels show "Registered" status in Cloudflare dashboard
- Each PC accessible via dedicated subdomain
- No direct IP exposure (test with port scanners)
- Services accessible through tunnels only

---

### 5. Set Up Wake-on-LAN for Workers

**Time Estimate**: 4-5 hours
**Prerequisites**: PCs with WoL-capable NICs, network admin access
**Dependencies**: Physical access to PCs, router configuration access

#### Steps:

- [ ] **Enable WoL in BIOS (per PC)**
  - Restart PC and enter BIOS (F2/DEL/F10)
  - Navigate to Power Management / APM
  - Enable "Wake on LAN" or "Wake on PCI-E"
  - Enable "Power On By PCI-E Device"
  - Disable "Deep Sleep" states if WoL issues
  - Save and exit
  - Time: 15 minutes per PC (1 hour total)

- [ ] **Configure network adapter settings (per PC)**
  - Windows: Device Manager → Network Adapter → Properties
  - Power Management tab:
    - ✓ Allow device to wake computer
    - ✓ Only allow magic packet to wake computer
  - Advanced tab:
    - Enable "Wake on Magic Packet"
    - Enable "Wake on Pattern Match"
  - Time: 10 minutes per PC (40 minutes total)

- [ ] **Document MAC addresses**
  - Get MAC for each PC: `ipconfig /all` (Windows) or `ip link` (Linux)
  - Format: `XX:XX:XX:XX:XX:XX`
  - Store in secure documentation:
    - Compute-01: [MAC_ADDRESS]
    - Worker-01: [MAC_ADDRESS]
    - Worker-02: [MAC_ADDRESS]
    - Worker-03: [MAC_ADDRESS]
  - Time: 15 minutes

- [ ] **Configure router for WoL packets**
  - Log in to router admin panel
  - Enable "Port Forwarding" for UDP port 9 (WoL)
  - Add static IP reservations for each PC (based on MAC)
  - Enable "Broadcast" on LAN interfaces
  - Configure "Directed Broadcast" if available
  - Time: 30 minutes

- [ ] **Install WoL tools on coordinator PC**
  - Windows: Install "WakeMeOnLan" or "WolCmd"
  - Linux: Install `wakeonlan` package
  - Create scripts for each worker:
    ```bash
    # wake-worker-01.sh
    wakeonlan XX:XX:XX:XX:XX:XX
    ```
  - Make scripts executable
  - Time: 30 minutes

- [ ] **Set up automated WoL scheduling**
  - Create scheduled task (Windows Task Scheduler / cron)
  - Schedule: Daily at 6:00 AM (before business hours)
  - Script sends WoL packets to all workers
  - Configure retry logic (3 attempts, 1 minute apart)
  - Time: 45 minutes

- [ ] **Test WoL functionality**
  - Shutdown Worker-01
  - Send magic packet from Compute-01
  - Verify Worker-01 boots (monitor via network pings)
  - Test from remote location (via VPN/tunnel)
  - Repeat for all workers
  - Time: 45 minutes

- [ ] **Create WoL API endpoint (optional)**
  - Simple Node.js/Python service on Compute-01
  - REST API: `POST /api/wake/:hostname`
  - Secure with API key authentication
  - Integrate with orchestration system
  - Time: 1 hour (optional)

**Validation**:
- All workers can be woken remotely
- WoL works from local network
- WoL works through VPN/Tailscale
- Scheduled wake tested successfully
- Boot time documented (typically 1-3 minutes)

---

### 6. Configure Tailscale Mesh Network

**Time Estimate**: 3-4 hours
**Prerequisites**: Tailscale account, admin access to all PCs
**Dependencies**: None (independent of other networking)

#### Steps:

- [ ] **Create Tailscale account**
  - Sign up at tailscale.com
  - Use SSO (Google/GitHub) for easier management
  - Enable 2FA on account
  - Select plan (Free for up to 100 devices)
  - Time: 15 minutes

- [ ] **Install Tailscale on each PC**
  - Download from https://tailscale.com/download
  - Windows: Run MSI installer
  - Linux: `curl -fsSL https://tailscale.com/install.sh | sh`
  - Time: 10 minutes per PC (40 minutes total)

- [ ] **Authenticate and connect each PC**
  - Run: `tailscale up`
  - Browser opens for authentication
  - Authorize device
  - Note assigned Tailscale IP (100.x.x.x)
  - Assign friendly names in Tailscale admin console
  - Time: 10 minutes per PC (40 minutes total)

- [ ] **Configure device naming**
  - Tailscale admin → Machines
  - Rename devices:
    - `compute-01.nyra.ts.net`
    - `worker-01.nyra.ts.net`
    - `worker-02.nyra.ts.net`
    - `worker-03.nyra.ts.net`
  - Time: 15 minutes

- [ ] **Enable MagicDNS**
  - Tailscale admin → DNS
  - Enable "MagicDNS"
  - Devices accessible via hostname (e.g., `compute-01`)
  - Time: 5 minutes

- [ ] **Configure ACLs (Access Control Lists)**
  - Tailscale admin → Access Controls
  - Define policy JSON:
    ```json
    {
      "acls": [
        {
          "action": "accept",
          "src": ["tag:coordinator"],
          "dst": ["tag:worker:*"]
        },
        {
          "action": "accept",
          "src": ["tag:worker"],
          "dst": ["tag:coordinator:*"]
        }
      ],
      "tagOwners": {
        "tag:coordinator": ["autogroup:admin"],
        "tag:worker": ["autogroup:admin"]
      }
    }
    ```
  - Test and apply
  - Time: 30 minutes

- [ ] **Tag devices appropriately**
  - Compute-01: Add tag `coordinator`
  - Worker-01/02/03: Add tag `worker`
  - Time: 10 minutes

- [ ] **Enable subnet routing (optional)**
  - If PCs need to access local resources
  - On coordinator: `tailscale up --advertise-routes=192.168.1.0/24`
  - Approve subnet routes in admin console
  - Time: 20 minutes (if needed)

- [ ] **Test connectivity**
  - From any PC: `ping compute-01`
  - From coordinator: `ping worker-01`
  - Test SSH: `ssh user@worker-01`
  - Verify MagicDNS resolution
  - Test failover (disconnect one device, verify re-routing)
  - Time: 30 minutes

- [ ] **Configure firewall integration**
  - Allow Tailscale interface (utun/tailscale0)
  - Block direct connections on public IPs
  - Only allow Tailscale IPs for inter-PC communication
  - Time: 30 minutes

- [ ] **Set up key expiry management**
  - Enable "Key expiry" (default 180 days)
  - Set up renewal reminders
  - Document re-authentication process
  - Time: 15 minutes

**Validation**:
- All PCs can ping each other via Tailscale IPs
- Hostnames resolve via MagicDNS
- ACLs enforced (test unauthorized access)
- Subnet routing works (if configured)
- Connection persists across reboots

---

### 7. Purchase SSL Certificates (if needed)

**Time Estimate**: 1-2 hours
**Cost**: $0 (Cloudflare provides free SSL) or $50-300/year for EV certs
**Prerequisites**: Domain ownership verification
**Note**: Typically not needed with Cloudflare, but included for completeness

#### Steps:

- [ ] **Determine certificate requirements**
  - Cloudflare provides free Universal SSL (covers *.ratehunter.net)
  - Consider EV (Extended Validation) if trust bar needed
  - Check compliance requirements (HIPAA may require specific certs)
  - Time: 30 minutes

- [ ] **If purchasing commercial certificate:**
  - Select CA (DigiCert, Sectigo, Let's Encrypt)
  - Choose certificate type (DV/OV/EV)
  - Generate CSR: `openssl req -new -newkey rsa:4096 -nodes -keyout domain.key -out domain.csr`
  - Submit CSR to CA
  - Complete domain validation
  - Download certificate bundle
  - Time: 1-2 hours + validation wait time

- [ ] **Install certificate (if applicable)**
  - Upload to Cloudflare (Pages → SSL/TLS → Origin Server)
  - Configure origin certificate for backend servers
  - Set certificate pinning if required
  - Time: 30 minutes

**Validation**:
- SSL Labs test shows A+ rating
- Certificate chain complete
- No mixed content warnings
- HSTS enabled

---

## Summary - Infrastructure Setup

**Total Time**: 2-3 weeks
**Critical Path Items**:
1. Domain purchase and DNS configuration (Week 1)
2. Cloudflare setup and Pages deployment (Week 1)
3. Tunnel configuration and testing (Week 2)
4. Network mesh and WoL setup (Week 2-3)

**Key Deliverables**:
- ✓ Domain registered and DNS active
- ✓ Cloudflare configured with security features
- ✓ All PCs accessible via secure tunnels
- ✓ Mesh network operational
- ✓ Remote wake capabilities tested

**Next Section**: [Hardware Configuration](#hardware-configuration)

---

## Hardware Configuration (Manual)

**Total Estimated Time**: 1-2 weeks
**Dependencies**: Hardware procurement, physical access
**Team**: IT Technicians, System Administrators

### 1. Install GPUs in Worker PCs

**Time Estimate**: 8-12 hours (2-3 hours per PC)
**Cost**: $1500-5000 per GPU (if purchasing)
**Prerequisites**: Compatible PSU (850W-1200W), PCIe slots, proper ventilation
**Safety**: ESD protection, proper grounding, power disconnected

#### Steps (Per PC):

##### PC #1: Compute-01 (RTX 5090 Installation)
- [ ] **Pre-installation preparation**
  - Verify GPU compatibility with motherboard
  - Check PSU wattage (RTX 5090 requires 450W+, recommend 1000W total)
  - Review motherboard manual for PCIe slot configuration
  - Gather tools: screwdriver, thermal paste, cable ties, ESD wrist strap
  - Time: 30 minutes

- [ ] **Power down and prepare system**
  - Shut down PC completely
  - Disconnect power cable
  - Press power button to discharge capacitors
  - Open case (remove side panels)
  - Ground yourself with ESD wrist strap
  - Time: 15 minutes

- [ ] **Remove old GPU (if applicable)**
  - Disconnect power cables from existing GPU
  - Unscrew mounting bracket
  - Release PCIe retention clip
  - Carefully remove card
  - Time: 15 minutes

- [ ] **Install RTX 5090**
  - Identify PCIe x16 slot (top slot recommended)
  - Remove slot covers from case
  - Align GPU with PCIe slot
  - Gently insert until click heard
  - Secure with screws to case bracket
  - Connect PCIe power cables (typically 3x 8-pin or 12VHPWR)
  - Ensure cables not touching fans
  - Time: 30 minutes

- [ ] **Cable management and airflow**
  - Route cables to avoid GPU fans
  - Use cable ties for organization
  - Verify intake/exhaust fans operational
  - Check GPU sag (use bracket if needed)
  - Time: 20 minutes

- [ ] **Close case and power on**
  - Replace side panels
  - Reconnect power cable
  - Connect display to GPU output (not motherboard)
  - Power on system
  - Time: 10 minutes

- [ ] **Verify POST and boot**
  - Watch for POST beeps/errors
  - Enter BIOS and verify GPU detected
  - Check PCIe link speed (should be Gen4 x16)
  - Boot into OS
  - Time: 15 minutes

##### PC #2: Worker-01 (RTX 3090 Installation)
- [ ] Repeat above steps for RTX 3090
- [ ] Note: RTX 3090 requires 350W+, recommend 850W PSU
- [ ] Power connectors: 2x 8-pin PCIe
- [ ] Time: 2-3 hours

##### PC #3: Worker-02 (RTX 3060 Installation)
- [ ] Repeat above steps for RTX 3060
- [ ] Note: RTX 3060 requires 170W+, recommend 550W PSU
- [ ] Power connectors: 1x 8-pin PCIe
- [ ] Time: 2-3 hours

**Validation**:
- All GPUs detected in Device Manager / `lspci`
- No hardware errors in system logs
- GPU temperatures at idle < 50°C
- Fans operational

---

### 2. Configure BIOS Settings for Each PC

**Time Estimate**: 2-3 hours (30-45 minutes per PC)
**Prerequisites**: Physical access, BIOS passwords (if set)
**Documentation**: Record all BIOS versions and settings

#### Steps (Per PC):

- [ ] **Access BIOS/UEFI**
  - Restart PC
  - Press BIOS key (DEL/F2/F10 during boot)
  - Navigate using keyboard
  - Time: 5 minutes

- [ ] **Update BIOS if needed**
  - Check current version in System Information
  - Download latest BIOS from manufacturer
  - Follow manufacturer's flash procedure (USB/Q-Flash/EZ Flash)
  - CRITICAL: Do not interrupt during flash
  - Reboot after update
  - Time: 30 minutes (if needed)

- [ ] **Configure PCIe settings**
  - Set PCIe link speed to Gen4 (or highest available)
  - Enable "Above 4G Decoding" (for GPUs with >4GB VRAM)
  - Enable "Re-Size BAR Support" (improves GPU performance)
  - Set primary display to PCIe graphics
  - Time: 10 minutes

- [ ] **Configure power management**
  - Disable "Power On By RTC" (unless needed for scheduled tasks)
  - Enable "Restore AC Power Loss" to "Power On" (auto-restart after outage)
  - Set "PCIe Power Management" to disabled (prevents GPU sleep issues)
  - Enable "Wake on LAN" (for WoL functionality)
  - Time: 10 minutes

- [ ] **Configure boot settings**
  - Set boot order: SSD → Network Boot
  - Enable "Fast Boot" (optional, faster startup)
  - Disable "Secure Boot" if Linux-based
  - Enable "UEFI Boot Mode" (not Legacy)
  - Time: 5 minutes

- [ ] **Configure virtualization (if needed)**
  - Enable "Intel VT-x" or "AMD-V"
  - Enable "Intel VT-d" or "AMD IOMMU" (for GPU passthrough)
  - Time: 5 minutes

- [ ] **Set system security**
  - Set BIOS/Admin password
  - Disable unused ports (serial, parallel)
  - Enable TPM 2.0 (if available)
  - Document passwords in secure location
  - Time: 10 minutes

- [ ] **Save and exit**
  - Save settings (F10 or Save & Exit)
  - Confirm changes
  - Boot into OS
  - Time: 5 minutes

**Validation**:
- PCIe devices running at expected speeds (`GPU-Z` or `lspci -vv`)
- Re-Size BAR enabled (check in `nvidia-smi` or GPU-Z)
- No POST errors
- Wake-on-LAN functional

---

### 3. Set Up Network Connections and Static IPs

**Time Estimate**: 2-3 hours
**Prerequisites**: Network access, router admin credentials
**Dependencies**: Physical network cables (Cat6/Cat6a recommended)

#### Steps:

- [ ] **Physical network connections**
  - Connect each PC to network switch/router via Ethernet
  - Use quality cables (Cat6 minimum, Cat6a/Cat7 preferred)
  - Verify link lights on NIC and switch (green/amber)
  - Test physical connectivity: `ping 192.168.1.1`
  - Time: 30 minutes

- [ ] **Document MAC addresses**
  - Get MAC for each PC: `ipconfig /all` (Windows) or `ip addr` (Linux)
  - Record in network documentation:
    - Compute-01: [MAC] → 192.168.1.10
    - Worker-01: [MAC] → 192.168.1.11
    - Worker-02: [MAC] → 192.168.1.12
    - Worker-03: [MAC] → 192.168.1.13
  - Time: 15 minutes

- [ ] **Configure router DHCP reservations**
  - Log in to router admin panel
  - Navigate to DHCP settings
  - Add static lease/reservation for each MAC
  - Set IP addresses in 192.168.1.10-20 range
  - Save and apply changes
  - Time: 30 minutes

- [ ] **Configure static IPs on PCs (alternative to DHCP reservation)**
  - Windows: Control Panel → Network → Adapter Properties → IPv4
  - Linux: Edit `/etc/netplan/*.yaml` or `/etc/network/interfaces`
  - Set:
    - IP Address: 192.168.1.10 (adjust per PC)
    - Subnet Mask: 255.255.255.0
    - Gateway: 192.168.1.1
    - DNS: 1.1.1.1, 8.8.8.8
  - Apply and restart network service
  - Time: 15 minutes per PC (1 hour total)

- [ ] **Verify network connectivity**
  - Ping gateway: `ping 192.168.1.1`
  - Ping external: `ping 1.1.1.1`
  - Ping DNS: `ping google.com`
  - Test speed: `speedtest-cli` or fast.com
  - Verify no IP conflicts: `arp -a`
  - Time: 20 minutes

- [ ] **Configure firewall rules**
  - Allow inter-PC communication (192.168.1.0/24)
  - Allow Tailscale interface
  - Allow cloudflared tunnels (outbound 443)
  - Block unnecessary inbound ports
  - Document rules
  - Time: 30 minutes

- [ ] **Set up network monitoring (optional)**
  - Install monitoring tools (PRTG, Nagios, or simple ping monitoring)
  - Set up alerts for network failures
  - Time: 30 minutes (if implemented)

**Validation**:
- All PCs have consistent IPs after reboot
- Inter-PC ping successful (<1ms latency on LAN)
- Internet connectivity stable
- DNS resolution working
- No IP conflicts

---

### 4. Test GPU Drivers and CUDA Installation

**Time Estimate**: 4-6 hours
**Prerequisites**: GPUs installed, internet connectivity
**Dependencies**: Specific framework requirements (TensorFlow, PyTorch)

#### Steps (Per PC):

##### Windows Installation
- [ ] **Uninstall old drivers (if upgrading)**
  - Use DDU (Display Driver Uninstaller) in Safe Mode
  - Reboot into Safe Mode (Windows Recovery → Troubleshoot)
  - Run DDU, select NVIDIA, "Clean and Restart"
  - Time: 30 minutes

- [ ] **Download NVIDIA drivers**
  - Visit nvidia.com/drivers
  - Select product: GeForce RTX 5090/3090/3060
  - Select OS: Windows 11/10 64-bit
  - Download latest Game Ready or Studio driver
  - Time: 15 minutes

- [ ] **Install NVIDIA drivers**
  - Run installer as Administrator
  - Select "Custom Installation"
  - Check "Perform clean installation"
  - Install PhysX and GeForce Experience (optional)
  - Reboot after installation
  - Time: 30 minutes

- [ ] **Download CUDA Toolkit**
  - Visit developer.nvidia.com/cuda-downloads
  - Select OS: Windows
  - Version: CUDA 12.x (latest stable)
  - Download Network or Local installer (2-3 GB)
  - Time: 20 minutes

- [ ] **Install CUDA Toolkit**
  - Run installer as Administrator
  - Accept EULA
  - Select "Custom" installation
  - Install all components: CUDA Runtime, Development, Samples
  - Note installation path: `C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.x`
  - Time: 30 minutes

- [ ] **Install cuDNN (for deep learning)**
  - Create NVIDIA Developer account
  - Download cuDNN for CUDA 12.x (requires login)
  - Extract ZIP file
  - Copy files to CUDA installation directory:
    - `bin\*.dll` → `C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.x\bin`
    - `include\*.h` → `C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.x\include`
    - `lib\*.lib` → `C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.x\lib\x64`
  - Time: 20 minutes

##### Linux Installation (Ubuntu/Debian)
- [ ] **Add NVIDIA repository**
  ```bash
  sudo apt update
  sudo apt install -y software-properties-common
  sudo add-apt-repository ppa:graphics-drivers/ppa
  sudo apt update
  ```
  - Time: 10 minutes

- [ ] **Install NVIDIA drivers**
  ```bash
  sudo apt install -y nvidia-driver-545  # or latest version
  sudo reboot
  ```
  - Time: 20 minutes

- [ ] **Install CUDA Toolkit**
  ```bash
  wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.1-1_all.deb
  sudo dpkg -i cuda-keyring_1.1-1_all.deb
  sudo apt update
  sudo apt install -y cuda
  ```
  - Add to `~/.bashrc`:
    ```bash
    export PATH=/usr/local/cuda/bin:$PATH
    export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH
    ```
  - Time: 30 minutes

- [ ] **Install cuDNN**
  ```bash
  sudo apt install -y libcudnn8 libcudnn8-dev
  ```
  - Time: 10 minutes

##### Verification (All Platforms)
- [ ] **Verify driver installation**
  - Run: `nvidia-smi`
  - Expected output: Driver version, CUDA version, GPU list
  - Check GPU utilization: 0% at idle
  - Time: 5 minutes

- [ ] **Verify CUDA installation**
  - Run: `nvcc --version`
  - Expected output: CUDA compilation tools release version
  - Time: 5 minutes

- [ ] **Run CUDA samples**
  - Navigate to CUDA samples directory
  - Compile and run `deviceQuery`:
    ```bash
    cd /usr/local/cuda/samples/1_Utilities/deviceQuery
    make
    ./deviceQuery
    ```
  - Expected: "Result = PASS"
  - Time: 15 minutes

- [ ] **Run benchmark**
  - Compile and run `bandwidthTest`:
    ```bash
    cd /usr/local/cuda/samples/1_Utilities/bandwidthTest
    make
    ./bandwidthTest
    ```
  - Record memory bandwidth (should be close to spec)
  - Time: 15 minutes

- [ ] **Test with real workload**
  - Install PyTorch/TensorFlow:
    ```bash
    pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
    ```
  - Run simple GPU test:
    ```python
    import torch
    print(f"CUDA Available: {torch.cuda.is_available()}")
    print(f"CUDA Device: {torch.cuda.get_device_name(0)}")
    print(f"CUDA Version: {torch.version.cuda}")
    ```
  - Time: 30 minutes

**Validation**:
- `nvidia-smi` shows all GPUs
- CUDA samples pass
- Framework GPU test successful
- No driver errors in system logs

---

### 5. Configure Power Management and Cooling

**Time Estimate**: 3-4 hours
**Prerequisites**: Hardware monitoring tools, fan control software
**Dependencies**: GPU drivers installed

#### Steps (Per PC):

- [ ] **Install monitoring tools**
  - Windows: MSI Afterburner, HWiNFO64, GPU-Z
  - Linux: `nvidia-smi`, `lm-sensors`, `nvtop`
  - Install and configure
  - Time: 30 minutes

- [ ] **Baseline temperature monitoring**
  - Record idle temperatures (5 minutes after boot):
    - GPU: [°C]
    - CPU: [°C]
    - System: [°C]
  - Run stress test (FurMark, CUDA burn-in)
  - Record load temperatures (after 15 minutes):
    - GPU: [°C]
    - CPU: [°C]
    - System: [°C]
  - Time: 30 minutes

- [ ] **Optimize fan curves**
  - Use MSI Afterburner or similar
  - Create custom fan curve:
    - <50°C: 30% fan speed (quiet)
    - 50-70°C: Linear ramp to 60%
    - 70-80°C: Linear ramp to 85%
    - >80°C: 100% fan speed
  - Apply and test
  - Time: 30 minutes

- [ ] **Configure power limits**
  - Use MSI Afterburner or `nvidia-smi`
  - Set power limit based on stability:
    - RTX 5090: 450W (default) or reduce to 400W for efficiency
    - RTX 3090: 350W (default)
    - RTX 3060: 170W (default)
  - Command: `nvidia-smi -pl 400` (sets 400W limit)
  - Time: 20 minutes

- [ ] **Optimize case airflow**
  - Verify fan orientation (front=intake, rear/top=exhaust)
  - Add fans if needed (2 intake front, 1 exhaust rear minimum)
  - Clear dust filters
  - Remove cable obstructions
  - Time: 45 minutes

- [ ] **Set up automated monitoring**
  - Configure alerts for high temps (>85°C GPU, >80°C CPU)
  - Set up logging (HWiNFO logs every minute)
  - Create dashboard for real-time monitoring
  - Time: 45 minutes

- [ ] **Implement power management policies**
  - Windows: Power Options → High Performance
  - Disable USB Selective Suspend
  - Set "Link State Power Management" to Off
  - Set PCIe Power Management to Maximum Performance
  - Time: 20 minutes

- [ ] **Test thermal throttling protection**
  - Run extended stress test (1 hour)
  - Monitor for thermal throttling (GPU clock drops)
  - Verify temperatures stay under 83°C (NVIDIA throttle point)
  - Adjust fan curves if throttling occurs
  - Time: 75 minutes

**Validation**:
- Idle temps: GPU <50°C, CPU <45°C
- Load temps: GPU <80°C, CPU <75°C
- No thermal throttling under sustained load
- Fan curves responsive
- Monitoring alerts functional

---

## Summary - Hardware Configuration

**Total Time**: 1-2 weeks
**Critical Path Items**:
1. GPU installation and driver setup (Week 1)
2. BIOS configuration and network setup (Week 1)
3. Thermal testing and optimization (Week 2)

**Key Deliverables**:
- ✓ All GPUs installed and operational
- ✓ BIOS optimized for stability and performance
- ✓ Network configured with static IPs
- ✓ CUDA and drivers fully functional
- ✓ Thermal management optimized

**Next Section**: [External Service Setup](#external-service-setup)

---

## External Service Setup (Manual)

**Total Estimated Time**: 1-2 weeks
**Dependencies**: Credit card, email access, approval workflows
**Team**: DevOps, Security Team, Compliance Officer

### 1. Create Infisical Account and Projects

**Time Estimate**: 3-4 hours
**Cost**: $0 (OSS self-hosted) or $18/user/month (Cloud Pro)
**Prerequisites**: Email, organizational approval for secrets management
**Purpose**: Centralized secrets management for all services

#### Steps:

- [ ] **Choose deployment method**
  - Option A: Self-hosted (recommended for compliance)
  - Option B: Infisical Cloud (easier setup)
  - Decision: [Document choice and rationale]
  - Time: 15 minutes

##### Option A: Self-Hosted Installation
- [ ] **Set up Infisical server**
  - Deploy via Docker Compose on Compute-01:
    ```bash
    git clone https://github.com/Infisical/infisical.git
    cd infisical
    cp .env.example .env
    # Edit .env with database credentials, JWT secrets
    docker-compose up -d
    ```
  - Access at `https://compute-01.ratehunter.net:8080`
  - Time: 45 minutes

##### Option B: Cloud Setup
- [ ] **Sign up for Infisical Cloud**
  - Visit app.infisical.com
  - Create account with organizational email
  - Verify email address
  - Enable 2FA (TOTP recommended)
  - Time: 15 minutes

##### Common Steps (Both Options)
- [ ] **Create organization**
  - Organization name: "RateHunter"
  - Invite team members
  - Set up SSO if available (Google Workspace/Azure AD)
  - Time: 20 minutes

- [ ] **Create projects for each environment**
  - Project 1: "RateHunter-Production"
  - Project 2: "RateHunter-Staging"
  - Project 3: "RateHunter-Development"
  - Time: 15 minutes

- [ ] **Configure project access control**
  - Define roles:
    - Admin: Full access (DevOps only)
    - Developer: Read/write development, read staging/production
    - CI/CD: Read-only programmatic access
  - Assign team members to roles
  - Time: 30 minutes

- [ ] **Set up secret rotation policies**
  - Configure rotation reminders (90 days for API keys)
  - Set up webhook notifications for secret access
  - Enable audit logging
  - Time: 30 minutes

- [ ] **Populate initial secrets (Production project)**
  - Add secrets via UI or CLI:
    ```bash
    infisical secrets set ANTHROPIC_API_KEY sk-ant-xxx
    infisical secrets set OPENAI_API_KEY sk-xxx
    infisical secrets set DATABASE_URL postgresql://...
    infisical secrets set REDIS_URL redis://...
    infisical secrets set JWT_SECRET [generate-secure]
    ```
  - Tag secrets by service: "api", "frontend", "worker"
  - Time: 45 minutes

- [ ] **Install Infisical CLI on each PC**
  - Download from https://infisical.com/docs/cli/overview
  - Authenticate: `infisical login`
  - Test: `infisical secrets`
  - Time: 30 minutes

- [ ] **Configure automatic injection**
  - Update application startup scripts:
    ```bash
    infisical run --env=production -- npm start
    ```
  - Verify secrets injected as environment variables
  - Time: 30 minutes

**Validation**:
- All team members can access appropriate projects
- Secrets retrievable via CLI
- Audit log shows all secret access
- No secrets stored in codebase or .env files

---

### 2. Set Up GitHub Organization/Repos

**Time Estimate**: 4-5 hours
**Cost**: $0 (public repos) or $4/user/month (private repos with Teams)
**Prerequisites**: GitHub account, organizational approval
**Purpose**: Source control, CI/CD, issue tracking

#### Steps:

- [ ] **Create GitHub organization (if not exists)**
  - Visit github.com/organizations/new
  - Organization name: "ratehunter" or company name
  - Billing email: [company email]
  - Select plan: Free or Team ($4/user/month)
  - Time: 15 minutes

- [ ] **Configure organization settings**
  - Enable two-factor authentication requirement for all members
  - Set base permissions: "No permission" (explicit access only)
  - Enable dependency graph and Dependabot alerts
  - Enable secret scanning
  - Time: 30 minutes

- [ ] **Create repositories**
  - Repository 1: "ratehunter-landing" (public or private)
  - Repository 2: "ratehunter-api" (private)
  - Repository 3: "ratehunter-infrastructure" (private)
  - Repository 4: "ratehunter-docs" (public)
  - Time: 30 minutes

- [ ] **Configure repository settings (per repo)**
  - Branch protection rules:
    - Require pull request reviews (minimum 1 approval)
    - Require status checks before merging
    - Require branches to be up to date
    - Include administrators in restrictions
  - Enable "Automatically delete head branches"
  - Enable "Limit merge strategies" (squash merge only)
  - Time: 20 minutes per repo (80 minutes total)

- [ ] **Set up GitHub Teams**
  - Team 1: "Administrators" (full access)
  - Team 2: "Developers" (write access to dev branches)
  - Team 3: "CI/CD" (read access + GitHub Actions)
  - Assign members to teams
  - Time: 30 minutes

- [ ] **Configure GitHub Actions**
  - Enable Actions for organization
  - Set Actions permissions: "Allow select actions"
  - Approved actions: `actions/*`, `docker/*`, `cloudflare/*`
  - Set token permissions: "Read repository contents"
  - Time: 20 minutes

- [ ] **Add repository secrets**
  - Settings → Secrets and variables → Actions
  - Add secrets:
    - `CLOUDFLARE_API_TOKEN` (for Pages deployment)
    - `ANTHROPIC_API_KEY` (for testing)
    - `INFISICAL_TOKEN` (for pulling other secrets)
  - Create environment-specific secrets (production, staging)
  - Time: 30 minutes

- [ ] **Set up GitHub Projects (for issue tracking)**
  - Create project: "RateHunter Roadmap"
  - Configure views: Board, Table, Roadmap
  - Add workflows: Auto-add issues, Auto-move to "In Progress"
  - Time: 30 minutes

- [ ] **Configure issue and PR templates**
  - Create `.github/ISSUE_TEMPLATE/bug_report.md`
  - Create `.github/ISSUE_TEMPLATE/feature_request.md`
  - Create `.github/pull_request_template.md`
  - Include checklists for testing, documentation
  - Time: 45 minutes

- [ ] **Set up branch strategy**
  - Main branch: `main` (production-ready)
  - Development branch: `develop` (integration)
  - Feature branches: `feature/*`
  - Hotfix branches: `hotfix/*`
  - Document in CONTRIBUTING.md
  - Time: 30 minutes

**Validation**:
- All repositories created and accessible
- Branch protection working (test by attempting direct push to main)
- GitHub Actions workflows running
- Team permissions enforced
- No secrets in commit history

---

### 3. Configure External API Keys

**Time Estimate**: 3-4 hours
**Cost**: Varies by service ($100-500/month estimated)
**Prerequisites**: Service accounts, payment methods
**Purpose**: Access to AI models, infrastructure services

#### Steps:

##### OpenRouter (Multi-Model API)
- [ ] **Create OpenRouter account**
  - Visit openrouter.ai
  - Sign up with email
  - Verify email
  - Enable 2FA
  - Time: 15 minutes

- [ ] **Add payment method**
  - Navigate to Billing
  - Add credit card
  - Set spending limit: $500/month (recommended to start)
  - Enable low-balance alerts ($50 threshold)
  - Time: 10 minutes

- [ ] **Generate API key**
  - Navigate to Keys
  - Create key: "RateHunter Production"
  - Copy key immediately (shown once)
  - Store in Infisical: `OPENROUTER_API_KEY`
  - Time: 10 minutes

- [ ] **Configure rate limits**
  - Set per-model rate limits (if supported)
  - Configure retry logic in application
  - Document: 10 req/sec for Claude, 30 req/sec for GPT
  - Time: 20 minutes

##### Anthropic Claude API (Direct)
- [ ] **Create Anthropic account**
  - Visit console.anthropic.com
  - Sign up with organizational email
  - Verify email
  - Complete developer survey (optional)
  - Time: 15 minutes

- [ ] **Request API access**
  - Fill out API access form
  - Wait for approval (1-3 business days typically)
  - Check email for approval notification
  - Time: Variable (mostly waiting)

- [ ] **Add payment method and credits**
  - Navigate to Billing
  - Add payment method
  - Purchase credits: $1000 minimum (recommended)
  - Set up auto-reload: $500 at $100 threshold
  - Time: 15 minutes

- [ ] **Generate API keys**
  - Navigate to API Keys
  - Create key: "RateHunter Production"
  - Set restrictions: IP whitelist (Cloudflare IPs)
  - Copy and store in Infisical: `ANTHROPIC_API_KEY`
  - Time: 15 minutes

- [ ] **Test API access**
  - Use curl or SDK to make test request:
    ```bash
    curl https://api.anthropic.com/v1/messages \
      -H "x-api-key: $ANTHROPIC_API_KEY" \
      -H "anthropic-version: 2023-06-01" \
      -H "content-type: application/json" \
      -d '{"model":"claude-3-5-sonnet-20240620","max_tokens":1024,"messages":[{"role":"user","content":"Hello"}]}'
    ```
  - Verify 200 response
  - Time: 15 minutes

##### OpenAI API (for GPT models)
- [ ] **Create OpenAI account**
  - Visit platform.openai.com
  - Sign up with email
  - Verify email and phone
  - Complete organization profile
  - Time: 20 minutes

- [ ] **Add payment method**
  - Navigate to Billing → Payment methods
  - Add credit card
  - Set spending limit: $200/month
  - Enable usage notifications
  - Time: 15 minutes

- [ ] **Generate API key**
  - Navigate to API Keys
  - Create key: "RateHunter Production"
  - Copy and store in Infisical: `OPENAI_API_KEY`
  - Time: 10 minutes

- [ ] **Configure usage limits**
  - Set hard cap: $200/month
  - Set soft cap: $150/month (email alert)
  - Configure per-model rate limits
  - Time: 15 minutes

##### Upstash Redis (for rate limiting/caching)
- [ ] **Create Upstash account**
  - Visit upstash.com
  - Sign up with email or GitHub
  - Verify email
  - Time: 10 minutes

- [ ] **Create Redis database**
  - Click "Create Database"
  - Name: "ratehunter-production"
  - Region: US-East-1 (closest to Cloudflare)
  - Type: Regional (not global for lower latency)
  - Enable TLS
  - Time: 10 minutes

- [ ] **Get connection credentials**
  - Copy Redis URL: `redis://default:xxx@us1-xxx.upstash.io:6379`
  - Store in Infisical: `REDIS_URL`
  - Note: Free tier includes 10K commands/day
  - Time: 5 minutes

##### Sentry (Error Tracking)
- [ ] **Create Sentry account**
  - Visit sentry.io
  - Sign up with email
  - Choose plan: Developer (free) or Team ($26/month)
  - Time: 15 minutes

- [ ] **Create project**
  - Select platform: Node.js / React
  - Project name: "ratehunter-api" / "ratehunter-frontend"
  - Copy DSN: `https://xxx@xxx.ingest.sentry.io/xxx`
  - Store in Infisical: `SENTRY_DSN`
  - Time: 15 minutes per project

- [ ] **Configure alerts**
  - Set up Slack/email notifications for errors
  - Configure alert rules: >10 errors/hour
  - Set up performance monitoring (optional)
  - Time: 30 minutes

**Validation**:
- All API keys stored in Infisical
- Test requests successful for each service
- Billing alerts configured
- Usage dashboards accessible
- No keys exposed in logs or code

---

### 4. Set Up Email Service

**Time Estimate**: 2-3 hours
**Cost**: $15-100/month depending on volume
**Prerequisites**: Domain configured, credit card
**Purpose**: Transactional emails (password resets, notifications)

#### Choose Email Provider:

**Option A: SendGrid (Recommended)**
- High deliverability
- 100 emails/day free tier
- Cost: $15/month for 40K emails
- Good API and documentation

**Option B: Mailgun**
- Developer-friendly
- 5,000 emails/month free
- Cost: $35/month for 50K emails
- Flexible pricing

**Option C: AWS SES**
- Most cost-effective ($0.10/1000 emails)
- Requires AWS account setup
- Steeper learning curve

#### Steps (Using SendGrid):

- [ ] **Create SendGrid account**
  - Visit sendgrid.com
  - Sign up with organizational email
  - Verify email address
  - Complete sender verification
  - Time: 20 minutes

- [ ] **Verify domain**
  - Navigate to Settings → Sender Authentication
  - Click "Authenticate Your Domain"
  - Enter domain: ratehunter.net
  - Add DNS records provided by SendGrid:
    - CNAME: `em1234.ratehunter.net` → `u1234.wl.sendgrid.net`
    - CNAME: `s1._domainkey.ratehunter.net` → `s1.domainkey.u1234.wl.sendgrid.net`
    - CNAME: `s2._domainkey.ratehunter.net` → `s2.domainkey.u1234.wl.sendgrid.net`
  - Wait for verification (5-30 minutes)
  - Time: 45 minutes

- [ ] **Create API key**
  - Navigate to Settings → API Keys
  - Create key: "RateHunter Production"
  - Permissions: Full Access (or restricted to Mail Send)
  - Copy key and store in Infisical: `SENDGRID_API_KEY`
  - Time: 10 minutes

- [ ] **Configure sender identity**
  - From email: `noreply@ratehunter.net`
  - From name: "RateHunter"
  - Reply-to: `support@ratehunter.net`
  - Time: 10 minutes

- [ ] **Set up email templates**
  - Navigate to Email API → Dynamic Templates
  - Create templates:
    - Welcome email
    - Password reset
    - Rate alert notification
    - Weekly digest
  - Use SendGrid's template editor
  - Test templates with sample data
  - Time: 90 minutes

- [ ] **Configure webhooks (optional)**
  - Navigate to Settings → Mail Settings → Event Webhook
  - Webhook URL: `https://api.projectnyra.com/webhooks/sendgrid`
  - Select events: delivered, opened, clicked, bounced, spam_report
  - Implement webhook handler in API
  - Time: 45 minutes

- [ ] **Test email sending**
  - Use SendGrid API or SMTP:
    ```bash
    curl -X POST https://api.sendgrid.com/v3/mail/send \
      -H "Authorization: Bearer $SENDGRID_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "personalizations": [{"to": [{"email": "test@example.com"}]}],
        "from": {"email": "noreply@ratehunter.net"},
        "subject": "Test Email",
        "content": [{"type": "text/plain", "value": "Test message"}]
      }'
    ```
  - Verify receipt
  - Check spam score (use mail-tester.com)
  - Time: 30 minutes

**Validation**:
- Domain verified in SendGrid
- Test emails delivered successfully
- Templates rendering correctly
- Emails not landing in spam
- Webhooks receiving events (if configured)

---

### 5. Configure SMS Provider (Twilio)

**Time Estimate**: 2-3 hours
**Cost**: $1.00/month per phone number + $0.0075/SMS (US)
**Prerequisites**: Credit card, phone verification
**Purpose**: SMS notifications for rate alerts, 2FA

#### Steps:

- [ ] **Create Twilio account**
  - Visit twilio.com
  - Sign up with email
  - Verify email and phone number
  - Complete business verification if needed
  - Time: 20 minutes

- [ ] **Add payment method**
  - Navigate to Billing
  - Add credit card
  - Add initial credit: $20 (recommended)
  - Set up auto-recharge: $20 at $5 threshold
  - Time: 10 minutes

- [ ] **Purchase phone number**
  - Navigate to Phone Numbers → Buy a Number
  - Search for US number with SMS capability
  - Select number with your area code (for trust)
  - Purchase for $1.00/month
  - Time: 15 minutes

- [ ] **Get API credentials**
  - Navigate to Console Dashboard
  - Copy Account SID: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
  - Copy Auth Token: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
  - Store in Infisical:
    - `TWILIO_ACCOUNT_SID`
    - `TWILIO_AUTH_TOKEN`
    - `TWILIO_PHONE_NUMBER`
  - Time: 10 minutes

- [ ] **Configure messaging service (optional, recommended)**
  - Navigate to Messaging → Services
  - Create service: "RateHunter Notifications"
  - Add phone number to service
  - Configure:
    - Enable opt-out management
    - Enable advanced opt-in/out
    - Set up fallback URLs
  - Time: 30 minutes

- [ ] **Set up message templates**
  - For rate alerts: "RateHunter: New 3.5% rate found for 30-year fixed. View: [link]"
  - For 2FA: "Your RateHunter verification code is: [code]. Valid for 10 minutes."
  - Keep under 160 characters (1 SMS segment)
  - Time: 20 minutes

- [ ] **Configure webhooks**
  - Navigate to Phone Numbers → Manage → Active Numbers
  - Select your number
  - Configure webhooks:
    - Messaging webhook: `https://api.projectnyra.com/webhooks/twilio`
    - Status callback: `https://api.projectnyra.com/webhooks/twilio/status`
  - Implement webhook handlers in API
  - Time: 45 minutes

- [ ] **Test SMS sending**
  - Use Twilio API:
    ```bash
    curl -X POST "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Messages.json" \
      -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN" \
      -d "From=$TWILIO_PHONE_NUMBER" \
      -d "To=+1234567890" \
      -d "Body=Test message from RateHunter"
    ```
  - Verify receipt on test phone
  - Time: 15 minutes

- [ ] **Configure rate limits**
  - Navigate to Messaging → Settings → Geo Permissions
  - Enable only countries you'll operate in (US initially)
  - Set up budget alerts ($50/month)
  - Configure spike protection
  - Time: 20 minutes

- [ ] **Set up opt-out handling**
  - Implement STOP/START/HELP keyword responses
  - STOP: "You've been unsubscribed from RateHunter alerts. Reply START to resubscribe."
  - START: "You're subscribed to RateHunter rate alerts. Reply HELP for help or STOP to unsubscribe."
  - HELP: "RateHunter rate alerts. Msg&data rates may apply. Reply STOP to unsubscribe."
  - Test opt-out flow
  - Time: 30 minutes

**Validation**:
- Test SMS received successfully
- Opt-out keywords working
- Webhooks receiving delivery status
- No carrier filtering (check spam)
- Billing alerts configured

---

### 6. Set Up Monitoring Accounts (Grafana Cloud)

**Time Estimate**: 3-4 hours
**Cost**: Free tier (14-day metrics retention, 50GB logs) or $8/month
**Prerequisites**: Email, organizational approval
**Purpose**: Infrastructure monitoring, alerting, observability

#### Steps:

- [ ] **Create Grafana Cloud account**
  - Visit grafana.com
  - Sign up with email or GitHub
  - Verify email
  - Select plan: Free tier (sufficient for initial launch)
  - Time: 15 minutes

- [ ] **Create stack**
  - Stack name: "ratehunter-production"
  - Region: US-East (closest to infrastructure)
  - Stack URL: `https://ratehunter.grafana.net`
  - Time: 10 minutes

- [ ] **Set up Prometheus data source**
  - Navigate to Connections → Data sources
  - Add Prometheus
  - Get remote write endpoint from Grafana Cloud
  - Copy username and API key
  - Store in Infisical: `GRAFANA_PROMETHEUS_USER`, `GRAFANA_PROMETHEUS_KEY`
  - Time: 20 minutes

- [ ] **Set up Loki for logs**
  - Navigate to Connections → Data sources
  - Add Loki
  - Get Loki endpoint: `https://logs-prod-us-central1.grafana.net`
  - Copy credentials
  - Store in Infisical: `GRAFANA_LOKI_USER`, `GRAFANA_LOKI_KEY`
  - Time: 20 minutes

- [ ] **Install Grafana Agent on each PC**
  - Download agent from grafana.com/docs/agent
  - Configure agent.yaml:
    ```yaml
    server:
      log_level: info

    prometheus:
      configs:
        - name: default
          remote_write:
            - url: https://prometheus-prod-xx.grafana.net/api/prom/push
              basic_auth:
                username: xxx
                password: xxx
          scrape_configs:
            - job_name: 'node'
              static_configs:
                - targets: ['localhost:9100']

    loki:
      configs:
        - name: default
          clients:
            - url: https://logs-prod-xx.grafana.net/loki/api/v1/push
              basic_auth:
                username: xxx
                password: xxx
    ```
  - Start agent as service
  - Time: 30 minutes per PC (2 hours total)

- [ ] **Install node_exporter (system metrics)**
  - Download from prometheus.io/download#node_exporter
  - Run as service on each PC
  - Exposes metrics on port 9100
  - Verify: `curl localhost:9100/metrics`
  - Time: 20 minutes per PC (80 minutes total)

- [ ] **Import dashboard templates**
  - Navigate to Dashboards → Browse
  - Import dashboard IDs:
    - 1860: Node Exporter Full
    - 7587: Docker Monitoring
    - 11074: GPU Metrics (if nvidia-smi exporter installed)
  - Customize for your setup
  - Time: 45 minutes

- [ ] **Configure alerting**
  - Navigate to Alerting → Alert rules
  - Create alerts:
    - High CPU (>80% for 5 minutes)
    - High GPU temp (>85°C)
    - High memory usage (>90%)
    - Disk space low (<10%)
    - Service down (probe failed)
  - Configure notification channels (email, Slack)
  - Time: 60 minutes

- [ ] **Set up SLO/SLA monitoring**
  - Define SLIs (Service Level Indicators):
    - API availability: 99.9%
    - API latency p95: <500ms
    - Error rate: <0.1%
  - Create SLO dashboards
  - Set up burn rate alerts
  - Time: 45 minutes

- [ ] **Configure log aggregation**
  - Set up Promtail or Grafana Agent to ship logs
  - Configure log parsing (JSON logs recommended)
  - Create log-based metrics (e.g., error count)
  - Test log queries
  - Time: 45 minutes

**Validation**:
- All PCs reporting metrics to Grafana Cloud
- Dashboards showing real-time data
- Alerts triggering correctly (test with intentional threshold breach)
- Logs queryable in Loki
- Free tier limits not exceeded

---

## Summary - External Service Setup

**Total Time**: 1-2 weeks
**Critical Path Items**:
1. Secrets management with Infisical (Week 1 - Day 1-2)
2. API key procurement and testing (Week 1 - Day 3-5)
3. Communication services setup (Week 2 - Day 1-3)
4. Monitoring infrastructure (Week 2 - Day 4-5)

**Key Deliverables**:
- ✓ All secrets centralized in Infisical
- ✓ API keys obtained and tested for all services
- ✓ Email and SMS providers configured
- ✓ Monitoring stack operational
- ✓ All credentials documented and secured

**Estimated Monthly Costs**:
- Infisical Cloud: $18/user (or $0 self-hosted)
- AI APIs: $100-500 (usage-based)
- SendGrid: $15 (or $0 on free tier)
- Twilio: $2-50 (based on volume)
- Grafana Cloud: $0 (free tier)
- **Total**: ~$135-600/month (scales with usage)

**Next Section**: [Security & Compliance](#security--compliance)

---

## Security & Compliance (Manual)

**Total Estimated Time**: 2-3 weeks
**Dependencies**: Legal counsel, compliance officer, security team
**Team**: Security Engineer, Compliance Officer, Legal, DevOps

### 1. Review and Sign BAA Agreements

**Time Estimate**: 1-2 weeks (mostly waiting)
**Cost**: $0-500 (legal review fees)
**Prerequisites**: Entity formation, business insurance
**Purpose**: HIPAA compliance for handling PHI

#### Steps:

- [ ] **Determine BAA requirements**
  - Identify which services process PHI (Personally Identifiable Health Information)
  - Services likely requiring BAAs:
    - Email provider (SendGrid/Mailgun) - if sending health data
    - SMS provider (Twilio) - if sending health data
    - Database provider - if storing health data
    - AI providers (Anthropic/OpenAI) - if processing health data
  - Document data flow and PHI touchpoints
  - Time: 2 hours

- [ ] **Contact service providers for BAA**
  - SendGrid: Email support or use Enterprise plan
  - Twilio: Available on all paid plans, request via support
  - Anthropic: Available for enterprise customers
  - OpenAI: Contact sales team for BAA
  - AWS/Google Cloud: Self-service BAA available in console
  - Time: 1 hour (submitting requests)

- [ ] **Legal review of BAA terms**
  - Engage legal counsel or compliance consultant
  - Review each BAA for:
    - Scope of PHI handling
    - Security requirements
    - Breach notification procedures
    - Termination clauses
    - Liability and indemnification
  - Time: 4-8 hours (legal review)
  - Cost: $500-2000 depending on counsel

- [ ] **Negotiate terms if needed**
  - Work with legal to request modifications
  - Common negotiation points:
    - Liability caps
    - Indemnification scope
    - Audit rights
    - Data retention periods
  - Time: Variable (1-2 weeks with back-and-forth)

- [ ] **Execute BAAs**
  - Sign electronically or physically
  - Obtain fully-executed copies
  - Store in secure document repository
  - Set calendar reminders for renewal dates
  - Time: 1-2 hours

- [ ] **Document compliance posture**
  - Create BAA tracking spreadsheet:
    - Service name
    - BAA status (executed/pending/not required)
    - Execution date
    - Renewal date
    - Contact person
  - Share with compliance team
  - Time: 1 hour

**Validation**:
- All PHI-touching services have executed BAAs
- Copies stored securely
- Renewal calendar set
- Compliance team notified

---

### 2. Configure Encryption at Rest

**Time Estimate**: 1-2 days
**Cost**: $0 (usually included)
**Prerequisites**: Access to all data storage systems
**Purpose**: Protect data when stored on disk

#### Steps:

##### Database Encryption
- [ ] **Enable PostgreSQL encryption**
  - If using managed service (AWS RDS, Google Cloud SQL):
    - Navigate to database settings
    - Enable "Encryption at Rest"
    - Select KMS key or default encryption
    - Note: May require database restart
  - If self-hosted:
    - Enable `pgcrypto` extension
    - Use encrypted filesystem (LUKS on Linux)
    - Configure TDE (Transparent Data Encryption)
  - Time: 30 minutes

- [ ] **Verify encryption status**
  - Query encryption status:
    ```sql
    SELECT name, setting
    FROM pg_settings
    WHERE name LIKE '%encrypt%';
    ```
  - Check storage encryption in cloud console
  - Time: 15 minutes

##### Redis Encryption
- [ ] **Configure Redis encryption**
  - Upstash: Encryption enabled by default (AES-256)
  - Self-hosted: Configure Redis with TLS
    - Edit redis.conf:
      ```conf
      tls-port 6380
      tls-cert-file /path/to/cert.pem
      tls-key-file /path/to/key.pem
      tls-ca-cert-file /path/to/ca.pem
      ```
  - Restart Redis service
  - Time: 30 minutes

##### File Storage Encryption
- [ ] **Enable Cloudflare R2 encryption (if using)**
  - Navigate to R2 bucket settings
  - Enable server-side encryption
  - Select encryption key (Cloudflare-managed or customer-managed)
  - Time: 15 minutes

- [ ] **Configure disk encryption on PCs**
  - Windows: Enable BitLocker
    - Control Panel → System and Security → BitLocker
    - Turn on BitLocker for system drive
    - Save recovery key securely
  - Linux: Use LUKS
    - Check if already encrypted: `lsblk`
    - For new installs, enable during installation
    - For existing: Use `cryptsetup`
  - Time: 1 hour per PC (4 hours total)

##### Secrets Encryption
- [ ] **Verify Infisical encryption**
  - Infisical uses AES-256-GCM by default
  - Master key stored in KMS (AWS/GCP) if self-hosted
  - Cloud version: Encryption automatic
  - Time: 15 minutes

- [ ] **Implement application-level encryption (for sensitive fields)**
  - Install encryption library:
    ```bash
    npm install crypto-js
    ```
  - Encrypt before database storage:
    ```javascript
    const CryptoJS = require('crypto-js');
    const encryptedSSN = CryptoJS.AES.encrypt(ssn, process.env.ENCRYPTION_KEY).toString();
    ```
  - Decrypt when retrieved
  - Time: 2-3 hours (implementation)

**Validation**:
- All databases showing encryption enabled
- Disk encryption active on all PCs
- Encryption keys documented and backed up
- Test data retrieval (decrypt successfully)

---

### 3. Set Up Audit Logging

**Time Estimate**: 2-3 days
**Cost**: Included in monitoring costs
**Prerequisites**: Grafana Cloud/Loki configured
**Purpose**: Compliance audit trails, security forensics

#### Steps:

##### Application Audit Logging
- [ ] **Implement audit log middleware**
  - Create audit log service:
    ```javascript
    class AuditLogger {
      log(event, userId, resource, action, result, metadata) {
        const entry = {
          timestamp: new Date().toISOString(),
          event,
          userId,
          resource,
          action,
          result, // success/failure
          ip: metadata.ip,
          userAgent: metadata.userAgent,
          sessionId: metadata.sessionId
        };
        // Send to Loki or database
        logger.info('AUDIT', entry);
      }
    }
    ```
  - Integrate with API routes
  - Time: 4 hours

- [ ] **Define audit events**
  - User events:
    - Login (success/failure)
    - Logout
    - Password change
    - Email/phone update
    - Account deletion
  - Data access:
    - PHI viewed
    - Reports generated
    - Data exported
  - Admin actions:
    - User created/deleted
    - Permission changed
    - Configuration updated
  - Time: 2 hours

##### Infrastructure Audit Logging
- [ ] **Enable Cloudflare audit logs**
  - Navigate to Account → Audit Log
  - Review events automatically logged:
    - DNS changes
    - Firewall rule changes
    - User access
  - Set up log forwarding to Loki (if needed)
  - Time: 30 minutes

- [ ] **Configure GitHub audit log**
  - Organization settings → Audit log
  - Enable audit log streaming (Enterprise only)
  - Alternative: Use GitHub API to fetch periodically
  - Document important events to monitor:
    - Repository access changes
    - Secret changes
    - Branch protection changes
  - Time: 30 minutes

- [ ] **Database audit logging**
  - PostgreSQL: Enable `pgaudit` extension
    ```sql
    CREATE EXTENSION pgaudit;
    ALTER SYSTEM SET pgaudit.log = 'write, ddl';
    SELECT pg_reload_conf();
    ```
  - Configure audit rules for sensitive tables
  - Forward logs to Loki
  - Time: 1 hour

##### Centralize and Retain Logs
- [ ] **Configure log retention**
  - Grafana Loki: Free tier = 14 days, upgrade for longer
  - For compliance, retain audit logs for 7 years:
    - Option A: Archive to S3/R2 monthly
    - Option B: Upgrade Grafana Cloud plan
    - Option C: Self-host long-term storage
  - Implement archival script:
    ```bash
    #!/bin/bash
    # Monthly archive to S3
    DATE=$(date +%Y-%m)
    curl -u "$LOKI_USER:$LOKI_KEY" \
      "https://logs.grafana.net/loki/api/v1/query_range?query={job=\"audit\"}&start=..." \
      | gzip > audit-$DATE.json.gz
    aws s3 cp audit-$DATE.json.gz s3://ratehunter-audit-logs/
    ```
  - Schedule via cron
  - Time: 2 hours

- [ ] **Create audit log dashboard**
  - Grafana dashboard showing:
    - Failed login attempts (by user, by IP)
    - PHI access patterns
    - Admin actions timeline
    - Anomalous activity (e.g., bulk exports)
  - Set up alerts:
    - >5 failed logins from same IP in 5 minutes
    - Access to PHI outside business hours
    - Unusual data export volume
  - Time: 3 hours

**Validation**:
- Audit events logging correctly
- Logs visible in Grafana Loki
- Retention policy configured
- Dashboard functional
- Test alerts triggering

---

### 4. Create Incident Response Plan

**Time Estimate**: 1 week
**Cost**: $500-2000 (consultant/legal review)
**Prerequisites**: Team identified, communication channels
**Purpose**: Structured response to security incidents

#### Steps:

- [ ] **Define incident categories**
  - Category 1 - Critical: Data breach, ransomware, system compromise
  - Category 2 - High: DoS attack, PHI exposure, major vulnerability
  - Category 3 - Medium: Failed intrusion attempt, minor data leak
  - Category 4 - Low: Security scan findings, policy violation
  - Time: 1 hour

- [ ] **Identify incident response team**
  - Incident Commander: [Name/Role]
  - Technical Lead: [Name/Role]
  - Communications Lead: [Name/Role]
  - Legal Liaison: [Name/Role]
  - Document contact information (24/7 phone, backup contacts)
  - Time: 1 hour

- [ ] **Create incident response playbook**
  - Document step-by-step procedures for each category:
    - **Detection**: How incidents are identified
    - **Analysis**: Determining scope and impact
    - **Containment**: Immediate actions to limit damage
    - **Eradication**: Removing threat from environment
    - **Recovery**: Restoring normal operations
    - **Post-Incident**: Lessons learned, process improvements
  - Include checklists, scripts, decision trees
  - Time: 8-16 hours

- [ ] **Define communication protocols**
  - Internal notification:
    - Use Slack channel #security-incidents
    - Email distribution list: security-team@company.com
    - Phone tree for after-hours
  - External notification:
    - Customers: Email within 72 hours (HIPAA requirement)
    - Regulators: HHS OCR within 60 days for >500 affected
    - Law enforcement: FBI IC3 for cyber crimes
    - Media: Prepared statement, designated spokesperson
  - Draft templates for each scenario
  - Time: 4 hours

- [ ] **Establish breach notification procedures (HIPAA)**
  - **Individual notification**:
    - Timeline: Within 60 days of discovery
    - Method: First-class mail (or email if agreed)
    - Content: What happened, what information, actions taken, steps they can take
  - **Media notification** (if >500 affected):
    - Notify prominent media outlets in affected regions
    - Within 60 days
  - **HHS notification**:
    - >500 affected: Within 60 days
    - <500 affected: Annual report
  - Document templates for each
  - Time: 4 hours

- [ ] **Set up incident tracking system**
  - Use simple system (spreadsheet or GitHub Issues)
  - Track:
    - Incident ID
    - Date/time detected
    - Category/severity
    - Description
    - Status (open/contained/resolved/closed)
    - Actions taken
    - Root cause
    - Lessons learned
  - Time: 2 hours

- [ ] **Conduct tabletop exercise**
  - Simulate realistic incident (e.g., ransomware attack)
  - Walk through response procedures
  - Identify gaps in plan
  - Document improvements needed
  - Time: 4 hours

- [ ] **Legal review of plan**
  - Have legal counsel review:
    - Breach notification language
    - Regulatory compliance
    - Liability considerations
  - Time: 2-4 hours (legal review)
  - Cost: $500-2000

**Validation**:
- Response plan documented and approved
- Team trained on procedures
- Tabletop exercise completed
- Legal sign-off obtained
- Plan accessible 24/7 (printed copies, secure wiki)

---

### 5. Document Data Retention Policies

**Time Estimate**: 2-3 days
**Cost**: $0-500 (legal review)
**Prerequisites**: Understanding of regulatory requirements
**Purpose**: Compliance with privacy laws, efficient storage

#### Steps:

- [ ] **Research regulatory requirements**
  - HIPAA: 6 years from creation or last use
  - GLBA (mortgage data): 5 years
  - State laws: May have additional requirements
  - Consult with legal counsel or compliance expert
  - Time: 3 hours

- [ ] **Define retention periods by data type**
  - User accounts:
    - Active users: Indefinite
    - Deleted accounts: 90 days (soft delete), then purge
  - Transaction data:
    - Mortgage quotes: 7 years (safe harbor)
    - Rate alerts: 3 years
    - User preferences: While account active + 90 days
  - Logs and audit trails:
    - Application logs: 90 days
    - Audit logs: 7 years
    - Security logs: 1 year
  - Backups:
    - Daily: 7 days
    - Weekly: 4 weeks
    - Monthly: 12 months
    - Yearly: 7 years
  - Time: 4 hours

- [ ] **Create data retention policy document**
  - Formal document including:
    - Purpose and scope
    - Retention schedule (table format)
    - Deletion procedures
    - Exceptions process
    - Roles and responsibilities
    - Review frequency (annual)
  - Template:
    ```markdown
    # Data Retention Policy

    ## Retention Schedule
    | Data Type | Retention Period | Deletion Method | Regulatory Basis |
    |-----------|-----------------|-----------------|------------------|
    | User PII | 90 days post-delete | Secure erasure | GDPR |
    | Mortgage quotes | 7 years | Archive then purge | GLBA |
    | Audit logs | 7 years | Long-term storage | HIPAA |
    ```
  - Time: 4 hours

- [ ] **Implement automated data purging**
  - Create scheduled job for data deletion:
    ```javascript
    // Run daily at 2 AM
    cron.schedule('0 2 * * *', async () => {
      // Delete soft-deleted users older than 90 days
      await db.query(`
        DELETE FROM users
        WHERE deleted_at < NOW() - INTERVAL '90 days'
      `);

      // Archive old logs
      await archiveOldLogs();

      // Clean up temp files
      await cleanupTempFiles();

      logger.info('Data retention job completed');
    });
    ```
  - Test in staging first
  - Time: 4 hours

- [ ] **Implement backup rotation**
  - Configure backup tool (e.g., pg_dump, restic):
    ```bash
    #!/bin/bash
    # Daily backup
    pg_dump $DATABASE_URL | gzip > /backups/daily/db-$(date +%Y%m%d).sql.gz

    # Rotate backups
    find /backups/daily -mtime +7 -delete  # Keep 7 days
    find /backups/weekly -mtime +28 -delete  # Keep 4 weeks
    find /backups/monthly -mtime +365 -delete  # Keep 12 months
    ```
  - Schedule via cron
  - Test restoration procedure
  - Time: 3 hours

- [ ] **Document user data export (GDPR Right to Data Portability)**
  - Create export API endpoint:
    ```javascript
    // GET /api/users/me/export
    router.get('/export', auth, async (req, res) => {
      const userData = await getUserData(req.user.id);
      res.json({
        user: userData,
        quotes: await getUserQuotes(req.user.id),
        preferences: await getUserPreferences(req.user.id),
        exportDate: new Date().toISOString()
      });
    });
    ```
  - Provide in machine-readable format (JSON)
  - Time: 2 hours

- [ ] **Document user data deletion (GDPR Right to Erasure)**
  - Create deletion endpoint:
    ```javascript
    // DELETE /api/users/me
    router.delete('/', auth, async (req, res) => {
      await softDeleteUser(req.user.id);
      // Soft delete: mark deleted_at timestamp
      // Hard delete after 90 days via scheduled job
      res.json({ message: 'Account scheduled for deletion' });
    });
    ```
  - Notify user of 90-day grace period
  - Time: 2 hours

- [ ] **Legal review**
  - Have counsel review retention policy
  - Ensure compliance with all applicable regulations
  - Time: 2 hours (legal review)
  - Cost: $500

**Validation**:
- Retention policy documented and approved
- Automated purging tested
- Backup rotation functional
- Export/deletion endpoints working
- Legal approval obtained

---

### 6. Configure Backup Procedures

**Time Estimate**: 2-3 days
**Cost**: $5-50/month (storage costs)
**Prerequisites**: Backup storage provisioned
**Purpose**: Data protection, disaster recovery

#### Steps:

##### Database Backups
- [ ] **Set up automated PostgreSQL backups**
  - If using managed service:
    - Enable automated backups (usually default)
    - Set retention: 7 days continuous, 4 weekly, 12 monthly
    - Enable point-in-time recovery (PITR)
  - If self-hosted:
    - Install backup tool: `pg_dump`, `pgBackRest`, or `Barman`
    - Create backup script:
      ```bash
      #!/bin/bash
      BACKUP_DIR=/var/backups/postgresql
      DATE=$(date +%Y%m%d_%H%M%S)

      # Full backup
      pg_dump -U postgres -h localhost -F c ratehunter_prod > \
        $BACKUP_DIR/full/ratehunter_$DATE.dump

      # Compress
      gzip $BACKUP_DIR/full/ratehunter_$DATE.dump

      # Upload to cloud storage
      aws s3 cp $BACKUP_DIR/full/ratehunter_$DATE.dump.gz \
        s3://ratehunter-backups/postgres/

      # Clean up local backups older than 2 days
      find $BACKUP_DIR/full -mtime +2 -delete
      ```
    - Schedule via cron: `0 1 * * * /path/to/backup.sh`
  - Time: 2 hours

- [ ] **Test database restoration**
  - Create test database
  - Restore from latest backup:
    ```bash
    gunzip -c ratehunter_20260121.dump.gz | pg_restore -U postgres -d ratehunter_test
    ```
  - Verify data integrity
  - Document restoration time (should be <30 minutes)
  - Time: 1 hour

##### Application Backup
- [ ] **Set up code/config backups**
  - Code: Already in GitHub (no additional backup needed)
  - Configuration files:
    - Backup `.env`, config files (encrypted)
    - Store in Infisical or encrypted S3 bucket
    - Script:
      ```bash
      #!/bin/bash
      tar -czf configs-$(date +%Y%m%d).tar.gz \
        /etc/nginx/ \
        /etc/systemd/system/ \
        ~/.cloudflared/

      # Encrypt before upload
      gpg --encrypt --recipient backups@ratehunter.net configs-*.tar.gz
      aws s3 cp configs-*.tar.gz.gpg s3://ratehunter-backups/configs/
      ```
  - Time: 1 hour

##### File Storage Backup
- [ ] **Configure Cloudflare R2 versioning (if using)**
  - Enable object versioning
  - Set lifecycle rule: Keep 30 versions per object
  - Time: 15 minutes

- [ ] **Backup uploaded user files**
  - If files stored locally, sync to cloud:
    ```bash
    # Use rclone or aws s3 sync
    rclone sync /var/www/uploads remote:ratehunter-uploads
    ```
  - Schedule hourly sync
  - Time: 1 hour

##### Secrets Backup
- [ ] **Backup Infisical**
  - If self-hosted:
    - Backup Infisical database (PostgreSQL/MongoDB)
    - Backup encryption keys (KMS or filesystem)
  - If cloud:
    - Export secrets periodically:
      ```bash
      infisical export --env=production --format=json > secrets-backup.json
      # Encrypt
      gpg --encrypt secrets-backup.json
      # Store securely
      ```
    - Store encrypted backup in secure location (offline)
  - Time: 1 hour

##### Monitoring Backup Failures
- [ ] **Set up backup monitoring**
  - Create health check script:
    ```bash
    #!/bin/bash
    # Check if backup completed today
    LATEST_BACKUP=$(aws s3 ls s3://ratehunter-backups/postgres/ | tail -1)
    BACKUP_AGE=$((($(date +%s) - $(date -d"$(echo $LATEST_BACKUP | awk '{print $1}')" +%s)) / 3600))

    if [ $BACKUP_AGE -gt 26 ]; then
      # Alert if backup older than 26 hours
      curl -X POST $SLACK_WEBHOOK -d '{"text":"⚠️ Database backup is overdue!"}'
      exit 1
    fi
    ```
  - Schedule check: `0 12 * * * /path/to/check-backup.sh`
  - Time: 1 hour

- [ ] **Test full disaster recovery**
  - Simulate complete data loss
  - Restore from backups:
    1. Provision new database instance
    2. Restore database from backup
    3. Restore application configs
    4. Restore file storage
    5. Verify application functionality
  - Document Recovery Time Objective (RTO): Target <4 hours
  - Document Recovery Point Objective (RPO): Target <24 hours
  - Time: 4 hours

**Validation**:
- Automated backups running successfully
- Restoration tested and documented
- Backup monitoring alerts configured
- RTO/RPO documented and achievable
- Backup storage costs within budget

---

### 7. Set Up Disaster Recovery Plan

**Time Estimate**: 1 week
**Cost**: Variable (depends on DR strategy)
**Prerequisites**: Backup procedures in place
**Purpose**: Business continuity in case of catastrophic failure

#### Steps:

- [ ] **Define disaster scenarios**
  - Scenario 1: Single PC failure (hardware)
  - Scenario 2: Complete site failure (fire, flood)
  - Scenario 3: Cyber attack (ransomware)
  - Scenario 4: Cloud provider outage (Cloudflare)
  - Scenario 5: Data corruption
  - Time: 2 hours

- [ ] **Document failover procedures**
  - For each scenario, detail:
    - Detection method
    - Notification procedure
    - Failover steps
    - Rollback procedure (if needed)
  - Example (PC failure):
    ```markdown
    ## PC Failure Response

    ### Detection
    - Grafana alert: Host unreachable for >5 minutes
    - Manual report from monitoring

    ### Immediate Actions
    1. Verify failure (ping, SSH attempt)
    2. Check Tailscale status
    3. Assess workload impact

    ### Failover
    1. Redistribute workload to remaining PCs
    2. Update load balancer configuration
    3. Scale up remaining workers

    ### Recovery
    1. Diagnose hardware issue
    2. Replace/repair failed component
    3. Restore PC to cluster
    4. Rebalance workload

    RTO: 2 hours
    ```
  - Time: 8 hours

- [ ] **Implement multi-region strategy (optional)**
  - For critical services, consider geographic redundancy:
    - Database: Multi-region replication (AWS/GCP)
    - Application: Deploy to multiple Cloudflare regions
    - DNS: Already global with Cloudflare
  - Trade-off: Increased cost vs. availability
  - Document decision
  - Time: Variable (if implemented)

- [ ] **Create runbook**
  - Single document with all DR procedures
  - Include:
    - Contact lists
    - System diagrams
    - Access credentials location
    - Step-by-step recovery procedures
    - Validation checklists
  - Store in multiple locations:
    - Printed copy (secure location)
    - Encrypted PDF (cloud storage)
    - Wiki page (internal)
  - Time: 4 hours

- [ ] **Establish communication plan**
  - Status page: Use Statuspage.io or custom
  - Customer notifications: Email templates
  - Internal notifications: Slack, phone tree
  - Time: 2 hours

- [ ] **Conduct DR test (fire drill)**
  - Schedule planned outage (off-hours)
  - Simulate disaster (e.g., shut down coordinator PC)
  - Execute recovery procedures
  - Document:
    - Actual RTO achieved
    - Issues encountered
    - Improvements needed
  - Time: 4-8 hours

**Validation**:
- DR plan documented and accessible
- Failover procedures tested
- RTO/RPO achievable
- Communication plan ready
- Team trained on procedures

---

## Summary - Security & Compliance

**Total Time**: 2-3 weeks
**Critical Path Items**:
1. BAA execution (Week 1-2, mostly waiting)
2. Encryption and audit logging (Week 2)
3. Incident response and DR planning (Week 3)

**Key Deliverables**:
- ✓ BAAs executed for all PHI-touching services
- ✓ Encryption at rest enabled everywhere
- ✓ Audit logging comprehensive and retained
- ✓ Incident response plan documented and tested
- ✓ Data retention policies implemented
- ✓ Backup procedures automated and tested
- ✓ Disaster recovery plan documented

**Compliance Checklist**:
- ✓ HIPAA: BAAs, encryption, audit logs, breach procedures
- ✓ GLBA: Data retention, security controls
- ✓ GDPR: Right to erasure, right to data portability
- ✓ State laws: Breach notification procedures

**Next Section**: [Testing & Validation](#testing--validation)

---

## Testing & Validation (Manual)

**Total Estimated Time**: 2-3 weeks
**Dependencies**: All infrastructure and services operational
**Team**: QA Engineers, DevOps, Security Team, End Users

### 1. Load Testing with Real Mortgage Data

**Time Estimate**: 1 week
**Cost**: $50-200 (testing tools)
**Prerequisites**: Test environment configured, test data prepared
**Purpose**: Validate system performance under realistic load

#### Steps:

- [ ] **Prepare test data**
  - Create realistic mortgage scenarios:
    - Loan amounts: $100K-$2M
    - Credit scores: 600-850
    - Property types: Single-family, condo, multi-family
    - Loan types: Conventional, FHA, VA, Jumbo
    - Geographic diversity: All 50 states
  - Generate 10,000+ test scenarios
  - Anonymize (no real PII)
  - Time: 8 hours

- [ ] **Define load testing scenarios**
  - Scenario 1: Normal load (100 concurrent users)
  - Scenario 2: Peak load (500 concurrent users)
  - Scenario 3: Stress test (1000+ concurrent users)
  - Scenario 4: Spike test (sudden 10x traffic increase)
  - Scenario 5: Endurance test (sustained load for 24 hours)
  - Time: 4 hours

- [ ] **Select load testing tool**
  - Options:
    - k6 (open source, developer-friendly)
    - Apache JMeter (feature-rich, GUI)
    - Artillery (CI/CD friendly)
    - Locust (Python-based)
  - Install and configure
  - Time: 2 hours

- [ ] **Create load test scripts**
  - Example k6 script:
    ```javascript
    import http from 'k6/http';
    import { check, sleep } from 'k6';

    export let options = {
      stages: [
        { duration: '2m', target: 100 }, // Ramp-up
        { duration: '5m', target: 100 }, // Steady state
        { duration: '2m', target: 0 },   // Ramp-down
      ],
      thresholds: {
        http_req_duration: ['p(95)<500'], // 95% under 500ms
        http_req_failed: ['rate<0.01'],   // <1% failures
      },
    };

    export default function () {
      const payload = JSON.stringify({
        loanAmount: 300000,
        creditScore: 720,
        propertyType: 'single-family',
        state: 'CA',
      });

      const params = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${__ENV.API_KEY}`,
        },
      };

      const res = http.post('https://api.projectnyra.com/rates/quote', payload, params);

      check(res, {
        'status is 200': (r) => r.status === 200,
        'response time < 500ms': (r) => r.timings.duration < 500,
        'has rates': (r) => JSON.parse(r.body).rates.length > 0,
      });

      sleep(1);
    }
    ```
  - Time: 8 hours

- [ ] **Execute load tests**
  - Run each scenario
  - Monitor system metrics:
    - CPU usage (should stay <80%)
    - Memory usage (should stay <85%)
    - GPU utilization (appropriate for workload)
    - API latency (p50, p95, p99)
    - Error rate (should be <1%)
    - Database connections
  - Document results
  - Time: 16 hours (including analysis)

- [ ] **Analyze bottlenecks**
  - Use APM tools (Grafana, New Relic)
  - Identify slow queries, endpoints
  - Profile GPU-intensive operations
  - Document findings:
    ```markdown
    ## Bottleneck Analysis

    ### Issue: Rate calculation endpoint slow under load
    - P95 latency: 850ms (target: <500ms)
    - Root cause: Sequential AI model calls
    - Solution: Implement parallel processing
    - Priority: High

    ### Issue: Database connection pool exhausted
    - Occurred at: 600 concurrent users
    - Root cause: Max connections set to 20
    - Solution: Increase to 100, implement connection pooling
    - Priority: Critical
    ```
  - Time: 8 hours

- [ ] **Optimize and re-test**
  - Implement performance fixes
  - Re-run load tests
  - Verify improvements
  - Iterate until targets met
  - Time: 24 hours (varies)

**Validation**:
- System handles peak load (500 concurrent users)
- API latency p95 < 500ms
- Error rate < 1%
- No resource exhaustion
- Database and cache perform adequately

---

### 2. Security Penetration Testing

**Time Estimate**: 1-2 weeks
**Cost**: $2,000-10,000 (professional pen test) or $0 (self-test)
**Prerequisites**: All security controls implemented
**Purpose**: Identify vulnerabilities before malicious actors do

#### Steps:

##### Option A: Professional Pen Test (Recommended)
- [ ] **Select pen testing firm**
  - Research reputable firms (OWASP, SANS certified)
  - Request quotes from 3+ vendors
  - Check references
  - Verify insurance coverage
  - Time: 8 hours

- [ ] **Define scope**
  - In-scope:
    - Web application (ratehunter.net)
    - API endpoints (api.projectnyra.com)
    - Infrastructure (Cloudflare, worker PCs)
  - Out-of-scope:
    - Third-party services (Anthropic, SendGrid)
    - Social engineering
    - Physical security
  - Time: 4 hours

- [ ] **Execute penetration test**
  - Provide test credentials, access
  - Pen testers conduct testing (1-2 weeks)
  - Daily status calls
  - Provide support as needed
  - Time: 1-2 weeks (waiting)

- [ ] **Review findings report**
  - Categorize by severity:
    - Critical: Remote code execution, SQL injection
    - High: XSS, authentication bypass
    - Medium: Information disclosure, CSRF
    - Low: Security misconfigurations
  - Prioritize remediation
  - Time: 4 hours

##### Option B: Self-Service Testing
- [ ] **Automated scanning**
  - Use OWASP ZAP or Burp Suite
  - Configure scanner with API endpoints
  - Run full scan (4-8 hours)
  - Review findings
  - Time: 12 hours

- [ ] **Manual testing**
  - OWASP Top 10 checks:
    1. Injection (SQL, NoSQL, command)
    2. Broken authentication
    3. Sensitive data exposure
    4. XML external entities (XXE)
    5. Broken access control
    6. Security misconfiguration
    7. Cross-site scripting (XSS)
    8. Insecure deserialization
    9. Using components with known vulnerabilities
    10. Insufficient logging & monitoring
  - Test each manually
  - Time: 24 hours

##### Common Steps (Both Options)
- [ ] **Remediate findings**
  - Fix critical and high severity issues immediately
  - Schedule medium/low for next sprint
  - Document fixes:
    - Issue: SQL injection in search endpoint
    - Fix: Implemented parameterized queries
    - Verified: Re-tested with SQLMap, no longer vulnerable
  - Time: 40-80 hours (depends on findings)

- [ ] **Re-test vulnerabilities**
  - Verify each fix
  - Ensure no regression
  - Time: 8 hours

- [ ] **Obtain attestation letter (if professional)**
  - Request final report
  - Include "clean bill of health" if all issues resolved
  - Use for compliance documentation
  - Time: 1 hour

**Validation**:
- All critical/high vulnerabilities fixed
- Pen test report shows acceptable risk level
- Security controls validated
- Compliance requirements met

---

### 3. Compliance Audit Review

**Time Estimate**: 1 week
**Cost**: $1,000-5,000 (external auditor)
**Prerequisites**: All compliance controls implemented
**Purpose**: Validate HIPAA, GLBA, state law compliance

#### Steps:

- [ ] **Select compliance auditor**
  - Look for healthcare/financial services experience
  - Verify HIPAA auditing credentials
  - Request sample audit report
  - Time: 4 hours

- [ ] **Prepare documentation**
  - Compile evidence:
    - BAA agreements
    - Encryption certificates
    - Audit log samples
    - Incident response plan
    - Data retention policy
    - Backup/DR procedures
    - Employee training records
  - Organize in shared folder
  - Time: 8 hours

- [ ] **Complete self-assessment**
  - Use HHS HIPAA Security Rule checklist
  - Document gaps
  - Create remediation plan for any deficiencies
  - Time: 12 hours

- [ ] **Conduct audit**
  - Schedule kickoff call
  - Provide access to systems (read-only)
  - Answer auditor questions
  - Provide additional documentation as requested
  - Time: 1 week (auditor work)

- [ ] **Review audit findings**
  - Receive draft report
  - Identify any deficiencies
  - Discuss with auditor
  - Time: 4 hours

- [ ] **Remediate deficiencies**
  - Address all findings
  - Document corrective actions
  - Provide evidence to auditor
  - Time: Variable (16-40 hours)

- [ ] **Obtain final attestation**
  - Receive final audit report
  - File with compliance documentation
  - Share with stakeholders
  - Time: 2 hours

**Validation**:
- Audit completed with no major deficiencies
- All minor issues remediated
- Attestation letter received
- Compliance posture documented

---

### 4. User Acceptance Testing (UAT)

**Time Estimate**: 2 weeks
**Cost**: $500-2,000 (user incentives)
**Prerequisites**: Application feature-complete
**Purpose**: Validate usability and functionality with real users

#### Steps:

- [ ] **Recruit beta testers**
  - Target 20-30 users
  - Diverse demographics:
    - First-time homebuyers
    - Refinancers
    - Real estate agents
    - Mortgage brokers
  - Offer incentives ($50-100 Amazon gift card)
  - Time: 8 hours

- [ ] **Create UAT test plan**
  - Define scenarios:
    - Scenario 1: First-time user registration
    - Scenario 2: Getting a mortgage rate quote
    - Scenario 3: Setting up rate alerts
    - Scenario 4: Comparing lenders
    - Scenario 5: Contacting a lender
  - Create task lists for each scenario
  - Time: 8 hours

- [ ] **Prepare test environment**
  - Use staging environment (not production)
  - Load with test lender data
  - Configure analytics/screen recording
  - Send invitation emails with instructions
  - Time: 4 hours

- [ ] **Conduct UAT sessions**
  - Option A: Moderated (Zoom sessions)
    - Schedule 1-hour sessions
    - Observe user interactions
    - Take notes
    - Ask follow-up questions
  - Option B: Unmoderated
    - Users test on their own time
    - Use survey for feedback
  - Time: 40 hours (20 users × 2 hours each)

- [ ] **Collect feedback**
  - Survey questions:
    - How easy was it to get a rate quote? (1-5 scale)
    - Did you encounter any errors? (yes/no, describe)
    - What features were confusing?
    - What features were most useful?
    - Would you recommend this to a friend? (NPS)
  - Compile responses
  - Time: 8 hours

- [ ] **Analyze results**
  - Categorize feedback:
    - Bugs (functional issues)
    - Usability issues (confusing UX)
    - Feature requests (nice-to-haves)
    - Praise (what worked well)
  - Prioritize fixes:
    - P0: Blocking issues (prevent launch)
    - P1: Critical usability problems
    - P2: Nice-to-fixes
  - Time: 8 hours

- [ ] **Implement fixes**
  - Address all P0/P1 issues
  - Test fixes
  - Deploy to staging
  - Time: 40-80 hours (depends on findings)

- [ ] **Conduct follow-up testing (if needed)**
  - If major changes made, re-test with subset of users
  - Verify issues resolved
  - Time: 8-16 hours

**Validation**:
- No P0 issues remaining
- Average usability rating >4/5
- NPS score >30 (good for new product)
- All testers can complete core workflows

---

### 5. Performance Benchmarking

**Time Estimate**: 3-4 days
**Prerequisites**: System under typical load
**Purpose**: Establish baseline metrics for monitoring

#### Steps:

- [ ] **Define key metrics**
  - Application metrics:
    - API response time (p50, p95, p99)
    - Page load time
    - Time to interactive
    - Error rate
  - Infrastructure metrics:
    - CPU utilization
    - Memory usage
    - GPU utilization
    - Network throughput
    - Disk I/O
  - Business metrics:
    - Quotes generated per hour
    - User registrations
    - Rate alert subscriptions
  - Time: 2 hours

- [ ] **Set up benchmarking environment**
  - Use production or production-like environment
  - Ensure monitoring instrumented (Grafana)
  - Configure synthetic monitoring (Pingdom, UptimeRobot)
  - Time: 4 hours

- [ ] **Run baseline benchmarks**
  - API latency:
    ```bash
    # Test rate quote endpoint
    for i in {1..1000}; do
      curl -w "%{time_total}\n" -o /dev/null -s \
        -X POST https://api.projectnyra.com/rates/quote \
        -H "Content-Type: application/json" \
        -d '{"loanAmount":300000,"creditScore":720}'
    done | awk '{sum+=$1; sumsq+=$1*$1} END {print "Avg:",sum/NR,"StdDev:",sqrt(sumsq/NR - (sum/NR)**2)}'
    ```
  - Page load time: Use Lighthouse
  - Database query performance: Enable slow query log
  - Time: 8 hours

- [ ] **Document baseline**
  - Create benchmark report:
    ```markdown
    # Baseline Performance Metrics
    Date: 2026-01-21

    ## API Performance
    - Rate quote endpoint: 245ms (p50), 420ms (p95), 680ms (p99)
    - Search endpoint: 180ms (p50), 350ms (p95), 550ms (p99)
    - User registration: 320ms (p50), 580ms (p95), 850ms (p99)

    ## Frontend Performance
    - Page load time: 1.8s (3G), 0.9s (4G)
    - Time to interactive: 2.4s (3G), 1.2s (4G)
    - Lighthouse score: 92/100

    ## Infrastructure
    - Compute-01: CPU 35%, Memory 6.2GB/32GB, GPU 45%
    - Worker-01: CPU 28%, Memory 4.8GB/16GB, GPU 60%
    - Worker-02: CPU 22%, Memory 3.9GB/16GB, GPU 40%

    ## Business Metrics
    - Quotes/hour: 1,200
    - Rate alerts/hour: 85
    ```
  - Time: 4 hours

- [ ] **Set performance budgets**
  - Define acceptable ranges:
    - API p95 latency: <500ms
    - Page load (4G): <2s
    - Error rate: <0.5%
    - CPU usage: <70% sustained
  - Configure alerts for violations
  - Time: 2 hours

- [ ] **Create performance dashboard**
  - Grafana dashboard showing:
    - Real-time latency metrics
    - Error rates
    - Resource utilization
    - Throughput
  - Share URL with team
  - Time: 4 hours

**Validation**:
- Baseline metrics documented
- Performance budgets set
- Dashboard operational
- Alerts configured

---

### 6. Failover Testing

**Time Estimate**: 2-3 days
**Cost**: $0
**Prerequisites**: HA configuration in place
**Purpose**: Validate system resilience and recovery

#### Steps:

- [ ] **Plan failover scenarios**
  - Scenario 1: Worker PC failure
  - Scenario 2: Network outage
  - Scenario 3: Database failover
  - Scenario 4: Cloudflare outage
  - Scenario 5: API rate limit exceeded
  - Time: 2 hours

- [ ] **Schedule maintenance window**
  - Choose low-traffic time (e.g., Sunday 2am-6am)
  - Notify team and stakeholders
  - Prepare rollback plan
  - Time: 1 hour

- [ ] **Test Scenario 1: Worker PC failure**
  - Current state: 3 workers active
  - Action: Shut down Worker-01
  - Expected behavior:
    - Grafana alert fires within 5 minutes
    - Workload redistributes to Worker-02 and Worker-03
    - No user-facing errors
    - Performance degrades gracefully (higher latency acceptable)
  - Execute and observe:
    ```bash
    # Shutdown Worker-01
    ssh worker-01 "sudo shutdown now"

    # Monitor from Compute-01
    watch -n 5 'curl -s https://api.projectnyra.com/health | jq'
    ```
  - Verify behavior matches expectations
  - Bring Worker-01 back online
  - Verify workload rebalances
  - Time: 2 hours

- [ ] **Test Scenario 2: Network outage**
  - Simulate with firewall rules:
    ```bash
    # Block Worker-02 from internet (not Tailscale)
    iptables -I OUTPUT -o eth0 -j DROP
    ```
  - Expected: Tailscale keeps internal communication working
  - Verify Worker-02 can't reach external APIs
  - Coordinator detects and routes work elsewhere
  - Restore network:
    ```bash
    iptables -D OUTPUT -o eth0 -j DROP
    ```
  - Time: 1.5 hours

- [ ] **Test Scenario 3: Database failover (if using HA setup)**
  - Trigger failover to standby replica
  - Verify application detects new primary
  - Check for any data loss (should be none with sync replication)
  - Measure downtime (target: <30 seconds)
  - Time: 2 hours

- [ ] **Test Scenario 4: Cloudflare outage**
  - Can't simulate, but prepare:
  - Document backup DNS provider configuration
  - Have manual failover procedure ready
  - Consider multi-CDN strategy for future
  - Time: 1 hour (documentation)

- [ ] **Test Scenario 5: Rate limit handling**
  - Intentionally exceed AI API rate limits
  - Verify application implements exponential backoff
  - Check user error messages are graceful
  - Verify requests eventually succeed (retry logic)
  - Time: 1.5 hours

- [ ] **Document findings**
  - For each scenario:
    - What worked as expected
    - What didn't work
    - Actual vs. target RTO
    - Improvements needed
  - Update runbooks with lessons learned
  - Time: 4 hours

**Validation**:
- System survives single points of failure
- RTO <30 minutes for most scenarios
- No data loss
- Alerts fire appropriately
- Team knows how to respond

---

## Summary - Testing & Validation

**Total Time**: 2-3 weeks
**Critical Path Items**:
1. Load testing and optimization (Week 1)
2. Security pen test and UAT (Week 2)
3. Compliance audit and failover testing (Week 3)

**Key Deliverables**:
- ✓ Load testing completed, performance targets met
- ✓ Security vulnerabilities identified and remediated
- ✓ Compliance audit passed
- ✓ UAT feedback incorporated
- ✓ Performance baseline established
- ✓ Failover scenarios validated

**Go/No-Go Criteria**:
- ✓ System handles 500 concurrent users
- ✓ No critical security vulnerabilities
- ✓ Compliance audit passed
- ✓ UAT score >4/5
- ✓ RTO <30 minutes for primary scenarios

**Next Section**: [Go-Live Preparation](#go-live-preparation)

---

## Go-Live Preparation (Manual)

**Total Estimated Time**: 1-2 weeks
**Dependencies**: All previous sections completed
**Team**: Entire organization

### 1. Create Production Runbook

**Time Estimate**: 1 week
**Cost**: $0
**Prerequisites**: All systems documented
**Purpose**: Operational guide for production environment

#### Steps:

- [ ] **Create runbook document structure**
  - Table of contents
  - System architecture overview
  - Service catalog
  - Common procedures
  - Troubleshooting guides
  - Emergency contacts
  - Time: 2 hours

- [ ] **Document system architecture**
  - Infrastructure diagram:
    ```
    [Users] → [Cloudflare CDN/WAF]
                    ↓
            [Cloudflare Pages]
                    ↓
            [Cloudflare Tunnel]
                    ↓
    [Compute-01: Coordinator] ←→ [Tailscale Mesh]
            ↓       ↓       ↓
    [Worker-01] [Worker-02] [Worker-03]
            ↓       ↓       ↓
    [PostgreSQL] [Redis] [External APIs]
    ```
  - Component responsibilities
  - Data flow diagrams
  - Time: 4 hours

- [ ] **Create service catalog**
  - For each service, document:
    - Service name and description
    - Owner/on-call contact
    - Dependencies
    - Health check URL
    - Monitoring dashboard URL
    - Log location
    - Common issues
  - Example:
    ```markdown
    ## Rate Quote API

    **Description**: Generates mortgage rate quotes using AI models
    **Owner**: Backend Team (backend-oncall@company.com)
    **Dependencies**: PostgreSQL, Redis, Anthropic API, OpenRouter
    **Health Check**: https://api.projectnyra.com/health
    **Dashboard**: https://ratehunter.grafana.net/d/api-metrics
    **Logs**: Grafana Loki, query: {service="rate-api"}

    **Common Issues**:
    - High latency: Check AI API rate limits, scale workers
    - 500 errors: Check database connections, review error logs
    ```
  - Time: 8 hours

- [ ] **Document operational procedures**
  - Daily checks:
    ```markdown
    ## Daily Operations Checklist

    - [ ] Check Grafana dashboard (all green)
    - [ ] Review error rate (should be <0.5%)
    - [ ] Verify backup completed (check S3 bucket)
    - [ ] Check AI API credit balances
    - [ ] Review security alerts (Cloudflare, Sentry)
    - [ ] Verify all PCs online (Tailscale dashboard)
    ```
  - Weekly tasks:
    - Review performance trends
    - Check for pending security updates
    - Review and archive old logs
    - Test backup restoration
  - Monthly tasks:
    - Rotate API keys
    - Review access controls
    - Update dependencies
    - Disaster recovery drill
  - Time: 4 hours

- [ ] **Create troubleshooting guides**
  - For common scenarios:
    ```markdown
    ## Scenario: API Latency Spike

    **Symptoms**: P95 latency >1000ms, users reporting slow quotes

    **Diagnosis**:
    1. Check Grafana: Which endpoint is slow?
    2. Check worker GPU utilization: >95%?
    3. Check external API status: Anthropic/OpenRouter down?
    4. Check database: Slow queries?

    **Resolution**:
    - If GPU saturated: Scale workers horizontally
    - If external API slow: Implement caching, reduce calls
    - If database slow: Optimize queries, add indexes
    - If network issue: Check Tailscale connectivity

    **Prevention**: Set up alerts for p95 >500ms
    ```
  - Cover top 10 failure scenarios
  - Time: 8 hours

- [ ] **Document deployment procedures**
  - How to deploy:
    - Frontend: Push to main branch (auto-deploy via GitHub Actions)
    - Backend: SSH to Compute-01, pull latest, restart service
    - Database migrations: Use migration tool, test on staging first
  - Rollback procedures
  - Blue-green deployment strategy (future)
  - Time: 4 hours

- [ ] **Add emergency contacts**
  - Create contact matrix:
    ```markdown
    ## Emergency Contacts

    | Role | Name | Phone | Email | Backup |
    |------|------|-------|-------|--------|
    | Incident Commander | [Name] | [Phone] | [Email] | [Backup] |
    | Technical Lead | [Name] | [Phone] | [Email] | [Backup] |
    | Database Admin | [Name] | [Phone] | [Email] | [Backup] |
    | Security Lead | [Name] | [Phone] | [Email] | [Backup] |

    ## External Vendors
    - Cloudflare Support: support.cloudflare.com (Enterprise: phone support)
    - Anthropic Support: support@anthropic.com
    - AWS Support: [Account-specific]
    ```
  - Time: 2 hours

- [ ] **Add appendices**
  - API documentation links
  - Configuration file locations
  - Secrets management guide (Infisical)
  - Compliance documentation
  - Disaster recovery plan
  - Time: 2 hours

**Validation**:
- Runbook covers all major scenarios
- Accessible to entire team
- Tested by having someone follow procedures
- Kept up-to-date (assign owner)

---

### 2. Train Operations Team

**Time Estimate**: 1 week
**Cost**: $0 (internal) or $2,000-5,000 (external trainer)
**Prerequisites**: Runbook completed, access provisioned
**Purpose**: Ensure team can operate production system

#### Steps:

- [ ] **Identify training participants**
  - On-call engineers (required)
  - Support team (required)
  - Product managers (optional)
  - Time: 30 minutes

- [ ] **Create training agenda**
  - Day 1: System architecture overview
  - Day 2: Monitoring and alerting
  - Day 3: Common issues and troubleshooting
  - Day 4: Incident response procedures
  - Day 5: Hands-on exercises
  - Time: 2 hours

- [ ] **Prepare training materials**
  - Slide deck with architecture diagrams
  - Hands-on labs:
    - Lab 1: Accessing systems (SSH, Tailscale)
    - Lab 2: Checking logs in Grafana
    - Lab 3: Responding to an alert
    - Lab 4: Performing a deployment
    - Lab 5: Executing failover procedure
  - Quiz to verify understanding
  - Time: 12 hours

- [ ] **Conduct training sessions**
  - Week 1: In-person or virtual sessions (2 hours/day)
  - Hands-on labs (1 hour/day)
  - Q&A sessions
  - Time: 15 hours (trainer) + 15 hours per participant

- [ ] **Verify access for all participants**
  - SSH access to all PCs
  - Tailscale VPN access
  - Grafana dashboard access
  - Cloudflare account access (read-only)
  - Infisical access (read-only for on-call)
  - PagerDuty or alerting tool
  - Time: 2 hours

- [ ] **Conduct tabletop exercises**
  - Simulate realistic incidents:
    - Exercise 1: Database connection pool exhausted
    - Exercise 2: Worker PC crash
    - Exercise 3: API rate limit exceeded
    - Exercise 4: Security breach detected
  - Walk through incident response as a team
  - Identify gaps in knowledge or procedures
  - Time: 8 hours

- [ ] **Create training certification**
  - Administer quiz (passing score: 80%)
  - Document who completed training
  - Re-train annually or when significant changes occur
  - Time: 2 hours

**Validation**:
- All on-call engineers trained
- Tabletop exercises completed successfully
- Participants confident in procedures
- Training materials accessible for reference

---

### 3. Set Up On-Call Rotation

**Time Estimate**: 2-3 days
**Cost**: $29/month (PagerDuty) or $0 (DIY)
**Prerequisites**: Team trained, runbook ready
**Purpose**: 24/7 coverage for production incidents

#### Steps:

- [ ] **Choose alerting tool**
  - Options:
    - PagerDuty (industry standard, $29/user/month)
    - Opsgenie (Atlassian, similar pricing)
    - DIY (Grafana + Twilio SMS)
  - Decision: [Document choice]
  - Time: 1 hour

- [ ] **Configure PagerDuty (or alternative)**
  - Create account and service
  - Add users to team
  - Create escalation policies:
    - Level 1: Primary on-call (alert immediately)
    - Level 2: Secondary on-call (after 15 minutes)
    - Level 3: Manager (after 30 minutes)
  - Time: 2 hours

- [ ] **Integrate with monitoring**
  - Grafana → PagerDuty integration
  - Configure which alerts trigger pages:
    - Critical: Page immediately
    - High: Page after 5 minutes
    - Medium: Email only
    - Low: Dashboard only
  - Test integration (trigger test alert)
  - Time: 2 hours

- [ ] **Define on-call rotation**
  - Rotation type: Weekly (Monday-Monday)
  - Rotation schedule:
    ```
    Week 1: Engineer A (primary), Engineer B (secondary)
    Week 2: Engineer B (primary), Engineer C (secondary)
    Week 3: Engineer C (primary), Engineer A (secondary)
    ```
  - Configure in PagerDuty
  - Time: 1 hour

- [ ] **Set up compensation policy**
  - On-call pay: $X/week
  - Incident response pay: $Y/hour (off-hours only)
  - Document policy in employee handbook
  - Get HR/Finance approval
  - Time: 2 hours

- [ ] **Create on-call handbook**
  - Expectations:
    - Respond within 15 minutes
    - Have laptop and internet available
    - Escalate if unable to resolve in 1 hour
  - Procedures:
    - How to acknowledge alert
    - How to check system status
    - How to escalate
    - How to document resolution
  - Common commands cheat sheet
  - Time: 3 hours

- [ ] **Conduct shadow rotations**
  - Week 1: Primary with trainer shadowing
  - Week 2: Trainer with primary shadowing
  - Week 3: Solo rotation (trainer on standby)
  - Time: 3 weeks (low time commitment)

**Validation**:
- On-call schedule populated for next 3 months
- All participants acknowledge understanding
- Test pages successfully delivered
- Escalation working correctly

---

### 4. Configure Monitoring Alerts

**Time Estimate**: 2-3 days
**Cost**: Included in Grafana Cloud
**Prerequisites**: Baseline metrics established
**Purpose**: Proactive detection of issues

#### Steps:

- [ ] **Define alert priorities**
  - **P0 - Critical** (page immediately):
    - Service down (health check failing)
    - Error rate >5%
    - Database unreachable
  - **P1 - High** (page after 5 min):
    - API latency p95 >1000ms
    - GPU temperature >85°C
    - Disk space <10%
  - **P2 - Medium** (email):
    - Error rate >1%
    - CPU >80% for 10 minutes
    - Backup failed
  - **P3 - Low** (dashboard):
    - API latency p95 >500ms
    - Memory usage >70%
  - Time: 2 hours

- [ ] **Create Grafana alerts**
  - For each priority, configure alert rule:
    ```yaml
    # Example: High error rate alert
    - alert: HighErrorRate
      expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
      for: 5m
      labels:
        severity: critical
        priority: P0
      annotations:
        summary: "High error rate detected"
        description: "Error rate is {{ $value }}% (threshold: 5%)"
        runbook: "https://runbook.company.com/high-error-rate"
    ```
  - Test each alert (manually trigger threshold breach)
  - Time: 8 hours

- [ ] **Configure notification channels**
  - Critical alerts → PagerDuty
  - High alerts → PagerDuty (delayed)
  - Medium alerts → Email + Slack
  - Low alerts → Slack only
  - Set up Slack webhook integration
  - Time: 2 hours

- [ ] **Implement alert grouping**
  - Group related alerts (e.g., all Worker-01 alerts)
  - Prevent alert fatigue (max 1 page per 15 min)
  - Configure snooze/acknowledge functionality
  - Time: 2 hours

- [ ] **Add external monitoring**
  - Use Pingdom or UptimeRobot for external checks
  - Monitor from multiple locations (US-East, US-West, EU)
  - Check:
    - Website uptime (ratehunter.net)
    - API health endpoint (api.projectnyra.com/health)
  - Alert if down from 2+ locations
  - Time: 2 hours

- [ ] **Create alert runbooks**
  - For each alert, document:
    - What it means
    - Potential causes
    - Diagnostic steps
    - Resolution steps
    - How to silence if false positive
  - Link from alert annotations
  - Time: 8 hours

- [ ] **Test alert end-to-end**
  - Trigger each P0/P1 alert intentionally
  - Verify:
    - Alert fires correctly
    - Notification delivered (PagerDuty/email/Slack)
    - Runbook link works
    - Alert clears when issue resolved
  - Time: 4 hours

**Validation**:
- All critical alerts configured and tested
- Notification channels working
- Alert fatigue minimized
- Runbooks linked and accessible

---

### 5. Schedule Go-Live Date

**Time Estimate**: 1 week (coordination)
**Cost**: $0
**Prerequisites**: All previous tasks completed
**Purpose**: Coordinate launch activities

#### Steps:

- [ ] **Review go/no-go checklist**
  - Infrastructure:
    - ✓ All PCs operational
    - ✓ Network connectivity verified
    - ✓ GPU drivers and CUDA working
    - ✓ Tunnels and mesh network operational
  - Services:
    - ✓ All external services configured
    - ✓ API keys tested
    - ✓ Monitoring operational
  - Security:
    - ✓ BAAs executed
    - ✓ Encryption enabled
    - ✓ Pen test passed
  - Testing:
    - ✓ Load testing passed
    - ✓ UAT completed
    - ✓ Failover tested
  - Operations:
    - ✓ Team trained
    - ✓ On-call rotation set
    - ✓ Runbook completed
  - Time: 2 hours

- [ ] **Select go-live date**
  - Considerations:
    - Avoid Fridays (weekend recovery time)
    - Avoid holidays
    - Avoid end-of-month (mortgage industry busy)
    - Allow 2-week buffer for issues
  - Proposed date: [DATE]
  - Time: 30 minutes

- [ ] **Create go-live timeline**
  - T-7 days: Final testing, code freeze
  - T-3 days: Go/no-go decision meeting
  - T-1 day: Final deployment to production
  - T-0 (go-live): Monitor closely, all hands on deck
  - T+1 day: Post-launch review
  - T+7 days: Post-mortem and lessons learned
  - Time: 1 hour

- [ ] **Schedule go/no-go meeting**
  - Participants: Leadership, engineering leads, operations
  - Agenda:
    - Review checklist
    - Discuss any open issues
    - Make go/no-go decision
    - Confirm responsibilities
  - If "no-go": Identify blockers, reschedule
  - Time: 2 hours (meeting)

- [ ] **Prepare launch communications**
  - Internal announcement (to company)
  - External announcement (to customers/partners)
  - Press release (if applicable)
  - Social media posts
  - Blog post
  - Time: 4 hours

- [ ] **Plan launch activities**
  - Launch day schedule:
    - 9am: Final system checks
    - 10am: Flip DNS to production (if applicable)
    - 10am-12pm: Monitor dashboards intensively
    - 12pm: Launch announcement goes live
    - 2pm: Check-in meeting
    - 5pm: End-of-day review
  - Assign roles (who watches what)
  - War room (physical or Slack channel)
  - Time: 2 hours

- [ ] **Prepare rollback plan**
  - If critical issues discovered:
    - Revert DNS changes
    - Display maintenance page
    - Rollback to previous version
  - Decision criteria for rollback:
    - Error rate >10%
    - Security vulnerability discovered
    - Data loss detected
    - System unresponsive for >5 minutes
  - Time: 2 hours

**Validation**:
- Go-live date selected and communicated
- Go/no-go criteria clear
- Team aligned on timeline
- Communications prepared
- Rollback plan ready

---

### 6. Plan Rollback Strategy

**Time Estimate**: 2-3 days
**Cost**: $0
**Prerequisites**: Deployment procedures documented
**Purpose**: Quick recovery if launch fails

#### Steps:

- [ ] **Document rollback procedures**
  - Scenario 1: Frontend issues
    - Revert Cloudflare Pages to previous deployment
    - Via dashboard: Deployments → Select previous → Rollback
    - Or via CLI: `wrangler pages deployment rollback`
    - Time to rollback: <5 minutes
  - Scenario 2: Backend issues
    - SSH to Compute-01
    - Stop current service: `systemctl stop ratehunter-api`
    - Revert code: `git reset --hard <previous-commit>`
    - Start service: `systemctl start ratehunter-api`
    - Time to rollback: <10 minutes
  - Scenario 3: Database migration issues
    - Run migration rollback script
    - Restore from pre-migration backup if needed
    - Verify data integrity
    - Time to rollback: 15-30 minutes
  - Time: 4 hours (documentation)

- [ ] **Test rollback procedures**
  - In staging environment:
    - Deploy new version
    - Intentionally break something
    - Execute rollback
    - Verify system functional
  - Document actual time taken
  - Time: 3 hours

- [ ] **Create rollback checklist**
  - For each scenario:
    ```markdown
    ## Frontend Rollback Checklist

    - [ ] Verify issue severity (warrants rollback)
    - [ ] Get approval from incident commander
    - [ ] Announce rollback in war room
    - [ ] Execute rollback (Cloudflare Pages)
    - [ ] Verify rollback successful (test site)
    - [ ] Monitor for 15 minutes
    - [ ] Update status page
    - [ ] Document issue for post-mortem
    ```
  - Time: 2 hours

- [ ] **Establish decision criteria**
  - When to rollback:
    - Critical security vulnerability
    - Data loss or corruption
    - Error rate >10% for >5 minutes
    - System completely unresponsive
    - Unable to diagnose/fix within 30 minutes
  - When NOT to rollback:
    - Minor bugs (can be hot-fixed)
    - Performance degradation <20%
    - Issues affecting <5% of users
    - Cosmetic/UI issues
  - Time: 1 hour

- [ ] **Assign rollback authority**
  - Incident Commander: Authority to call rollback
  - Technical Lead: Authority to execute rollback
  - Document chain of command
  - Ensure 24/7 availability
  - Time: 1 hour

- [ ] **Prepare maintenance page**
  - Static HTML page:
    ```html
    <!DOCTYPE html>
    <html>
    <head>
      <title>RateHunter - Maintenance</title>
    </head>
    <body>
      <h1>We'll be right back</h1>
      <p>RateHunter is currently undergoing maintenance.</p>
      <p>We expect to be back online shortly.</p>
      <p>Thank you for your patience.</p>
    </body>
    </html>
    ```
  - Host on separate infrastructure (GitHub Pages, S3)
  - Test DNS cutover to maintenance page
  - Time: 2 hours

**Validation**:
- Rollback procedures documented and tested
- Decision criteria clear
- Authority assigned
- Maintenance page ready
- Entire team knows how to initiate rollback

---

## Summary - Go-Live Preparation

**Total Time**: 1-2 weeks
**Critical Path Items**:
1. Runbook creation and team training (Week 1)
2. On-call rotation and alerting (Week 1-2)
3. Go-live planning and rollback strategy (Week 2)

**Key Deliverables**:
- ✓ Production runbook completed
- ✓ Operations team trained
- ✓ On-call rotation established
- ✓ Monitoring alerts configured
- ✓ Go-live date scheduled
- ✓ Rollback strategy prepared

**Final Go/No-Go Checklist**:
- ✓ All infrastructure operational
- ✓ All external services configured
- ✓ Security and compliance requirements met
- ✓ Testing completed successfully
- ✓ Team trained and on-call rotation set
- ✓ Runbook and rollback procedures ready
- ✓ Monitoring and alerting operational

**Launch Day Protocol**:
1. 9:00 AM: Final system checks
2. 10:00 AM: GO-LIVE (if all checks pass)
3. 10:00 AM - 5:00 PM: Intensive monitoring
4. 5:00 PM: Day 1 review meeting
5. Day 2-7: Continued close monitoring
6. Day 7: Post-mortem and lessons learned

---

## Overall Project Timeline

**Total Estimated Time**: 6-8 weeks

| Week | Focus Areas | Key Milestones |
|------|-------------|----------------|
| 1-2 | Infrastructure Setup | Domain, Cloudflare, Tunnels configured |
| 3 | Hardware Configuration | All PCs operational with GPUs |
| 4-5 | External Services & Security | All services configured, BAAs executed |
| 6 | Security & Compliance | Encryption, audit logging, policies |
| 7-8 | Testing & Validation | Load testing, pen testing, UAT |
| 9 | Go-Live Preparation | Training, on-call, launch |
| 10 | **GO-LIVE** | Launch and intensive monitoring |

## Total Cost Estimate

### One-Time Costs
- Hardware/GPUs: $3,000-15,000 (if purchasing)
- Professional Services:
  - Penetration testing: $2,000-10,000
  - Compliance audit: $1,000-5,000
  - Legal review: $1,000-3,000
- **Total One-Time**: $4,000-33,000

### Monthly Recurring Costs
- Domain: $1-5
- Cloudflare: $20-200
- AI APIs: $100-500
- Email (SendGrid): $0-100
- SMS (Twilio): $2-50
- Monitoring (Grafana): $0-100
- PagerDuty: $29/user
- Secrets Management: $0-50
- **Total Monthly**: $150-1,000+

### Success Metrics

**Technical**:
- Uptime: 99.9% (8.76 hours downtime/year allowed)
- API latency p95: <500ms
- Error rate: <0.5%
- RTO: <30 minutes
- RPO: <24 hours

**Business**:
- User acquisition rate
- Quote completion rate
- Rate alert subscriptions
- Customer satisfaction score
- NPS >30

**Security**:
- Zero security breaches
- Compliance audits passed
- All vulnerabilities remediated within SLA
- No BAA violations

---

## Contact & Support

**Project Lead**: [Name, Email, Phone]
**Technical Lead**: [Name, Email, Phone]
**Security Lead**: [Name, Email, Phone]

**Document Version**: 1.0
**Last Updated**: 2026-01-21
**Next Review**: 2026-02-21

---

## Appendices

### Appendix A: Vendor Contacts
- Cloudflare: support.cloudflare.com
- Anthropic: support@anthropic.com
- SendGrid: support.sendgrid.com
- Twilio: support.twilio.com
- Grafana: support.grafana.com

### Appendix B: Regulatory References
- HIPAA Security Rule: hhs.gov/hipaa/for-professionals/security
- GLBA: ftc.gov/business-guidance/privacy-security/gramm-leach-bliley-act
- State Breach Notification Laws: [Link to reference]

### Appendix C: Tool Documentation
- Infisical: docs.infisical.com
- Cloudflare Tunnels: developers.cloudflare.com/cloudflare-one/connections/connect-apps
- Tailscale: tailscale.com/kb
- Grafana: grafana.com/docs

### Appendix D: Change Log
| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2026-01-21 | 1.0 | [Name] | Initial checklist creation |

---

**END OF DOCUMENT**
