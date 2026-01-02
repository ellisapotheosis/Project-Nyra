#!/bin/bash
# Deploy Claude-Flow to Kind (Kubernetes in Docker)
# For local Kubernetes testing

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENVIRONMENT="${1:-development}"
CLUSTER_NAME="claude-flow-$ENVIRONMENT"

echo "☸️  Deploying Claude-Flow to Kind"
echo "=================================="
echo "Environment: $ENVIRONMENT"
echo "Cluster: $CLUSTER_NAME"
echo ""

# Check if Kind is installed
if ! command -v kind &>/dev/null; then
    echo "❌ Kind not installed"
    echo "Install: https://kind.sigs.k8s.io/docs/user/quick-start/#installation"
    exit 1
fi

# Check if cluster exists
if kind get clusters | grep -q "^$CLUSTER_NAME$"; then
    echo "ℹ️  Cluster '$CLUSTER_NAME' already exists"
    read -p "Delete and recreate? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Deleting existing cluster..."
        kind delete cluster --name "$CLUSTER_NAME"
    else
        echo "Using existing cluster"
    fi
fi

# Create Kind cluster if needed
if ! kind get clusters | grep -q "^$CLUSTER_NAME$"; then
    echo "🚀 Creating Kind cluster..."
    cat <<EOF | kind create cluster --name "$CLUSTER_NAME" --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
    kubeadmConfigPatches:
      - |
        kind: InitConfiguration
        nodeRegistration:
          kubeletExtraArgs:
            node-labels: "ingress-ready=true"
    extraPortMappings:
      - containerPort: 80
        hostPort: 80
        protocol: TCP
      - containerPort: 443
        hostPort: 443
        protocol: TCP
      - containerPort: 3000
        hostPort: 3000
        protocol: TCP
  - role: worker
  - role: worker
EOF
    echo "✓ Cluster created"
fi

# Set kubectl context
echo "⚙️  Configuring kubectl context..."
kubectl cluster-info --context "kind-$CLUSTER_NAME"

# Build and load image
echo "📦 Building and loading Docker image..."
IMAGE_NAME="claude-flow:$ENVIRONMENT"
docker build -t "$IMAGE_NAME" \
    --build-arg NODE_ENV="$ENVIRONMENT" \
    -f "$PROJECT_ROOT/Dockerfile" \
    "$PROJECT_ROOT"

kind load docker-image "$IMAGE_NAME" --name "$CLUSTER_NAME"
echo "✓ Image loaded into cluster"

# Create namespace
echo "📁 Creating namespace..."
kubectl create namespace "claude-flow-$ENVIRONMENT" --dry-run=client -o yaml | kubectl apply -f -

# Apply Kubernetes manifests
echo "☸️  Applying Kubernetes manifests..."
kubectl apply -f "$PROJECT_ROOT/config/$ENVIRONMENT/k8s/" -n "claude-flow-$ENVIRONMENT"

# Wait for deployment
echo "⏳ Waiting for deployment to be ready..."
kubectl rollout status deployment/claude-flow -n "claude-flow-$ENVIRONMENT" --timeout=300s

# Show status
echo ""
echo "📊 Deployment status:"
kubectl get all -n "claude-flow-$ENVIRONMENT"

# Port forward
echo ""
echo "✅ Deployment complete!"
echo ""
echo "Access the application:"
echo "  kubectl port-forward -n claude-flow-$ENVIRONMENT svc/claude-flow 3000:3000"
echo ""
echo "View logs:"
echo "  kubectl logs -n claude-flow-$ENVIRONMENT -l app=claude-flow -f"
echo ""
echo "Delete cluster:"
echo "  kind delete cluster --name $CLUSTER_NAME"
echo ""
