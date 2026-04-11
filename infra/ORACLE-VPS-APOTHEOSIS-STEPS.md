# Oracle VPS Setup Guide: NyraGrid Command Center

This guide provides step-by-step instructions for setting up your Oracle Cloud Infrastructure (OCI) VPS as the primary host for the **NyraGrid Memory System (Mem0 + FalkorDB)** and other latency-insensitive services.

## Phase 1: OCI Console (Before Launch)

1.  **Select Shape:** 
    *   **Image:** Ubuntu 22.04 LTS (Canonical-Ubuntu-22.04-2023.x.x)
    *   **Shape:** VM.Standard.A1.Flex (ARM-based)
    *   **OCPUs:** 4
    *   **RAM:** 24 GB
2.  **Networking:**
    *   Assign a public IPv4 address.
    *   Ensure the VCN has an **Ingress Rule** in the Default Security List for:
        *   `0.0.0.0/0`, TCP Port `22` (SSH)
        *   `0.0.0.0/0`, UDP Port `41641` (Optional, for Tailscale performance)
3.  **SSH Key:**
    *   Download your private key (`.key` or `.pem`) and keep it secure.
4.  **Create Instance:** Click **Create** and wait for the "Running" status.

---

## Phase 2: Initial Access & Security

1.  **Connect via SSH:**
    ```bash
    chmod 400 <your-key>.key
    ssh -i <your-key>.key ubuntu@<vps-public-ip>
    ```
2.  **Update System:**
    ```bash
    sudo apt update && sudo apt upgrade -y
    ```
3.  **Disable Oracle Firewall (Optional but Recommended for Docker/Tailscale):**
    OCI instances come with strict `iptables` by default.
    ```bash
    sudo iptables -F
    sudo netfilter-persistent save
    ```

---

## Phase 3: Tailscale Integration (The Virtual Backbone)

Tailscale allows your Oracle VPS to communicate with your Orchestrator NUC securely as if they were on the same local network.

1.  **Install Tailscale:**
    ```bash
    curl -fsSL https://tailscale.com/install.sh | sh
    ```
2.  **Authenticate:**
    ```bash
    sudo tailscale up --authkey=<your-ts-auth-key> # Or just run 'sudo tailscale up' and follow the link
    ```
3.  **Verify Connection:**
    ```bash
    tailscale ip -4
    # Ensure you can ping the orchestrator
    ping orchestrator.trex-fiordland.ts.net
    ```

---

## Phase 4: Docker & Environment Setup

1.  **Install Docker & Compose:**
    ```bash
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    # Log out and back in for group changes to take effect
    ```
2.  **Directory Structure:**
    ```bash
    mkdir -p ~/repos/project-nyra
    cd ~/repos/project-nyra
    ```

---

## Phase 5: Deploying Mem0 + FalkorDB

1.  **Clone the Repo (or specific folders):**
    ```bash
    git clone https://github.com/ellisapotheosis/Project-Nyra.git .
    ```
2.  **Configure Environment Variables:**
    Create a `.env` file in `infra/oracle/`:
    ```bash
    cat <<EOF > infra/oracle/.env
    POSTGRES_PASSWORD=your_secure_password
    LITELLM_MASTER_KEY=your_litellm_key
    OPENAI_API_KEY=your_openai_key
    GRAFANA_ADMIN_PASSWORD=your_grafana_password
    EOF
    ```
3.  **Launch the Stack:**
    ```bash
    cd infra/oracle
    docker compose -f docker-compose.oracle.yml up -d --build
    ```

---

## Phase 6: Verification

1.  **Check Containers:**
    ```bash
    docker ps
    # You should see nyra-falkordb and nyra-mem0-rest running
    ```
2.  **Test Mem0 API:**
    ```bash
    curl http://localhost:5000/health
    # Expected: {"status": "healthy", "backend": "falkordb", ...}
    ```
3.  **Nexus Router Sync:**
    From your **Orchestrator NUC**, verify that Nexus can see the Oracle services:
    ```bash
    curl http://localhost:6000/health
    ```

---

### Hardware Check (Oracle VPS vs Orchestrator)
*   **Oracle VPS (Selected):** 4 OCPUs, 24GB RAM. This is the **Primary Memory Host**. It handles FalkorDB (Graph Store), Mem0 (REST API), and long-term analytics.
*   **Orchestrator NUC:** 16GB RAM. Remains the **Traffic Controller**. It handles LiteLLM (Routing), Nexus (MCP Hub), and local execution agents.

This topology maximizes the Oracle VPS's superior RAM for memory-heavy graph operations while keeping the Orchestrator focused on low-latency tool execution and local coordination.
