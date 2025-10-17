# NYRA-Orch (DeepCode x AgentZero x FastMCP x Chroma) — Google + Firecrawl

## Run
1. Put this folder under your Scaffolding-Stack.
2. In PowerShell here: `./bootstrap.ps1`
3. Fill `.env` with keys when ready:
   - GOOGLE_API_KEY, GOOGLE_CSE_ID
   - FIRECRAWL_API_KEY (optional but recommended)
   - OPENAI/ANTHROPIC keys as desired

## What changed (vs Brave)
- No Brave. Search/crawl provided by FastMCP tools:
  - `google_search(query, num)` → uses Google CSE (JSON API).
  - `firecrawl_scrape(url, extract)` → uses Firecrawl.

## AgentZero
Use profile: `agentzero/prompts/profiles/nyra-a0-archon.md`
First message: `prompts/AGENTZERO_FIRST_TASK.txt`
