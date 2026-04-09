# CLAUDE.md Template: Scalable Systems

**Specialization**: Scalability & Load Handling
**Focus**: Growing with Demand
**Goal**: Linear Cost Scaling
**Capacity**: 10x-100x Growth Ready

## 🚨 AUTOMATIC SWARM ORCHESTRATION

```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 10 --strategy specialized
```

## 🎯 Project Context

- **Current Users**: {{CURRENT_USERS}}
- **Target Users**: {{TARGET_USERS}}
- **Growth Rate**: {{GROWTH_RATE}}% per month
- **Peak Traffic**: {{PEAK_TRAFFIC}} req/sec

## 🔧 Scalability Strategies

### Horizontal Scaling
```
- Load balancing
- Service replication
- Database read replicas
- Cache distribution
- Message queues
```

### Vertical Scaling
```
- Resource allocation
- Connection pooling
- Memory optimization
- CPU efficiency
```

### Data Scaling
```
- Sharding strategy
- Partitioning
- Archive old data
- Data replication
```

## 🚀 Auto-Scaling Configuration

### Kubernetes HPA
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: app
  minReplicas: 3
  maxReplicas: 20
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

### AWS Auto Scaling
```terraform
resource "aws_autoscaling_group" "app" {
  min_size            = 3
  max_size            = 20
  desired_capacity    = 5
  launch_configuration = aws_launch_configuration.app.id

  tag {
    key                 = "Name"
    value               = "app-asg"
    propagate_launch_template = true
  }
}

resource "aws_autoscaling_policy" "scale_up" {
  scaling_adjustment          = 2
  adjustment_type             = "ChangeInCapacity"
  autoscaling_group_name      = aws_autoscaling_group.app.name
  estimated_warmup            = 300
}
```

## 📊 Scalability Metrics

- Current capacity: {{CURRENT_CAPACITY}} users
- Scaling efficiency: {{EFFICIENCY_RATIO}}
- Cost per user: ${{COST_PER_USER}}
- Growth headroom: {{MONTHS_OF_CAPACITY}} months

## 📋 Scalability Checklist

- [ ] Architecture supports horizontal scaling
- [ ] Load balancing configured
- [ ] Database scaling strategy
- [ ] Caching layer implemented
- [ ] Auto-scaling policies configured
- [ ] Load testing passed (10x+ capacity)
- [ ] Monitoring and alerting configured
- [ ] Disaster recovery plan

---

**Generated from**: claude-flow CLAUDE.md Scalability Template
