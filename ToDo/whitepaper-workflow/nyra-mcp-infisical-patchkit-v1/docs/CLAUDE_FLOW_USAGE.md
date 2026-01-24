# Claude-Flow: how we use it for Nyra

## Why it matters
Claude-Flow gives you:
- project initialization with SPARC scaffolding (`init --sparc`)
- template-managed `CLAUDE.md` context files
- batch execution plans (`sparc batch`)
- non-interactive / CI mode
- stream-chaining (agent outputs piped into the next)

## What to steal from the repo/examples
Even if you don’t copy code directly, you should copy the *patterns*:
- **LiteLLM integration** example → maps perfectly to your Nexus + LiteLLM + OpenRouter routing
- **Non-interactive mode** → turn prompt packs into reproducible scripts
- **Stream-chain** → build multi-agent pipelines for campaign creation, compliance checks, quoting

## Recommended Nyra flows
### 1) “Build a feature” pipeline (stream chain)
1. Spec agent → outputs requirements
2. Architecture agent → outputs design + interfaces
3. Implementation agent → outputs code
4. Compliance agent → audits borrower-facing parts

### 2) “Campaign generation” pipeline
1. Campaign architect converts docx → DSL
2. Compliance sentinel validates templates + opt-out language
3. Integration wrangler generates n8n workflows

### 3) “Quote engine expansion”
1. Quote engineer ingests your spreadsheet formulas
2. Adds pricing import schema
3. Adds PDF packet output

## Quick commands cheat sheet
```bash
npx @claude-flow/cli@latest init --sparc
npx claude-flow templates list
npx claude-flow templates apply web-development
npx claude-flow sparc batch "Execute nyra-batch.md exactly"
# headless
claude -p "..." --output-format stream-json
```
