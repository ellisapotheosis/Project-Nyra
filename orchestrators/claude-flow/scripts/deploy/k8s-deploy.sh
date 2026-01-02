#!/bin/bash
# Deploy Claude-Flow to Kubernetes
# Supports multiple environments and cloud providers

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENVIRONMENT="${1:-production}"
NAMESPACE="claude-flow-$ENVIRONMENT"

echo "☸️  Deploying Claude-Flow to Kubernetes"
echo "========================================"
echo "Environment: $ENVIRONMENT"
echo "Namespace: $NAMESPACE"
echo ""

# Verify kubectl is configured
if ! kubectl cluster-info &>/dev/null; then
    echo "❌ kubectl not configured or cluster not accessible"
    exit 1
fi

# Show cluster info
echo "📍 Target cluster:"
kubectl cluster-info | head -1

read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
fi

# Create namespace if it doesn't exist
echo "📁 Ensuring namespace exists..."
kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

# Apply ConfigMaps
echo "⚙️  Applying ConfigMaps..."
if [ -f "$PROJECT_ROOT/config/$ENVIRONMENT/k8s/configmap.yaml" ]; then
    kubectl apply -f "$PROJECT_ROOT/config/$ENVIRONMENT/k8s/configmap.yaml" -n "$NAMESPACE"
fi

# Apply Secrets
echo "🔐 Applying Secrets..."
if [ -f "$PROJECT_ROOT/config/$ENVIRONMENT/k8s/secrets.yaml" ]; then
    kubectl apply -f "$PROJECT_ROOT/config/$ENVIRONMENT/k8s/secrets.yaml" -n "$NAMESPACE"
else
    echo "⚠️  No secrets file found - ensure secrets are configured"
fi

# Apply PersistentVolumeClaims
echo "💾 Applying PersistentVolumeClaims..."
if [ -f "$PROJECT_ROOT/config/$ENVIRONMENT/k8s/pvc.yaml" ]; then
    kubectl apply -f "$PROJECT_ROOT/config/$ENVIRONMENT/k8s/pvc.yaml" -n "$NAMESPACE"
fi

# Apply Deployment
echo "🚀 Applying Deployment..."
kubectl apply -f "$PROJECT_ROOT/config/$ENVIRONMENT/k8s/deployment.yaml" -n "$NAMESPACE"

# Apply Service
echo "🌐 Applying Service..."
kubectl apply -f "$PROJECT_ROOT/config/$ENVIRONMENT/k8s/service.yaml" -n "$NAMESPACE"

# Apply Ingress
if [ -f "$PROJECT_ROOT/config/$ENVIRONMENT/k8s/ingress.yaml" ]; then
    echo "🔀 Applying Ingress..."
    kubectl apply -f "$PROJECT_ROOT/config/$ENVIRONMENT/k8s/ingress.yaml" -n "$NAMESPACE"
fi

# Apply HorizontalPodAutoscaler
if [ -f "$PROJECT_ROOT/config/$ENVIRONMENT/k8s/hpa.yaml" ]; then
    echo "📈 Applying HorizontalPodAutoscaler..."
    kubectl apply -f "$PROJECT_ROOT/config/$ENVIRONMENT/k8s/hpa.yaml" -n "$NAMESPACE"
fi

# Wait for rollout
echo "⏳ Waiting for deployment rollout..."
kubectl rollout status deployment/claude-flow -n "$NAMESPACE" --timeout=600s

# Show deployment status
echo ""
echo "📊 Deployment status:"
kubectl get all -n "$NAMESPACE"

# Show resource usage
echo ""
echo "💻 Resource usage:"
kubectl top pods -n "$NAMESPACE" 2>/dev/null || echo "Metrics server not available"

# Show endpoints
echo ""
echo "🌍 Endpoints:"
kubectl get ingress -n "$NAMESPACE" -o wide

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Useful commands:"
echo "  View pods:   kubectl get pods -n $NAMESPACE"
echo "  View logs:   kubectl logs -n $NAMESPACE -l app=claude-flow -f"
echo "  Exec shell:  kubectl exec -n $NAMESPACE -it <pod-name> -- /bin/sh"
echo "  Port forward: kubectl port-forward -n $NAMESPACE svc/claude-flow 3000:3000"
echo "  Rollback:    kubectl rollout undo deployment/claude-flow -n $NAMESPACE"
echo ""
