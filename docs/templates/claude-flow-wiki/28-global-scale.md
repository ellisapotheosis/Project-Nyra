# CLAUDE.md Template: Global Scale Systems

**Specialization**: Multi-Region, Multi-Country
**Focus**: Global Availability & Compliance
**Goal**: <100ms Latency Worldwide
**Regions**: {{NUMBER_OF_REGIONS}}

## 🚨 AUTOMATIC SWARM ORCHESTRATION

```bash
npx @claude-flow/cli@latest swarm init --topology mesh --max-agents 12 --strategy specialized
```

## 🎯 Project Context

- **Primary Region**: {{PRIMARY_REGION}}
- **Deployment Regions**: {{REGIONS}}
- **Data Residency**: {{DATA_RESIDENCY_REQUIREMENTS}}
- **Compliance**: {{COMPLIANCE_REQUIREMENTS}}

## 🔧 Global Deployment Strategy

### Multi-Region Architecture
```
CDN Layer:
  - CloudFlare / Akamai
  - Edge caching
  - DDoS protection

Application Layer:
  - Regional servers (N. America, EU, APAC)
  - Load balancing
  - Auto-failover

Data Layer:
  - Multi-master replication
  - Read replicas per region
  - Data residency compliance
```

### Terraform Multi-Region
```hcl
provider "aws" {
  alias  = "us-east"
  region = "us-east-1"
}

provider "aws" {
  alias  = "eu-west"
  region = "eu-west-1"
}

resource "aws_s3_bucket" "app-us" {
  provider = aws.us-east
  bucket   = "app-us-data"
}

resource "aws_s3_bucket" "app-eu" {
  provider = aws.eu-west
  bucket   = "app-eu-data"
}
```

## 📊 Global Metrics

- Regions: {{NUM_REGIONS}}
- Average latency: <100ms
- Availability: 99.99%
- Data residency: {{RESIDENCY_COMPLIANCE}}

## 📋 Global Scale Checklist

- [ ] Multi-region architecture designed
- [ ] CDN configured
- [ ] Database replication set up
- [ ] DNS failover configured
- [ ] Compliance per region verified
- [ ] Disaster recovery across regions
- [ ] Global monitoring configured
- [ ] Performance testing per region

---

**Generated from**: claude-flow CLAUDE.md Global Scale Template
