# CLAUDE.md Template - Infrastructure

Template for Kubernetes, Docker, and infrastructure-as-code management.

## Template Metadata
- Type: Infrastructure
- Complexity: Advanced
- Team Size: DevOps/Platform team (2-8)
- Architecture: Containerized, orchestrated
- Use Case: Cluster setup, service mesh, CI/CD infrastructure

## Template Content

```markdown
# Infrastructure Configuration - [Cluster/Environment Name]

## Infrastructure Overview

### Environment Details
- Environment: [Development/Staging/Production]
- Cloud Provider: [AWS/GCP/Azure/On-premises]
- Region(s): [regions]
- Cluster Type: [Kubernetes/Docker Swarm/ECS]
- Cluster Version: [version]

### Architecture
```
                 Internet
                    |
              Load Balancer
                    |
         +----------+----------+
         |          |          |
       Ingress   Ingress   Ingress
         |          |          |
    Service1    Service2   Service3
         |          |          |
    Pod Pool    Pod Pool   Pod Pool
         |          |          |
    Volume(s)  Volume(s)  Volume(s)
```

## Cluster Configuration

### Kubernetes Cluster
- Platform: [EKS/GKE/AKS/Self-managed]
- Version: [1.XX.X]
- Nodes:
  - Count: [min-max]
  - Instance type: [t3.large, n1-standard-4, etc]
  - Storage: [EBS/Persistent volumes]
  - Auto-scaling: [enabled/disabled]

### Node Pools
- System pool: [Reserved for system services]
- Application pool: [General workloads]
- GPU pool: [If needed for ML workloads]
- Spot instances: [Cost optimization]

## Networking

### Network Architecture
- VPC/Network: [CIDR ranges]
- Subnets: [Public/Private allocation]
- Security groups: [Firewall rules]
- DNS: [Route53/Cloud DNS/Custom]

### Service Communication
- Service mesh: [Istio/Linkerd/None]
- Network policies: [Calico/Cilium]
- Ingress controller: [NGINX/AWS ALB/GCP LB]
- Egress control: [Whitelist external services]

### Example Ingress Configuration
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: main-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - api.example.com
      secretName: api-tls
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api-service
                port:
                  number: 80
```

## Storage

### Persistent Volumes
- Storage class: [EBS GP3/GCP PD/Azure Managed]
- Provisioning: [Dynamic/Manual]
- Retention policy: [Delete/Retain]
- Backup strategy: [Snapshots/Backup service]

### Database Storage
- Dedicated storage: [Yes/No]
- Replication: [Across zones]
- Backup frequency: [Daily/Hourly]
- Recovery RTO: [Recovery Time Objective]
- Recovery RPO: [Recovery Point Objective]

### Configuration Management
- Tool: [Helm/Kustomize/Flux]
- Values stored in: [Git/Vault/ConfigMaps]
- Secrets management: [Sealed Secrets/Vault/Cloud Secrets]

## Database Infrastructure

### Database Type
- Primary: [PostgreSQL/MySQL/MongoDB]
- Version: [specific version]
- Scaling: [Read replicas/Sharding]
- HA Setup: [Master-Slave/Multi-master]

### Backup Strategy
```yaml
apiVersion: velero.io/v1
kind: Schedule
metadata:
  name: daily-backup
spec:
  schedule: "0 2 * * *"  # 2 AM daily
  template:
    ttl: "720h"          # 30 days
    storageLocation: aws-s3
    includeNamespaces:
      - production
```

### Disaster Recovery
- Backup location: [S3/GCS/Azure Blob]
- Backup frequency: [Daily + Hourly]
- Recovery testing: [Monthly]
- RTO target: [time]
- RPO target: [data loss tolerance]

## Monitoring & Observability

### Metrics Collection
- Tool: [Prometheus]
- Scrape interval: [30s]
- Retention: [15d]
- Alertmanager: [Configured]

### Logging
- Tool: [ELK/Loki/Datadog]
- Log levels: [DEBUG in dev, INFO in prod]
- Retention: [30d production, 7d dev]
- Log aggregation: [By pod, namespace, service]

### Tracing
- Tool: [Jaeger/Zipkin]
- Sample rate: [1% prod, 10% dev]
- Trace retention: [7d]

### Example Prometheus Configuration
```yaml
global:
  scrape_interval: 30s
  evaluation_interval: 30s

scrape_configs:
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
```

### Alerting Rules
```yaml
groups:
  - name: kubernetes
    rules:
      - alert: HighMemoryUsage
        expr: container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.9
        for: 5m
        labels:
          severity: warning
      - alert: PodRestartingFrequently
        expr: rate(kube_pod_container_status_restarts_total[15m]) > 0.1
        labels:
          severity: critical
```

## Security

### RBAC (Role-Based Access Control)
- Cluster admin: [Limited users]
- Namespace admin: [One per namespace]
- Read-only: [Developers in staging]
- Service accounts: [Minimal permissions]

### Pod Security Policies
- Privileged: [Disabled]
- Host networking: [Restricted]
- Root user: [Disabled unless required]
- Capabilities: [Dropped ALL]

### Secrets Management
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: database-credentials
type: Opaque
data:
  username: base64encoded_username
  password: base64encoded_password
---
apiVersion: v1
kind: Pod
metadata:
  name: myapp
spec:
  containers:
  - name: app
    env:
    - name: DB_USER
      valueFrom:
        secretKeyRef:
          name: database-credentials
          key: username
```

### Network Policies
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-external-egress
spec:
  podSelector: {}
  policyTypes:
    - Egress
  egress:
    - to:
        - namespaceSelector:
            matchLabels:
              name: kube-system
    - to:
        - podSelector: {}
      ports:
        - protocol: TCP
          port: 53
```

## CI/CD Infrastructure

### GitOps Setup
- Tool: [Flux/ArgoCD]
- Repository: [Git URL for configs]
- Sync policy: [Automatic/Manual]
- Notifications: [Slack/PagerDuty]

### Build Pipeline
- Builder: [GitHub Actions/GitLab CI/Jenkins]
- Registry: [Docker Hub/ECR/GCR]
- Image signing: [Enabled]
- SBOM generation: [Enabled]

### Deployment Process
1. Push to feature branch
2. CI runs tests, builds image
3. Create PR with deployment manifest
4. Code review approval
5. Merge to main
6. GitOps syncs to cluster
7. Verification and monitoring

## Scaling Configuration

### Horizontal Pod Autoscaling
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### Vertical Pod Autoscaling
- Tool: [VPA]
- Recommendation policy: [Off/DryRun/Recreate]
- Update mode: [Auto/Recreate]

### Cluster Autoscaling
- Min nodes: [number]
- Max nodes: [number]
- Scale-up threshold: [utilization %]
- Scale-down delay: [time]

## Disaster Recovery

### Backup Strategy
- What to backup: [Volumes, databases, configurations]
- Backup tool: [Velero/native snapshots]
- Schedule: [Daily + hourly snapshots]
- Storage location: [Separate region]

### Disaster Recovery Plan
1. Detect failure: [Monitoring alerts]
2. Communication: [Notify stakeholders]
3. Assessment: [Determine scope]
4. Recovery steps: [Prioritized]
5. Verification: [Health checks]
6. Post-incident: [Root cause analysis]

## Cost Optimization

### Resource Optimization
- Request/limit tuning: [Review quarterly]
- Reserved instances: [For stable workloads]
- Spot instances: [For batch/non-critical]
- Resource monitoring: [Regular audits]

### Cost Controls
- Budget alerts: [At 80% and 100%]
- Tagging strategy: [For cost allocation]
- Idle resource cleanup: [Automated]
- Reserved capacity: [Multi-year commitment]

## Maintenance

### Regular Maintenance Windows
- Schedule: [Monthly, 2 AM UTC]
- Duration: [2 hours]
- Services affected: [List]
- Communication: [Notification process]

### Update Process
- Kubernetes upgrades: [Minor version every quarter]
- Docker image base updates: [Monthly]
- Dependencies: [Weekly security patches]
- Testing: [Staging before production]

## Documentation

### Runbooks
- Cluster recovery: [link]
- Service remediation: [link]
- Scaling procedures: [link]
- Backup/restore: [link]

### Architecture Diagrams
- Network topology: [link]
- Data flow: [link]
- Deployment architecture: [link]

## Integration with Claude Flow V3

### Swarm Orchestration
- When to spawn agents: Deployment, incidents
- Agent types: DevOps, monitor, coordinator
- Topology: Hierarchical for orchestration
- Decision-making: Automated remediation

### Memory & Learning
- Store: Infrastructure patterns, failure modes
- Learn: Common issues, solutions
- Predict: Resource needs, bottlenecks
- Optimize: Recommendations for cost/performance

### Monitoring Integration
- Store metrics in memory
- Trigger agents on anomalies
- Automated remediation suggestions
- Post-incident learning

---
**Template Version**: 1.0
**Last Updated**: 2026-01-22
**Maintained By**: [DevOps/Platform Team]
```

## When to Use This Template

- Setting up Kubernetes clusters
- Configuring infrastructure-as-code
- Managing multi-environment deployments
- Implementing disaster recovery

## Customization Examples

**For AWS-specific setup**: Add IAM roles, security groups, VPC configuration

**For high-availability**: Add multi-region setup, failover configuration, disaster recovery procedures

**For cost optimization**: Add reserved instances, spot instance management, resource quotas

**For compliance**: Add audit logging, encryption at rest/in transit, data residency requirements

