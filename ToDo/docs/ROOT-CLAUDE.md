# PROJECT NYRA - AI-Powered Mortgage Automation Platform

**Version:** 2.0.0  
**Last Updated:** January 8, 2025  
**Developer:** Apotheosis (Mortgage Broker, Real Estate Broker, Branch Manager)  
**Methodology:** SPARC (Specification, Pseudocode, Architecture, Refinement, Completion)

---

## CRITICAL GOLDEN RULES

### Rule #1: One Message = All Operations (300% Performance Gain)
**Never** ask "Would you like me to..." or "Should I also..." or "Do you want me to continue?"  
**Always** complete the entire operation in ONE message including all logical next steps.

When implementing a feature, you automatically include: writing all necessary code files, creating tests, updating documentation, adding error handling, implementing logging, creating database migrations, and all related configuration.

### Rule #2: Memory System Priority Order
When storing or retrieving information, use this strict priority:
1. **RuVector** - Fast vector search and similarity matching (use FIRST for search operations)
2. **Letta** - Conversational context and agent memory (use for ongoing dialogues)
3. **Graphiti** - Temporal tracking and evolution (use for historical analysis)
4. **Mem0** - User personalization and preferences (use for borrower-specific data)
5. **OpenMemory** - Shared knowledge across agents (use for collaborative work)

### Rule #3: Local-First LLM Strategy
**Always** attempt local GPU workers before cloud APIs. This saves approximately $37,800/year in API costs.

---

## MORTGAGE BROKER DOMAIN KNOWLEDGE

### Core Mortgage Concepts

**Loan Types We Process:**
- **Conventional** - Fannie Mae/Freddie Mac, requires 3-20% down, best rates for 720+ credit
- **FHA** - 3.5% down, flexible credit (580+), mortgage insurance required
- **VA** - $0 down for veterans, no PMI, funding fee applies
- **USDA** - $0 down for rural properties, income limits apply
- **Jumbo** - Loans above conforming limit, stricter requirements
- **Non-QM** - Bank statement loans, alternative income verification
- **Reverse Mortgage** - 62+ years old, convert home equity to income
- **HELOC/HELOAN** - Second mortgages, home equity lines

**Key Calculations:**
- **DTI (Debt-to-Income)** - (Total Monthly Debt / Gross Monthly Income) × 100
- **LTV (Loan-to-Value)** - (Loan Amount / Property Value) × 100
- **APR** - True cost including interest plus fees
- **PITI** - Principal + Interest + Taxes + Insurance

**TRID Compliance:**
- Loan Estimate within 3 business days of application
- Closing Disclosure 3 business days before closing
- All disclosures must be accurate - violations result in fines

---

## TECHNOLOGY STACK

### Memory Systems (ALL 6 INTEGRATED)
1. **RuVector** (Port 7000) - Distributed vector search
2. **Letta** (Port 8283) - Agent conversational memory
3. **Graphiti** (FalkorDB) - Temporal knowledge graph
4. **FalkorDB** (Port 6379) - Graph database backend
5. **Mem0** (Port 8081) - User personalization
6. **OpenMemory** (Port 8080) - Shared collaborative knowledge

### Local LLM Infrastructure
- **Worker-5090** - RTX 5090 (48GB) - DeepSeek-R1 236B, Qwen 2.5 72B
- **Worker-3090** - RTX 3090 Ti (24GB) - Llama 3.1 70B, Mistral Large 123B
- **Worker-3060** - RTX 3060 (12GB) - CodeLlama 34B, Qwen 32B, Gemma2 27B

---

## MEMORY SYSTEM USAGE GUIDE

| Use Case | Primary System | Why |
|----------|---------------|-----|
| Find similar code | RuVector | Fast vector similarity search |
| Search documents | RuVector | Vector embeddings + semantic search |
| Conversation context | Letta | Agent conversational memory |
| Loan status evolution | Graphiti | Temporal relationship tracking |
| User preferences | Mem0 | Personalization |
| Shared knowledge | OpenMemory | Collaborative memory |

---

## AVAILABLE AGENTS (54 Total)

### Mortgage Agents (8)
- mortgage-quote-agent, loan-qualification-agent, document-processor-agent
- compliance-agent, underwriting-agent, closing-coordinator-agent
- borrower-communication-agent, lead-nurture-agent

### Development Agents (20+)
- coordinator, coder, researcher, analyst, tester, debugger, reviewer
- documenter, architect, frontend-specialist, backend-specialist, etc.

---

## PROJECT EXECUTION PRIORITIES

### Phase 1: Revenue-Generating (Build FIRST)
1. Lead Capture Webhooks (LendingTree, FreeRateUpdate)
2. Quote API Integration (Rocket, LenderPrice, Optimal Blue)
3. Drip Campaign Automation (SMS, email, voicemail)
4. CRM Migration (TwentyCRM)
5. Document Upload + OCR

### Phase 2: Efficiency Improvements
6. AI Chatbot, Multi-Lender Comparison, Automation Features

### Phase 3: Advanced Features
11. Graphiti tracking, Advanced orchestration, Analytics

---

**Remember:** This is a revenue-generating business system. Every feature must either make money, save time, or reduce risk.
