# Cluster Setup - 4-PC Local LAN Infrastructure

## 🎯 INFRASTRUCTURE CONTEXT

**Purpose**: Multi-PC cluster configuration for Project Nyra providing distributed compute, local LLM hosting, and high-availability services across 4 machines (1 orchestrator mini + 3 GPU workers).

**Technology**: Tailscale VPN mesh, Docker Swarm/Kubernetes, Ansible, Shell scripts
**Template**: Infrastructure as Code (mesh topology - peer-to-peer cluster)

## 🚨 CRITICAL DEVELOPMENT RULES

### Infrastructure-as-Code Pattern
**MANDATORY**: All cluster changes must be version-controlled and idempotent:

```yaml
# ✅ CORRECT: Batch cluster configs in ONE message
[Single Message]:
  - Write("ansible/inventory.yml", clusterInventory)
  - Write("ansible/playbooks/setup-workers.yml", workerSetup)
  - Write("scripts/init-cluster.sh", initScript)
  - Write("docker/swarm-init.sh", swarmInit)
```

## 📊 CLUSTER ARCHITECTURE

### 4-PC Cluster Topology
```
Orchestrator Mini (orchestrator-mini.tail-net.ts.net)
├── Claude Flow (planning layer)
├── Archon OS (task execution)
├── Nexus Router (LLM gateway)
├── Letta Memory (8283)
└── Mem0 Memory (4321)

GPU Worker 1 (worker-5090.tail-net.ts.net)
├── RTX 5090 48GB VRAM
├── Ollama (DeepSeek-R1 236B, Qwen 2.5 72B)
├── Neo4j (graph database)
└── FalkorDB (graph database)

GPU Worker 2 (worker-3090.tail-net.ts.net)
├── RTX 3090 Ti 24GB VRAM
├── TwentyCRM (port 3000)
├── n8n (port 5678)
├── OpenClaw UI (port 3333)
└── Redis (port 6379)

GPU Worker 3 (worker-3060.tail-net.ts.net)
├── RTX 3060 12GB VRAM
├── Prometheus (port 9090)
├── Grafana (port 3005)
├── Loki (port 3100)
└── PostgreSQL (port 5432)
```

## 🐝 CLUSTER SETUP SWARM

### Agent Configuration
```yaml
topology: mesh  # Peer-to-peer cluster
maxAgents: 4
strategy: specialized
framework: ansible

agents:
  cluster_architect:
    role: Cluster Design & Planning
    focus: [network-topology, service-placement, failover-strategy]
    concurrent_tasks: [multiple-nodes, parallel-planning]

  ansible_engineer:
    role: Ansible Automation
    focus: [playbooks, roles, idempotent-configs]
    concurrent_tasks: [multiple-playbooks, parallel-execution]

  network_specialist:
    role: Tailscale VPN Setup
    focus: [vpn-mesh, dns-configuration, firewall-rules]
    concurrent_tasks: [multiple-nodes, parallel-connectivity]

  monitoring_engineer:
    role: Cluster Monitoring
    focus: [health-checks, resource-monitoring, alerting]
    concurrent_tasks: [multiple-metrics, parallel-collection]
```

## 🔧 ANSIBLE PATTERNS

### Cluster Inventory
```yaml
all:
  children:
    orchestrators:
      hosts:
        orchestrator-mini:
          ansible_host: orchestrator-mini.tail-net.ts.net
          role: orchestrator

    gpu_workers:
      hosts:
        worker-5090:
          ansible_host: worker-5090.tail-net.ts.net
          gpu: rtx_5090
          vram: 48gb
          role: llm_inference

        worker-3090:
          ansible_host: worker-3090.tail-net.ts.net
          gpu: rtx_3090_ti
          vram: 24gb
          role: application_services

        worker-3060:
          ansible_host: worker-3060.tail-net.ts.net
          gpu: rtx_3060
          vram: 12gb
          role: observability
```

### Worker Setup Playbook
```yaml
---
- name: Configure GPU Workers
  hosts: gpu_workers
  become: yes
  tasks:
    - name: Install Docker
      apt:
        name: docker.io
        state: present

    - name: Install NVIDIA Container Toolkit
      shell: |
        curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
        apt-get update
        apt-get install -y nvidia-container-toolkit

    - name: Configure Docker for NVIDIA
      copy:
        dest: /etc/docker/daemon.json
        content: |
          {
            "runtimes": {
              "nvidia": {
                "path": "nvidia-container-runtime",
                "runtimeArgs": []
              }
            }
          }

    - name: Restart Docker
      systemd:
        name: docker
        state: restarted

    - name: Join Docker Swarm
      shell: docker swarm join --token {{ swarm_token }} orchestrator-mini.tail-net.ts.net:2377
```

## 📈 PERFORMANCE TARGETS

- Cluster initialization: < 10 minutes
- Node failover time: < 30 seconds
- Network latency (Tailscale): < 10ms within LAN
- Service availability: > 99.5% uptime
- GPU utilization: > 70% average

---

**This cluster provides the compute backbone for Project Nyra, combining orchestration intelligence with distributed GPU power for local LLM inference. The Tailscale VPN mesh ensures secure, low-latency communication between all nodes.**
