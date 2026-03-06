# ONNX Runtime GPU Inference Service
# Optimized for RTX 5090/3090/3060 inference on orchestrator PC
# Supports INT8, FP16 quantization and dynamic batching

FROM nvidia/cuda:12.3.0-cudnn9-runtime-ubuntu22.04

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3.11 \
    python3-pip \
    curl \
    wget \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install ONNX Runtime GPU
RUN pip3 install --no-cache-dir \
    onnxruntime-gpu==1.17.0 \
    numpy>=1.24.0 \
    fastapi>=0.110.0 \
    uvicorn[standard]>=0.27.0 \
    pydantic>=2.6.0 \
    python-multipart \
    grpcio>=1.60.0 \
    grpcio-tools>=1.60.0

# Create application directory
WORKDIR /app

# Copy service files
COPY app/ /app/

# Create model cache directory
RUN mkdir -p /app/models /app/cache

# Expose gRPC port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

# Run with uvicorn for HTTP/REST API
CMD ["python3", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "2"]
