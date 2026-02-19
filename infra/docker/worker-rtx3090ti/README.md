# Worker: RTX 3090Ti (Desktop)

## Hardware
- **GPU:** NVIDIA RTX 3090 Ti (24GB VRAM)
- **CPU:** Intel Core i7-12700
- **RAM:** 64GB DDR4
- **Storage:** 2TB NVMe

## Role
- vLLM server for medium-large models (13B-34B parameters)
- LMCache for KV cache optimization
- Secondary inference node

## Recommended Models
- meta-llama/Llama-2-13b-chat-hf
- mistralai/Mistral-7B-Instruct-v0.2
- codellama/CodeLlama-13b-Instruct

## Setup
1. Copy `.env.example` to `.env`
2. Add HF_TOKEN for model downloads
3. Run: `docker-compose up -d`
4. Verify: `curl http://localhost:8080/health`

## Network
- Tailscale IP: [GET FROM: tailscale ip -4]
- vLLM API: port 8080
- LMCache: port 8081
- Worker Agent: port 8000
