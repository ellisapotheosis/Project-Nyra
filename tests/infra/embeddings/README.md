# Embedding Services Test Suite

Comprehensive test suite for ONNX Runtime and Xenova/Transformers embedding services.

## Overview

This test suite validates:
- **ONNX Runtime GPU Service**: Model inference, quantization, performance
- **Xenova/Transformers Service**: Embedding generation, WASM SIMD acceleration, batch processing

## Prerequisites

```bash
# Install test dependencies
pip install -r requirements.txt

# Start embedding services
cd ../../infra/docker/services
docker-compose -f docker-compose.embeddings.yml up -d

# Wait for services to initialize (90 seconds for model loading)
sleep 90
```

## Running Tests

### Run all tests
```bash
pytest -v
```

### Run specific service tests
```bash
# ONNX Runtime tests
pytest test_onnx_service.py -v

# Xenova Transformers tests
pytest test_xenova_service.py -v
```

### Run with markers
```bash
# Integration tests only
pytest -m integration -v

# Performance tests
pytest -m performance -v

# GPU tests
pytest -m gpu -v
```

### Run with coverage
```bash
pytest --cov=../../../infra/docker/services --cov-report=html --cov-report=term
```

## Test Organization

### ONNX Runtime Tests (`test_onnx_service.py`)

| Test Class | Purpose |
|------------|---------|
| `TestONNXServiceHealth` | Health checks, GPU availability |
| `TestONNXInference` | Inference functionality, model loading |
| `TestONNXQuantization` | FP16/INT8 quantization support |
| `TestONNXModelManagement` | Model loading/unloading |
| `TestONNXPerformance` | Latency benchmarks |
| `TestONNXErrorHandling` | Error scenarios |

### Xenova Tests (`test_xenova_service.py`)

| Test Class | Purpose |
|------------|---------|
| `TestXenovaServiceHealth` | Health checks, pipeline initialization |
| `TestXenovaEmbeddings` | Embedding generation, normalization |
| `TestXenovaModels` | Model listing, info endpoints |
| `TestXenovaPerformance` | Latency benchmarks, batch efficiency |
| `TestXenovaErrorHandling` | Error scenarios |
| `TestXenovaIntegration` | Semantic similarity validation |

## Performance Targets

### ONNX Runtime
- Single inference: < 100ms
- Batch inference (8): < 200ms
- GPU acceleration: Required
- Quantization support: FP16, INT8

### Xenova/Transformers
- Single embedding: < 500ms
- Batch (10): < 2000ms
- Batch (50): < 5000ms
- WASM SIMD: Enabled
- Dimensions: 384

## Expected Test Results

```
tests/infra/embeddings/test_onnx_service.py::TestONNXServiceHealth::test_service_is_running PASSED
tests/infra/embeddings/test_onnx_service.py::TestONNXServiceHealth::test_health_response_structure PASSED
tests/infra/embeddings/test_onnx_service.py::TestONNXServiceHealth::test_gpu_is_available PASSED
tests/infra/embeddings/test_onnx_service.py::TestONNXInference::test_list_models PASSED
tests/infra/embeddings/test_xenova_service.py::TestXenovaServiceHealth::test_service_is_running PASSED
tests/infra/embeddings/test_xenova_service.py::TestXenovaServiceHealth::test_pipeline_is_ready PASSED
tests/infra/embeddings/test_xenova_service.py::TestXenovaEmbeddings::test_single_text_embedding PASSED
tests/infra/embeddings/test_xenova_service.py::TestXenovaEmbeddings::test_batch_embeddings PASSED
```

## Troubleshooting

### Services not responding
```bash
# Check service status
docker ps | grep -E "(onnx|xenova)"

# View logs
docker logs nyra-onnx-runtime
docker logs nyra-xenova-embeddings

# Restart services
docker-compose -f docker-compose.embeddings.yml restart
```

### GPU not available (ONNX)
```bash
# Check NVIDIA Docker runtime
docker run --rm --gpus all nvidia/cuda:12.3.0-base-ubuntu22.04 nvidia-smi

# Verify CUDA_VISIBLE_DEVICES
docker exec nyra-onnx-runtime env | grep CUDA
```

### Model loading timeout (Xenova)
```bash
# Xenova needs time to download models on first run
# Wait up to 120 seconds for initial model download
sleep 120

# Check model cache
docker exec nyra-xenova-embeddings ls -la /app/models
```

## Integration with ruvector

Embedding services integrate with ruvector for vector storage:

```python
# Example: Generate embeddings with Xenova
import requests

response = requests.post('http://localhost:8002/embed', json={
    'texts': ['Document content here'],
    'normalize': True
})

embeddings = response.json()['embeddings']

# Store in ruvector
ruvector.store_vector(
    collection='documents',
    vector=embeddings[0],
    metadata={'source': 'test'}
)
```

## CI/CD Integration

Add to GitHub Actions workflow:

```yaml
- name: Start embedding services
  run: |
    cd infra/docker/services
    docker-compose -f docker-compose.embeddings.yml up -d
    sleep 90

- name: Run embedding tests
  run: |
    cd tests/infra/embeddings
    pip install -r requirements.txt
    pytest -v --tb=short
```

## Notes

- Tests require running Docker services
- GPU tests require NVIDIA GPU with CUDA support
- First run may take longer due to model downloads
- Services run on orchestrator PC only (not GPU workers)
