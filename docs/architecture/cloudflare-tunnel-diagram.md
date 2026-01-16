# Cloudflare Tunnel Architecture Diagrams

**Version:** 1.0.0
**Last Updated:** 2026-01-15

---

## 1. High-Level Network Architecture

```mermaid
graph TB
    subgraph "Internet"
        Users[Users/Clients]
    end

    subgraph "Cloudflare Global Network"
        CF[Cloudflare Edge<br/>DDoS Protection<br/>WAF + Rate Limiting<br/>TLS 1.3]
        Access[Cloudflare Access<br/>SSO + MFA<br/>Device Posture]
    end

    subgraph "Home Network 10.0.0.0/24"
        subgraph "Orchestrator 10.0.0.1"
            CFD1[cloudflared<br/>Primary Tunnel]
            CFD1B[cloudflared<br/>Backup Tunnel]
            Docker[Docker Services<br/>40+ Containers]
        end

        subgraph "Worker RTX5090 10.0.0.2"
            CFD2[cloudflared<br/>Dev Tunnel]
            Dev2[Dev Services<br/>Jupyter, Ollama, VS Code]
        end

        subgraph "Worker RTX3060 10.0.0.3"
            CFD3[cloudflared<br/>Dev Tunnel]
            Dev3[Dev Services<br/>Jupyter, Ollama, VS Code]
        end

        subgraph "Worker RTX3090Ti 10.0.0.4"
            CFD4[cloudflared<br/>On-Demand Tunnel]
            Compute[Compute Services<br/>TensorBoard, Training]
        end
    end

    Users --> CF
    CF --> Access
    Access --> CFD1
    Access --> CFD1B
    Access --> CFD2
    Access --> CFD3
    Access --> CFD4

    CFD1 --> Docker
    CFD1B --> Docker
    CFD2 --> Dev2
    CFD3 --> Dev3
    CFD4 --> Compute

    style CF fill:#f96,stroke:#333,stroke-width:2px
    style Access fill:#6cf,stroke:#333,stroke-width:2px
    style CFD1 fill:#9f6,stroke:#333,stroke-width:2px
    style CFD1B fill:#9f6,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
    style Docker fill:#fc9,stroke:#333,stroke-width:2px
```

---

## 2. Orchestrator Service Mapping

```mermaid
graph LR
    subgraph "Cloudflare DNS"
        API[api.nyra.yourdomain.com]
        GRAF[grafana.nyra.yourdomain.com]
        SEC[secrets.nyra.yourdomain.com]
        NEX[nexus.nyra.yourdomain.com]
        PROM[prometheus.nyra.yourdomain.com]
        ADMIN[admin.nyra.yourdomain.com]
        CRM[crm.nyra.yourdomain.com]
    end

    subgraph "cloudflared Tunnel"
        Tunnel[nyra-prod-orchestrator<br/>QUIC/HTTP2 Encrypted]
    end

    subgraph "Docker Services"
        APIG[API Gateway<br/>:3000]
        GRAFS[Grafana<br/>:3003]
        INFIS[Infisical<br/>:8080]
        NEXUSS[Nexus Router<br/>:8888]
        PROMS[Prometheus<br/>:9090]
        ADMINS[Admin Dashboard<br/>:3002]
        CRMS[CRM Dashboard<br/>:3004]
    end

    API --> Tunnel
    GRAF --> Tunnel
    SEC --> Tunnel
    NEX --> Tunnel
    PROM --> Tunnel
    ADMIN --> Tunnel
    CRM --> Tunnel

    Tunnel --> APIG
    Tunnel --> GRAFS
    Tunnel --> INFIS
    Tunnel --> NEXUSS
    Tunnel --> PROMS
    Tunnel --> ADMINS
    Tunnel --> CRMS

    style Tunnel fill:#9f6,stroke:#333,stroke-width:3px
```

---

## 3. Worker Service Mapping

```mermaid
graph TB
    subgraph "Cloudflare DNS"
        JUP5090[jupyter-rtx5090.nyra.yourdomain.com]
        OLL5090[ollama-rtx5090.nyra.yourdomain.com]
        TXT5090[textgen-rtx5090.nyra.yourdomain.com]
        CODE5090[code-rtx5090.nyra.yourdomain.com]
    end

    subgraph "cloudflared Tunnel"
        Tunnel5090[nyra-dev-worker-rtx5090]
    end

    subgraph "Worker Services (10.0.0.2)"
        JUPS[Jupyter Lab<br/>:8888]
        OLLS[Ollama UI<br/>:11434]
        TXTS[Text Gen WebUI<br/>:7860]
        CODES[VS Code Server<br/>:8443]
    end

    JUP5090 --> Tunnel5090
    OLL5090 --> Tunnel5090
    TXT5090 --> Tunnel5090
    CODE5090 --> Tunnel5090

    Tunnel5090 --> JUPS
    Tunnel5090 --> OLLS
    Tunnel5090 --> TXTS
    Tunnel5090 --> CODES

    style Tunnel5090 fill:#9f6,stroke:#333,stroke-width:3px
```

---

## 4. Security Layers

```mermaid
graph TD
    A[User Request] --> B{Cloudflare WAF}
    B -->|Blocked| X1[403 Forbidden]
    B -->|Allowed| C{Rate Limiting}
    C -->|Exceeded| X2[429 Too Many Requests]
    C -->|Within Limits| D{Cloudflare Access}
    D -->|No Auth Required| E[Public Service]
    D -->|Team Auth| F{Email Domain Check}
    D -->|Admin Auth| G{MFA Required}
    F -->|Invalid| X3[401 Unauthorized]
    F -->|Valid| H[Team Service]
    G -->|Invalid| X4[401 Unauthorized + MFA]
    G -->|Valid| I[Admin Service]
    E --> J{Application Auth}
    H --> J
    I --> J
    J -->|JWT/API Key| K[Service Access Granted]
    J -->|Invalid| X5[401 Unauthorized]

    style B fill:#f96,stroke:#333,stroke-width:2px
    style C fill:#f96,stroke:#333,stroke-width:2px
    style D fill:#6cf,stroke:#333,stroke-width:2px
    style J fill:#fc9,stroke:#333,stroke-width:2px
    style K fill:#9f6,stroke:#333,stroke-width:2px
```

---

## 5. Tunnel Failover Flow

```mermaid
sequenceDiagram
    participant User
    participant Cloudflare
    participant Primary as Primary Tunnel<br/>(nyra-prod-orchestrator)
    participant Backup as Backup Tunnel<br/>(nyra-prod-orchestrator-backup)
    participant Docker as Docker Services

    User->>Cloudflare: HTTPS Request
    Cloudflare->>Primary: Forward via QUIC

    alt Primary Tunnel Healthy
        Primary->>Docker: HTTP Request
        Docker-->>Primary: HTTP Response
        Primary-->>Cloudflare: Response
        Cloudflare-->>User: HTTPS Response
    else Primary Tunnel Down
        Primary--xCloudflare: Timeout (3 failures)
        Note over Cloudflare: Automatic Failover<br/>(< 5 seconds)
        Cloudflare->>Backup: Forward via QUIC
        Backup->>Docker: HTTP Request
        Docker-->>Backup: HTTP Response
        Backup-->>Cloudflare: Response
        Cloudflare-->>User: HTTPS Response
        Note over Cloudflare: Alert Sent to Ops
    end
```

---

## 6. Access Policy Matrix

```mermaid
graph TB
    subgraph "Public Access (No Auth)"
        PUB1[ratehunter.nyra.yourdomain.com]
        PUB2[api.nyra.yourdomain.com]
        style PUB1 fill:#9f9,stroke:#333
        style PUB2 fill:#9f9,stroke:#333
    end

    subgraph "Team Access (Email + Optional MFA)"
        TEAM1[grafana.nyra.yourdomain.com]
        TEAM2[crm.nyra.yourdomain.com]
        TEAM3[claude-flow.nyra.yourdomain.com]
        TEAM4[jupyter-*.nyra.yourdomain.com]
        TEAM5[ollama-*.nyra.yourdomain.com]
        style TEAM1 fill:#9cf,stroke:#333
        style TEAM2 fill:#9cf,stroke:#333
        style TEAM3 fill:#9cf,stroke:#333
        style TEAM4 fill:#9cf,stroke:#333
        style TEAM5 fill:#9cf,stroke:#333
    end

    subgraph "Admin Access (Email + MFA Required)"
        ADM1[secrets.nyra.yourdomain.com]
        ADM2[admin-api.nyra.yourdomain.com]
        ADM3[pgadmin.nyra.yourdomain.com]
        ADM4[prometheus.nyra.yourdomain.com]
        style ADM1 fill:#f99,stroke:#333
        style ADM2 fill:#f99,stroke:#333
        style ADM3 fill:#f99,stroke:#333
        style ADM4 fill:#f99,stroke:#333
    end

    subgraph "Internal Access (Service Token)"
        INT1[mcp.nyra.yourdomain.com]
        style INT1 fill:#ccc,stroke:#333
    end

    PUB1 -.-> |No Auth| Allow1[✅ Allow]
    TEAM1 -.-> |@yourcompany.com| Allow2[✅ Allow]
    ADM1 -.-> |@yourcompany.com<br/>+ MFA| Allow3[✅ Allow]
    INT1 -.-> |Service Token| Allow4[✅ Allow]
```

---

## 7. DNS Resolution Flow

```mermaid
graph LR
    A[User Browser] --> B[DNS Query:<br/>api.nyra.yourdomain.com]
    B --> C[Cloudflare DNS<br/>Authoritative Server]
    C --> D[CNAME Record:<br/>&lt;tunnel-id&gt;.cfargotunnel.com]
    D --> E[Cloudflare Edge<br/>Anycast Network]
    E --> F[Cloudflare Tunnel<br/>QUIC Connection]
    F --> G[cloudflared<br/>on Orchestrator]
    G --> H[Docker Service<br/>localhost:3000]

    style C fill:#f96,stroke:#333,stroke-width:2px
    style E fill:#f96,stroke:#333,stroke-width:2px
    style G fill:#9f6,stroke:#333,stroke-width:2px
    style H fill:#fc9,stroke:#333,stroke-width:2px
```

---

## 8. Monitoring & Alerting Flow

```mermaid
graph TB
    subgraph "Cloudflare Tunnels"
        T1[Orchestrator Tunnel<br/>:2000/metrics]
        T2[RTX5090 Tunnel<br/>:2000/metrics]
        T3[RTX3060 Tunnel<br/>:2000/metrics]
    end

    subgraph "Monitoring Stack"
        PROM[Prometheus<br/>Scrape Every 15s]
        GRAF[Grafana<br/>Visualizations]
        ALERT[AlertManager<br/>Alert Routing]
    end

    subgraph "Alert Channels"
        SLACK[Slack #ops]
        PAGER[PagerDuty]
        EMAIL[Email]
    end

    T1 --> PROM
    T2 --> PROM
    T3 --> PROM

    PROM --> GRAF
    PROM --> ALERT

    ALERT --> SLACK
    ALERT --> PAGER
    ALERT --> EMAIL

    style PROM fill:#fc9,stroke:#333,stroke-width:2px
    style GRAF fill:#f96,stroke:#333,stroke-width:2px
    style ALERT fill:#f66,stroke:#333,stroke-width:2px
```

---

## 9. Deployment Timeline

```mermaid
gantt
    title Cloudflare Tunnel Implementation Timeline
    dateFormat YYYY-MM-DD
    section Phase 1: Orchestrator
    Install cloudflared           :2026-01-16, 1d
    Create primary tunnel         :2026-01-16, 1d
    Configure ingress rules       :2026-01-17, 1d
    Route DNS records             :2026-01-17, 1d
    Test services                 :2026-01-18, 1d

    section Phase 2: Workers
    Setup RTX5090 tunnel          :2026-01-18, 1d
    Setup RTX3060 tunnel          :2026-01-19, 1d
    Setup RTX3090Ti tunnel        :2026-01-20, 1d

    section Phase 3: Security
    Configure Access policies     :2026-01-21, 2d
    Setup WAF rules               :2026-01-22, 1d
    Enable rate limiting          :2026-01-23, 1d

    section Phase 4: Monitoring
    Add Prometheus scraping       :2026-01-23, 1d
    Create Grafana dashboards     :2026-01-24, 1d
    Configure AlertManager        :2026-01-24, 1d

    section Phase 5: HA
    Create backup tunnel          :2026-01-25, 1d
    Configure load balancing      :2026-01-25, 1d
    Test failover                 :2026-01-26, 1d
```

---

## 10. Cost Comparison

```mermaid
graph LR
    subgraph "Traditional VPN Setup"
        VPN[VPN Server<br/>$20/month]
        IP[Static IP<br/>$10/month]
        LIC[VPN Licenses<br/>$15/user x 5<br/>$75/month]
        TOTAL1[Total:<br/>$105/month]
    end

    subgraph "Cloudflare Tunnel Setup"
        TEAM[Teams Plan<br/>$7/user x 5<br/>$35/month]
        LB[Load Balancer<br/>$15/month<br/>(optional)]
        TOTAL2[Total:<br/>$50/month]
    end

    VPN --> TOTAL1
    IP --> TOTAL1
    LIC --> TOTAL1

    TEAM --> TOTAL2
    LB --> TOTAL2

    TOTAL1 -.->|Savings| SAV[$55/month<br/>$660/year]

    style TOTAL1 fill:#f99,stroke:#333,stroke-width:2px
    style TOTAL2 fill:#9f9,stroke:#333,stroke-width:2px
    style SAV fill:#6cf,stroke:#333,stroke-width:3px
```

---

## 11. Service Dependencies

```mermaid
graph TB
    subgraph "Layer 1: Infrastructure"
        WSL[WSL2 Ubuntu]
        Docker[Docker Desktop]
    end

    subgraph "Layer 2: Tunnel"
        CFD[cloudflared<br/>Tunnel Agent]
        CERT[Cloudflare<br/>Certificate]
    end

    subgraph "Layer 3: Services"
        API[API Gateway]
        GRAF[Grafana]
        INFIS[Infisical]
        DB[PostgreSQL]
        CACHE[Redis]
    end

    subgraph "Layer 4: External"
        CF[Cloudflare<br/>Global Network]
        DNS[DNS<br/>Resolution]
        ACCESS[Cloudflare<br/>Access]
    end

    WSL --> Docker
    Docker --> API
    Docker --> GRAF
    Docker --> INFIS
    Docker --> DB
    Docker --> CACHE

    CERT --> CFD
    CFD --> API
    CFD --> GRAF
    CFD --> INFIS

    CFD --> CF
    CF --> DNS
    CF --> ACCESS

    style CFD fill:#9f6,stroke:#333,stroke-width:3px
    style CF fill:#f96,stroke:#333,stroke-width:2px
```

---

## 12. Disaster Recovery Flow

```mermaid
graph TB
    A[Disaster Event] --> B{Type?}

    B -->|Tunnel Down| C[Automatic Failover<br/>to Backup Tunnel<br/>RTO: 5s]
    B -->|Orchestrator PC Offline| D[Manual Recovery<br/>RTO: 15 min]
    B -->|Configuration Loss| E[Restore from Backup<br/>RTO: 30 min]
    B -->|Network Outage| F[Wait for Network<br/>Services Auto-Resume]

    C --> G[Alert Ops Team]
    D --> H[Boot Orchestrator]
    E --> I[Restore from S3/Infisical]
    F --> G

    H --> J[Restore Docker Services]
    I --> K[Restore Tunnel Config]
    J --> L[Start Tunnels]
    K --> L
    L --> M[Verify Connectivity]
    M --> N[Services Restored]

    G --> O[Investigate Root Cause]

    style C fill:#9f6,stroke:#333,stroke-width:2px
    style D fill:#fc9,stroke:#333,stroke-width:2px
    style E fill:#fc9,stroke:#333,stroke-width:2px
    style N fill:#9f6,stroke:#333,stroke-width:2px
```

---

## Legend

| Color | Meaning |
|-------|---------|
| 🟩 Green | Active/Healthy/Production |
| 🟦 Blue | Security/Authentication |
| 🟧 Orange | Service/Application |
| 🟥 Red | Alert/Admin/Critical |
| ⬜ Gray | Internal/Private |
| - - - Dashed | Backup/Standby |

---

**See Also:**
- [Full Architecture Document](./cloudflare-tunnel-architecture.md)
- [Quick Start Guide](../deployment/CLOUDFLARE-TUNNEL-QUICK-START.md)
- [Setup Scripts](../../scripts/cloudflared/)

---

**Document Status:** ✅ Ready for Review
**Next Review:** 2026-04-15
