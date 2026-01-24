#!/bin/bash
# Quick start script for embedding services
# Usage: ./start-embeddings.sh [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default configuration
ENV_FILE=".env.embeddings"
COMPOSE_FILE="docker-compose.embeddings.yml"
WAIT_TIME=90

# Parse command line arguments
FORCE_REBUILD=false
SKIP_HEALTH_CHECK=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --rebuild)
      FORCE_REBUILD=true
      shift
      ;;
    --skip-health)
      SKIP_HEALTH_CHECK=true
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    --help)
      echo "Usage: $0 [options]"
      echo "Options:"
      echo "  --rebuild        Force rebuild of Docker images"
      echo "  --skip-health    Skip health check verification"
      echo "  --verbose        Enable verbose output"
      echo "  --help           Show this help message"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

# Helper functions
log_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
  log_info "Checking prerequisites..."

  # Check Docker
  if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed"
    exit 1
  fi

  # Check Docker Compose
  if ! docker compose version &> /dev/null; then
    log_error "Docker Compose is not installed"
    exit 1
  fi

  # Check NVIDIA GPU (for ONNX)
  if ! nvidia-smi &> /dev/null; then
    log_warn "NVIDIA GPU not detected. ONNX Runtime will fail."
    log_warn "Xenova/Transformers will still work (CPU-based)."
  else
    log_info "NVIDIA GPU detected: $(nvidia-smi --query-gpu=name --format=csv,noheader)"
  fi

  # Check NVIDIA Container Toolkit
  if ! docker run --rm --gpus all nvidia/cuda:12.3.0-base-ubuntu22.04 nvidia-smi &> /dev/null; then
    log_warn "NVIDIA Container Toolkit not configured properly"
    log_warn "ONNX Runtime GPU acceleration will not work"
  fi
}

# Check environment file
check_environment() {
  if [ ! -f "$ENV_FILE" ]; then
    log_warn "Environment file not found: $ENV_FILE"

    if [ -f ".env.embeddings.example" ]; then
      log_info "Copying from .env.embeddings.example..."
      cp .env.embeddings.example "$ENV_FILE"
      log_info "Created $ENV_FILE - please review and customize"
    else
      log_error "No environment template found"
      exit 1
    fi
  fi
}

# Start services
start_services() {
  log_info "Starting embedding services..."

  if [ "$FORCE_REBUILD" = true ]; then
    log_info "Rebuilding images..."
    docker compose -f "$COMPOSE_FILE" build --no-cache
  fi

  if [ "$VERBOSE" = true ]; then
    docker compose -f "$COMPOSE_FILE" up -d
  else
    docker compose -f "$COMPOSE_FILE" up -d > /dev/null 2>&1
  fi

  log_info "Services started successfully"
}

# Wait for services
wait_for_services() {
  if [ "$SKIP_HEALTH_CHECK" = true ]; then
    log_info "Skipping health checks"
    return
  fi

  log_info "Waiting for services to initialize ($WAIT_TIME seconds)..."
  log_info "Note: First startup may take longer due to model downloads"

  sleep $WAIT_TIME

  # Check ONNX Runtime health
  log_info "Checking ONNX Runtime health..."
  if curl -sf http://localhost:8001/health > /dev/null; then
    log_info "✓ ONNX Runtime is healthy"

    # Show GPU info
    GPU_INFO=$(curl -s http://localhost:8001/health | grep -o '"device":"[^"]*"' | cut -d'"' -f4)
    log_info "  Device: $GPU_INFO"
  else
    log_warn "✗ ONNX Runtime health check failed"
  fi

  # Check Xenova health
  log_info "Checking Xenova/Transformers health..."
  if curl -sf http://localhost:8002/health > /dev/null; then
    log_info "✓ Xenova/Transformers is healthy"

    # Show model info
    MODEL_INFO=$(curl -s http://localhost:8002/health | grep -o '"model":"[^"]*"' | cut -d'"' -f4)
    log_info "  Model: $MODEL_INFO"
  else
    log_warn "✗ Xenova/Transformers health check failed"
    log_warn "  This may be normal during initial model download"
    log_warn "  Check logs: docker logs nyra-xenova-embeddings"
  fi
}

# Show status
show_status() {
  log_info "Service status:"
  docker compose -f "$COMPOSE_FILE" ps

  echo ""
  log_info "Service URLs:"
  echo "  ONNX Runtime:         http://localhost:8001"
  echo "  Xenova/Transformers:  http://localhost:8002"

  echo ""
  log_info "View logs:"
  echo "  All services:         docker compose -f $COMPOSE_FILE logs -f"
  echo "  ONNX Runtime:         docker logs -f nyra-onnx-runtime"
  echo "  Xenova/Transformers:  docker logs -f nyra-xenova-embeddings"

  echo ""
  log_info "Stop services:"
  echo "  docker compose -f $COMPOSE_FILE down"
}

# Main execution
main() {
  log_info "Project Nyra - Embedding Services Startup"
  echo ""

  check_prerequisites
  check_environment
  start_services
  wait_for_services
  show_status

  echo ""
  log_info "Embedding services are ready!"
}

# Run main function
main
