# Worker: RTX 5090 (Alienware Area-51)

## Hardware
- **GPU:** NVIDIA RTX 5090 (32GB VRAM)
- **CPU:** Intel Core i9-14900HX
- **RAM:** 64GB DDR5
- **Storage:** 2TB NVMe

## Role
- vLLM server for large models (70B+ parameters)
- LMCache for KV cache optimization
- Primary inference for complex tasks

## Recommended Models
- meta-llama/Llama-2-70b-chat-hf
- mistralai/Mixtral-8x7B-Instruct-v0.1
- codellama/CodeLlama-34b-Instruct

## Setup
1. Copy `.env.example` to `.env`
2. Add HF_TOKEN for model downloads
3. Run: `docker-compose up -d`
4. Wait for model download (can take 30+ mins)
5. Verify: `curl http://localhost:8080/health`

## Network
- Tailscale IP: 100.102.204.112
- vLLM API: port 8080
- LMCache: port 8081
- Worker Agent: port 8000
