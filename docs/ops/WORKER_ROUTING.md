# Worker Routing

- RTX5090: large vLLM reasoning/code route.
- RTX3090Ti: steady vLLM assistant/campaign route.
- RTX3060: Ollama utility route for `nomic-embed-text`, `llama3.2:3b`, and `mistral:7b-instruct-v0.3-q4_K_M`.

Memory flow sends embeddings/vector arrays over the wire to Oracle Qdrant instead of raw text when possible.

Workers remain private behind Tailscale/gateway routing.
