"""
ONNX Runtime GPU Inference Service
Provides gRPC/HTTP API for model inference with quantization support
"""
import os
import time
from typing import Dict, List, Optional
from pathlib import Path

import numpy as np
import onnxruntime as ort
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel


# Configuration
MODEL_CACHE_DIR = Path("/app/models")
DEVICE_ID = 0  # GPU device ID
BATCH_SIZE = int(os.getenv("BATCH_SIZE", "8"))
QUANTIZATION = os.getenv("QUANTIZATION", "fp16")  # fp32, fp16, int8


class InferenceRequest(BaseModel):
    """Inference request schema"""
    model_name: str
    inputs: Dict[str, List[float]]
    batch_size: Optional[int] = BATCH_SIZE
    quantization: Optional[str] = QUANTIZATION


class InferenceResponse(BaseModel):
    """Inference response schema"""
    outputs: Dict[str, List[float]]
    latency_ms: float
    device: str


class ONNXInferenceService:
    """ONNX Runtime inference service with GPU acceleration"""

    def __init__(self):
        self.sessions = {}
        self.device = "cuda" if ort.get_device() == "GPU" else "cpu"

        # Configure ONNX Runtime providers
        self.providers = [
            ('CUDAExecutionProvider', {
                'device_id': DEVICE_ID,
                'arena_extend_strategy': 'kNextPowerOfTwo',
                'gpu_mem_limit': 10 * 1024 * 1024 * 1024,  # 10GB
                'cudnn_conv_algo_search': 'EXHAUSTIVE',
                'do_copy_in_default_stream': True,
            }),
            'CPUExecutionProvider',
        ]

    def load_model(self, model_name: str, model_path: Path) -> None:
        """Load ONNX model into session cache"""
        if model_name not in self.sessions:
            sess_options = ort.SessionOptions()
            sess_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
            sess_options.intra_op_num_threads = 4
            sess_options.inter_op_num_threads = 4

            self.sessions[model_name] = ort.InferenceSession(
                str(model_path),
                sess_options,
                providers=self.providers
            )

    def infer(self, model_name: str, inputs: Dict[str, np.ndarray]) -> Dict[str, np.ndarray]:
        """Run inference on loaded model"""
        if model_name not in self.sessions:
            raise ValueError(f"Model {model_name} not loaded")

        session = self.sessions[model_name]

        # Convert inputs to ONNX format
        ort_inputs = {
            name: inputs[name].astype(np.float32)
            for name in session.get_inputs()
        }

        # Run inference
        start_time = time.perf_counter()
        ort_outputs = session.run(None, ort_inputs)
        latency = (time.perf_counter() - start_time) * 1000

        # Convert outputs
        output_names = [output.name for output in session.get_outputs()]
        outputs = dict(zip(output_names, ort_outputs))

        return outputs, latency


# Initialize FastAPI app
app = FastAPI(
    title="ONNX Runtime GPU Inference Service",
    description="GPU-accelerated inference with ONNX Runtime",
    version="1.0.0"
)

# Initialize service
inference_service = ONNXInferenceService()


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "device": inference_service.device,
        "providers": ort.get_available_providers(),
        "gpu_available": ort.get_device() == "GPU"
    }


@app.post("/infer", response_model=InferenceResponse)
async def inference(request: InferenceRequest):
    """Run inference on ONNX model"""
    try:
        # Convert inputs to numpy arrays
        np_inputs = {
            name: np.array(values, dtype=np.float32)
            for name, values in request.inputs.items()
        }

        # Load model if not cached
        model_path = MODEL_CACHE_DIR / f"{request.model_name}.onnx"
        if not model_path.exists():
            raise HTTPException(status_code=404, detail=f"Model {request.model_name} not found")

        inference_service.load_model(request.model_name, model_path)

        # Run inference
        outputs, latency = inference_service.infer(request.model_name, np_inputs)

        # Convert outputs to lists
        output_lists = {
            name: array.tolist()
            for name, array in outputs.items()
        }

        return InferenceResponse(
            outputs=output_lists,
            latency_ms=round(latency, 2),
            device=inference_service.device
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/models")
async def list_models():
    """List available models"""
    models = [f.stem for f in MODEL_CACHE_DIR.glob("*.onnx")]
    return {"models": models, "count": len(models)}


@app.delete("/models/{model_name}")
async def unload_model(model_name: str):
    """Unload model from memory"""
    if model_name in inference_service.sessions:
        del inference_service.sessions[model_name]
        return {"status": "unloaded", "model": model_name}
    return {"status": "not_loaded", "model": model_name}
