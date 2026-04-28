# Project Nyra — Top 5 Maximalist Integrations

### 1. Sentry Auto-Ticketing to Paperclip (U: 10, C: 10)
**Workflow**: 
- `apps/webapp` or `n8n` throws an error.
- Sentry captures the trace.
- Sentry Webhook fires to `https://paperclip.ratehunter.net/api/webhooks/sentry`.
- Paperclip creates a ticket, analyzes the stack trace using the **Local Cluster** pool, and assigns it to an **OpenClaw** worker.

### 2. RTX 3060 Vector/Embedding Node (U: 10, C: 8)
**Offload Strategy**:
- All `nomic-embed-text` tasks are routed to `http://worker-rtx3060.trex-fiordland.ts.net:11434`.
- This ensures the **RTX 5090** and **3090Ti** are never blocked by embedding generation during high-reasoning tasks.

### 3. SearXNG Local Agent Search (U: 9, C: 9)
**Self-Hosted Intelligence**:
- Hosted on Oracle VPS.
- Agents use `https://search.ratehunter.net` for real-time web browsing.
- Zero Google API keys needed; zero rate limits.

### 4. RTX 3060 Real-Time Voice Pipeline (U: 8, C: 10)
**Kyutai Unmute**:
- Runs Whisper/Piper on the 3060.
- Nerve UI connects to `http://worker-rtx3060.trex-fiordland.ts.net:5050` for sub-400ms TTS.

### 5. Browserless (Puppeteer) Node (U: 9, C: 8)
**Visual Scraping**:
- Hosted on Oracle VPS.
- Allows agents to spin up headless Chromium instances to scrape SPA/React sites that basic `curl` cannot read.
