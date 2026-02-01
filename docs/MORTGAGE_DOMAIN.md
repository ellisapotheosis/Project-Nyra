# Project Nyra - Mortgage Domain Reference

This document contains mortgage-specific requirements, agents, workflows, and compliance metrics extracted from the main CLAUDE.md.

## Compliance-First Development

**Every mortgage feature MUST include:**
- TILA/RESPA/TRID disclosure validation
- Anti-steering policy enforcement
- Fair lending law compliance
- State-specific regulations (50 states)
- CFPB examination standards

## Domain-Specific Agents

| Agent | Purpose |
|-------|---------|
| `mortgage-quote-agent` | Rate calculation, lender comparison |
| `loan-qualification-agent` | DTI, credit, eligibility analysis |
| `document-processor-agent` | OCR, validation, extraction |
| `compliance-agent` | Regulatory verification |
| `borrower-communication-agent` | Email, SMS, call automation |

---

## Memory System for Mortgage Operations

**When to Use Each Memory System:**

| Use Case | System | Command |
|----------|--------|---------|
| Find similar mortgage quotes | RuVector | `ruvector_search(query, k=5)` |
| Remember borrower conversation | Letta | `letta_update_memory(agent_id, content)` |
| Track loan status changes | Graphiti | `graphiti_get_evolution(loan_id, timerange)` |
| Store borrower preferences | Mem0 | `mem0_update_profile(borrower_id, prefs)` |
| Share compliance patterns | OpenMemory | `openmemory_share(pattern, agents)` |
| Search mortgage documents | RuVector | `ruvector_index(doc, metadata)` |
| Query relationship history | Graphiti | `graphiti_query(cypher_query)` |

**Memory Coordination Pattern for Mortgage Tasks:**

```bash
# Before any mortgage task, check relevant memory
npx @claude-flow/cli@latest memory search --query "conventional loan qualification" --namespace mortgage-patterns

# After successful task, store pattern
npx @claude-flow/cli@latest memory store --key "pattern-dti-calculation" --value "Verified DTI formula with CFPB guidelines" --namespace mortgage-patterns

# Update agent memory
letta_update_memory(borrower_agent_id, {
  last_quote_amount: 350000,
  preferred_loan_type: "conventional",
  target_down_payment: 20
})

# Track in knowledge graph
graphiti_add_node({
  type: "MortgageQuote",
  properties: { amount, rate, lender },
  relationships: [{ type: "QUOTED_FOR", targetId: borrower_id }]
})
```

---

## Mortgage Workflow Examples

### Lead-to-Quote Workflow (TDD + Mesh Topology)

```bash
# 1. Initialize mesh swarm for parallel processing
npx @claude-flow/cli@latest swarm init --topology mesh --max-agents 8 --strategy balanced

# 2. Spawn mortgage workflow agents (in ONE message, mesh coordination)
Task({
  prompt: "Write tests for loan qualification logic (DTI, credit, income validation)",
  subagent_type: "tester",
  description: "TDD Red - Qualification tests",
  run_in_background: true
})
Task({
  prompt: "Analyze lead data, check credit requirements, store borrower profile in Letta and Mem0",
  subagent_type: "loan-qualification-agent",
  description: "Qualify borrower for loan types",
  run_in_background: true
})
Task({
  prompt: "Generate multi-lender quote using Rocket Mortgage and LenderPrice APIs, store in RuVector",
  subagent_type: "mortgage-quote-agent",
  description: "Create mortgage quote",
  run_in_background: true
})
Task({
  prompt: "Validate TILA/RESPA disclosure requirements, check state regulations",
  subagent_type: "compliance-agent",
  description: "Compliance validation",
  run_in_background: true
})
Task({
  prompt: "Create Graphiti knowledge graph relationships: Lead → Borrower → Quote",
  subagent_type: "memory-specialist",
  description: "Memory coordination",
  run_in_background: true
})

# 3. Agents work in mesh topology with peer-to-peer coordination
```

### Document Processing Workflow

```bash
# Process borrower documents with OCR and validation
npx @claude-flow/cli@latest workflow run document-processing \
  --borrower-id 12345 \
  --files "paystub.pdf,w2.pdf,bank_statement.pdf" \
  --agents "document-processor-agent,compliance-agent" \
  --parallel true
```

### Drip Campaign Workflow

```bash
# Start automated drip sequence
npx @claude-flow/cli@latest workflow run drip-campaign \
  --borrower-id 12345 \
  --sequence "pre-approval-nurture" \
  --channels "email,sms" \
  --compliance-check true
```

---

## Performance Targets

### Business Metrics

| Metric | Target | Monitoring |
|--------|--------|------------|
| Lead conversion rate | >15% | TwentyCRM pipeline |
| Time to quote generation | <2 minutes | Quote API metrics |
| Documents processed/hour | >50 | Document processor logs |
| Email/SMS open rates | >40% | Campaign engine analytics |
| Borrower satisfaction | >4.5/5 | Dify chat feedback |

### Technical Metrics

| Metric | Target | Tool |
|--------|--------|------|
| API response time (p95) | <200ms | Prometheus |
| LLM routing local vs cloud | >80% local | Nexus logs |
| Memory system read latency | <50ms | AgentDB metrics |
| Agent task completion rate | >95% | Claude Flow dashboard |
| System uptime | >99.9% | Grafana alerts |

### Compliance Metrics

| Metric | Target | Tool |
|--------|--------|------|
| Disclosure generation success | 100% | Compliance agent logs |
| Audit log completeness | 100% | Loki queries |
| TRID timeline adherence | 100% | Campaign engine validation |
| Data encryption coverage | 100% PII | Security scan |

---

## Development Priorities

### Phase 1: Core Infrastructure (Week 1)
- All Docker services healthy and networked
- Nexus Router routing to all 3 LLM providers
- TwentyCRM initialized with test data
- Observability dashboards showing metrics

### Phase 2: Business Services (Week 2)
- Quote Engine calculating rates accurately
- Campaign Engine integrating with n8n + Twilio
- Nyra Orchestrator validating compliance
- All services with comprehensive health checks

### Phase 3: Frontend Applications (Week 3)
- RateHunter public site with rate calculator
- Nyra Admin dashboard with lead management
- Dify chat interface embedded in both apps
- Mobile-responsive design throughout

### Phase 4: Integration & Testing (Week 4)
- LendingTree/FreeRateUpdate API integration
- Twilio SMS/voice/email working
- Full workflow testing (lead → quote → campaign → conversion)
- 90%+ test coverage (TDD enforcement)

---

## Key Mortgage Security Rules

1. **Store all sensitive borrower data encrypted** (SSN, income, credit scores, financial documents)
2. **Maintain complete audit trails** for all mortgage operations (quotes, disclosures, communications)
3. **Every mortgage feature MUST include compliance validation** (TILA, RESPA, TRID, state regulations)
4. **Use local LLMs first** (80%+ on GPU workers), fallback to cloud only when necessary for compliance-critical operations

---

## Related Documentation

- **Whitepaper**: `ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/docs/whitepaper/WHITEPAPER.md`
- **Architecture**: `ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/docs/whitepaper/ARCHITECTURE.md`
- **SPARC Workflows**: `ToDo/whitepaper-workflow/Nyra-Truth-and-Standards/MORTGAGE-SPARC-WORKFLOWS.md`
- **Compliance Guide**: `ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/docs/COMPLIANCE_GUARDRAILS.md`
- **Stack Decisions**: `ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/docs/STACK_DECISIONS.md`
