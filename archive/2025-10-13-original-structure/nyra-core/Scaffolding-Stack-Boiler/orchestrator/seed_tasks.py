import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
TASKS = ROOT / "orchestrator" / "tasks.json"

demo = [
  {
    "name": "nyra-scaffold-core",
    "prompt": "Scaffold the nyra-dev-stack monorepo: /orchestration, /agents, /mcp, /memory, /prompts, /infra, /docs. Generate ADR-0001 and ADR-0002. Use MCP tools (google_search, firecrawl_scrape)."
  },
  {
    "name": "nyra-memory-warm",
    "prompt": "Initialize Chroma scratchpad with example notes and tag schema. Expose a simple Python API to read/write memories."
  }
]

TASKS.parent.mkdir(parents=True, exist_ok=True)
TASKS.write_text(json.dumps(demo, indent=2), encoding="utf-8")
print(f"[seed] Wrote {TASKS}")
