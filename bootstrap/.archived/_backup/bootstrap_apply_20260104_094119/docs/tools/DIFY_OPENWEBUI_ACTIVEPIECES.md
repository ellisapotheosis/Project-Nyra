# Dify vs Open WebUI vs Activepieces (Nyra decision doc)

## What each tool is for
- **Dify**: production LLM app platform (agentic workflows + RAG + embedding).
- **Open WebUI**: operator console / dev UI for interacting with models and tools.
- **Activepieces**: automation engine (“Zapier alternative”) with MCP exposure.

## Dify vs Open WebUI
| Category | Dify | Open WebUI |
|---|---|---|
| Production app lifecycle | ✅ | ⚠️ |
| Borrower embeddable chat | ✅ | ⚠️ |
| Workflow builder | ✅ | ⚠️ |
| RAG / knowledge base | ✅ | ✅ (DIY-heavy) |
| Best role in Nyra | Borrower UI + assistant apps | Internal lab bench |

## Dify vs Activepieces
| Category | Dify | Activepieces |
|---|---|---|
| Thinking vs doing | Thinking + UX | Doing + integrations |
| Integration breadth | Medium | High |
| Governance | app guardrails | per-flow control |

## Nyra recommendation
- **Dify**: borrower-safe chat UI embedded into the webapp
- **Activepieces**: executes side effects (email/SMS/tasks/CRM updates)
- **n8n**: campaign scheduling and state machines
