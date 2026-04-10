# claude-flow examples directory — how to use it for Nyra

GitHub’s directory view for `examples/` sometimes fails to load in automated readers.
Best workflow:

1) Clone the repo locally:
```bash
git clone https://github.com/ruvnet/claude-flow.git
cd claude-flow/examples
ls -la
```

2) Search for patterns relevant to Nyra:
```bash
rg -n "sparc|batch|swarm|mcp|litellm|docker-compose|n8n|workflow" .
```

3) Copy the smallest working example and adapt into Nyra’s:
- `infra/` (compose patterns)
- `prompts/claude-flow/` (batch & SPARC patterns)
- `.claude/agents/` (agent specializations)

If you paste me the filenames you see in `examples/`, I can map each one to a Nyra subsystem and generate “Nyra-adapted” versions.
