# Worker: RTX 3060 (Alienware M15R7)

## Hardware
- **GPU:** NVIDIA RTX 3060 Mobile (8GB VRAM)
- **CPU:** Intel Core i7-12700H
- **RAM:** 32GB DDR5
- **Storage:** 1TB NVMe

## Role
- Ollama server for smaller models (≤7B parameters)
- Embeddings generation
- Fast inference for simple tasks

## Recommended Models
```bash
ollama pull llama3.2:3b
ollama pull phi3:mini
ollama pull nomic-embed-text
ollama pull codellama:7b
```

## Setup
1. Copy `.env.example` to `.env`
2. Fill in environment variables
3. Run: `docker-compose up -d`
4. Verify: `curl http://localhost:11434/api/tags`

## Network
- Tailscale IP: 100.107.188.97
- Ollama API: port 11434
- Worker Agent: port 8000
