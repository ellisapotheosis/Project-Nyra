# CLAUDE.md - Nyra Assistant Webapp

## 🚨 CRITICAL: CONCURRENT EXECUTION & FILE MANAGEMENT

**ABSOLUTE RULES**:
1. ALL operations MUST be concurrent/parallel in a single message
2. **NEVER save working files to the root folder**
3. ALWAYS organize files in appropriate subdirectories
4. **USE CLAUDE CODE'S TASK TOOL** for spawning agents concurrently

### ⚡ GOLDEN RULE: "1 MESSAGE = ALL RELATED OPERATIONS"

**MANDATORY PATTERNS:**
- **TodoWrite**: ALWAYS batch ALL todos in ONE call (5-10+ todos minimum)
- **Task tool**: ALWAYS spawn ALL agents in ONE message with full instructions
- **File operations**: ALWAYS batch ALL reads/writes/edits in ONE message
- **Bash commands**: ALWAYS batch ALL terminal operations in ONE message
- **Memory operations**: ALWAYS batch ALL memory store/retrieve in ONE message

---

## 🎯 PROJECT CONTEXT

### Application Overview
**Nyra Assistant Webapp** is an intelligent AI-powered mortgage assistant that qualifies leads, extracts document data via OCR, checks compliance, and routes leads to loan officers.

**Primary Purpose:**
- AI-driven lead qualification and scoring
- Multi-agent orchestration (archon-os + Archon)
- Real-time chat interface with borrowers
- Document OCR and intelligent extraction
- Compliance checking (RESPA, TRID, TILA)
- Automated lead routing and assignment

**Target Users:**
- Loan officers (primary users)
- Borrowers (chat interface)
- Operations managers (oversight)
- Compliance officers (audit trail)

### Technology Stack

**Frontend:**
- **React 18** (with TypeScript)
- **Vite** (build tool, fast HMR)
- **TanStack Query** (server state management)
- **Zustand** (client state management)
- **Tailwind CSS** (styling)
- **Shadcn/ui** (component library)
- **React Router** (routing)
- **WebSocket** (real-time chat)

**Backend:**
- **Node.js 20** (LTS)
- **Express** (REST API)
- **Socket.io** (WebSocket server)
- **Prisma ORM** (database client)
- **PostgreSQL** (primary database)
- **Redis** (caching, pub/sub, rate limiting)
- **Bull** (job queues for async tasks)

**AI & Orchestration:**
- **archon-os** (multi-agent orchestration)
- **Archon** (agent coordination framework)
- **Anthropic Claude API** (Claude Sonnet 4.5)
- **OpenAI API** (GPT-4o for embeddings)
- **LangChain** (AI workflow orchestration)

**Document Processing:**
- **Tesseract.js** (OCR for document text extraction)
- **PDF.js** (PDF parsing)
- **Sharp** (image processing)
- **Document AI** (structured data extraction)

**Infrastructure:**
- **Docker + Docker Compose** (containerization)
- **PostgreSQL** (shared database server)
- **Redis** (shared cache server)
- **Infisical** (secrets management)
- **Tailscale** (private networking)

**Monitoring & Logging:**
- **Winston** (structured logging)
- **LogTail** (log aggregation)
- **Prometheus** (metrics)
- **Grafana** (dashboards)
- **Sentry** (error tracking)

### Architecture Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│                    Nyra Assistant Webapp                         │
│             (React + Node.js + AI Orchestration)                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
     ┌───────────────┼────────────────────────────────────┐
     │               │                                    │
┌────▼─────┐   ┌────▼─────┐   ┌─────▼─────┐      ┌─────▼─────┐
│ Chat UI  │   │  Lead    │   │ Document  │      │Compliance │
│(React WS)│   │Management│   │ OCR + AI  │      │ Checker   │
└────┬─────┘   └────┬─────┘   └─────┬─────┘      └─────┬─────┘
     │               │               │                   │
     └───────────────┴───────────────┴───────────────────┘
                     │
     ┌───────────────┼────────────────────────────┐
     │               │                            │
┌────▼──────┐  ┌────▼──────┐              ┌─────▼──────┐
│Multi-Agent│  │PostgreSQL │              │   Redis    │
│Orchestrator│  │ Database  │              │   Cache    │
│(archon-os│  └───────────┘              └────────────┘
│ + Archon) │
└────┬──────┘
     │
┌────▼──────────────────────────────────────────────────┐
│     AI Agent Swarm (Lead Qualification)               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐│
│  │Qualifying│ │Document  │ │Compliance│ │Routing  ││
│  │  Agent   │ │Extractor │ │ Agent    │ │ Agent   ││
│  └──────────┘ └──────────┘ └──────────┘ └─────────┘│
└───────────────────────────────────────────────────────┘
```

### Project Structure

```
apps/nyra-assistant/
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── chat/           # Chat interface
│   │   │   │   ├── ChatWindow.tsx
│   │   │   │   ├── MessageList.tsx
│   │   │   │   ├── MessageInput.tsx
│   │   │   │   └── TypingIndicator.tsx
│   │   │   ├── leads/          # Lead management
│   │   │   │   ├── LeadList.tsx
│   │   │   │   ├── LeadDetails.tsx
│   │   │   │   ├── LeadScore.tsx
│   │   │   │   └── LeadTimeline.tsx
│   │   │   ├── documents/      # Document management
│   │   │   │   ├── DocumentUpload.tsx
│   │   │   │   ├── DocumentViewer.tsx
│   │   │   │   ├── OcrResults.tsx
│   │   │   │   └── DocumentAnnotation.tsx
│   │   │   └── ui/             # UI primitives (Shadcn)
│   │   │       ├── button.tsx
│   │   │       ├── input.tsx
│   │   │       ├── card.tsx
│   │   │       └── dialog.tsx
│   │   ├── features/           # Feature modules
│   │   │   ├── auth/           # Authentication
│   │   │   ├── chat/           # Chat feature
│   │   │   ├── leads/          # Lead management
│   │   │   ├── documents/      # Document processing
│   │   │   └── compliance/     # Compliance checking
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useWebSocket.ts
│   │   │   ├── useLeads.ts
│   │   │   ├── useChat.ts
│   │   │   └── useDocumentOcr.ts
│   │   ├── lib/                # Utilities
│   │   │   ├── api.ts          # API client
│   │   │   ├── websocket.ts    # WebSocket client
│   │   │   └── utils.ts        # Helper functions
│   │   ├── stores/             # Zustand stores
│   │   │   ├── authStore.ts
│   │   │   ├── chatStore.ts
│   │   │   └── leadStore.ts
│   │   ├── types/              # TypeScript types
│   │   │   ├── lead.ts
│   │   │   ├── chat.ts
│   │   │   ├── document.ts
│   │   │   └── agent.ts
│   │   ├── App.tsx             # Root component
│   │   ├── main.tsx            # Entry point
│   │   └── router.tsx          # React Router config
│   ├── public/                 # Static assets
│   ├── index.html
│   ├── vite.config.ts          # Vite configuration
│   ├── tailwind.config.ts      # Tailwind configuration
│   ├── tsconfig.json           # TypeScript configuration
│   └── package.json
│
├── backend/                    # Node.js backend
│   ├── src/
│   │   ├── api/                # REST API routes
│   │   │   ├── auth.ts         # Authentication endpoints
│   │   │   ├── leads.ts        # Lead management API
│   │   │   ├── chat.ts         # Chat API
│   │   │   ├── documents.ts    # Document upload/OCR API
│   │   │   └── agents.ts       # Agent orchestration API
│   │   ├── services/           # Business logic services
│   │   │   ├── lead-service.ts
│   │   │   ├── chat-service.ts
│   │   │   ├── document-service.ts
│   │   │   ├── ocr-service.ts
│   │   │   ├── compliance-service.ts
│   │   │   └── routing-service.ts
│   │   ├── agents/             # AI agent implementations
│   │   │   ├── qualifying-agent.ts
│   │   │   ├── document-extraction-agent.ts
│   │   │   ├── compliance-agent.ts
│   │   │   └── routing-agent.ts
│   │   ├── orchestration/      # Multi-agent orchestration
│   │   │   ├── archon-os-client.ts
│   │   │   ├── archon-coordinator.ts
│   │   │   ├── swarm-manager.ts
│   │   │   └── task-orchestrator.ts
│   │   ├── websocket/          # WebSocket handlers
│   │   │   ├── chat-handler.ts
│   │   │   ├── lead-updates-handler.ts
│   │   │   └── agent-status-handler.ts
│   │   ├── jobs/               # Background job processors
│   │   │   ├── lead-qualification.ts
│   │   │   ├── document-processing.ts
│   │   │   └── compliance-check.ts
│   │   ├── middleware/         # Express middleware
│   │   │   ├── auth.ts
│   │   │   ├── rate-limit.ts
│   │   │   ├── validation.ts
│   │   │   └── error-handler.ts
│   │   ├── lib/                # Utilities
│   │   │   ├── prisma.ts       # Prisma client
│   │   │   ├── redis.ts        # Redis client
│   │   │   ├── logger.ts       # Winston logger
│   │   │   └── queue.ts        # Bull queue
│   │   ├── types/              # TypeScript types
│   │   │   ├── lead.ts
│   │   │   ├── agent.ts
│   │   │   └── document.ts
│   │   ├── config/             # Configuration
│   │   │   ├── database.ts
│   │   │   ├── redis.ts
│   │   │   └── agents.ts
│   │   ├── app.ts              # Express app setup
│   │   └── server.ts           # Server entry point
│   ├── prisma/                 # Database schema
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── tests/                  # Test files
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── tsconfig.json
│   └── package.json
│
├── docs/                       # Documentation
│   ├── architecture.md
│   ├── agent-orchestration.md
│   ├── api.md
│   ├── deployment.md
│   └── compliance.md
│
├── scripts/                    # Build/deploy scripts
│   ├── build.sh
│   ├── deploy.sh
│   ├── migrate.sh
│   └── seed-db.sh
│
├── docker-compose.yml          # Local development
├── Dockerfile.frontend         # Frontend container
├── Dockerfile.backend          # Backend container
└── README.md
```

---

## 🔧 DEVELOPMENT PATTERNS

### Multi-Agent Orchestration with archon-os

**Initialize Agent Swarm:**
```typescript
// backend/src/orchestration/swarm-manager.ts
import { ClaudeFlowClient } from './archon-os-client';
import { ArchonCoordinator } from './archon-coordinator';

export class SwarmManager {
  private claudeFlow: ClaudeFlowClient;
  private archon: ArchonCoordinator;

  constructor() {
    this.claudeFlow = new ClaudeFlowClient();
    this.archon = new ArchonCoordinator();
  }

  async initializeSwarm(topology: 'mesh' | 'hierarchical' = 'hierarchical') {
    // Initialize archon-os swarm
    await this.claudeFlow.initSwarm({
      topology,
      maxAgents: 6,
      strategy: 'adaptive',
    });

    // Spawn specialized agents
    await Promise.all([
      this.claudeFlow.spawnAgent({ type: 'qualifying-agent', capabilities: ['lead-analysis', 'credit-assessment'] }),
      this.claudeFlow.spawnAgent({ type: 'document-extractor', capabilities: ['ocr', 'data-extraction'] }),
      this.claudeFlow.spawnAgent({ type: 'compliance-checker', capabilities: ['respa', 'trid', 'tila'] }),
      this.claudeFlow.spawnAgent({ type: 'routing-agent', capabilities: ['lead-assignment', 'prioritization'] }),
    ]);

    // Initialize Archon coordination
    await this.archon.registerAgents([
      { id: 'qualifying-agent', role: 'lead_qualification' },
      { id: 'document-extractor', role: 'document_processing' },
      { id: 'compliance-checker', role: 'compliance_verification' },
      { id: 'routing-agent', role: 'lead_routing' },
    ]);
  }

  async qualifyLead(leadId: string): Promise<LeadQualificationResult> {
    // Orchestrate multi-agent lead qualification
    const task = await this.claudeFlow.orchestrateTask({
      task: `Qualify lead ${leadId} for mortgage eligibility`,
      priority: 'high',
      strategy: 'parallel',
      agents: ['qualifying-agent', 'compliance-checker'],
    });

    // Coordinate via Archon
    const result = await this.archon.coordinateTask({
      taskId: task.id,
      workflow: 'lead_qualification',
      data: { leadId },
    });

    return result;
  }
}
```

**AI Agent Implementation:**
```typescript
// backend/src/agents/qualifying-agent.ts
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

export class QualifyingAgent {
  private claude: Anthropic;

  constructor() {
    this.claude = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async qualifyLead(leadId: string): Promise<LeadQualification> {
    // Fetch lead data
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        borrower: true,
        documents: true,
        financialProfile: true,
      },
    });

    if (!lead) throw new Error('Lead not found');

    // Prepare context for Claude
    const context = this.prepareLeadContext(lead);

    // Call Claude for intelligent analysis
    const message = await this.claude.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 0.3,
      system: `You are an expert mortgage underwriting assistant. Analyze the lead data and provide:
1. Qualification score (0-100)
2. Estimated approval likelihood
3. Required documentation list
4. Risk factors
5. Recommended loan products
6. Next steps for loan officer`,
      messages: [
        {
          role: 'user',
          content: `Analyze this mortgage lead:\n\n${JSON.stringify(context, null, 2)}`,
        },
      ],
    });

    // Parse Claude's response
    const analysis = this.parseQualificationResponse(message.content[0].text);

    // Store qualification results
    await prisma.leadQualification.create({
      data: {
        leadId,
        score: analysis.score,
        approvalLikelihood: analysis.approvalLikelihood,
        riskFactors: analysis.riskFactors,
        recommendedProducts: analysis.recommendedProducts,
        requiredDocuments: analysis.requiredDocuments,
        nextSteps: analysis.nextSteps,
        qualifiedAt: new Date(),
        qualifiedBy: 'qualifying-agent',
      },
    });

    logger.info(`Lead ${leadId} qualified with score ${analysis.score}`);

    return analysis;
  }

  private prepareLeadContext(lead: any): string {
    return `
Borrower Information:
- Name: ${lead.borrower.firstName} ${lead.borrower.lastName}
- Email: ${lead.borrower.email}
- Phone: ${lead.borrower.phone}

Financial Profile:
- Annual Income: $${lead.financialProfile.annualIncome}
- Credit Score: ${lead.financialProfile.creditScore}
- Debt-to-Income Ratio: ${lead.financialProfile.dtiRatio}%
- Down Payment: $${lead.financialProfile.downPayment}

Property Details:
- Property Type: ${lead.propertyType}
- Property Value: $${lead.propertyValue}
- Loan Amount: $${lead.loanAmount}
- Loan Purpose: ${lead.loanPurpose}

Documents Submitted: ${lead.documents.map(d => d.type).join(', ')}
`;
  }

  private parseQualificationResponse(text: string): LeadQualification {
    // Parse Claude's structured response
    // Implementation depends on response format
    // Could use JSON mode or structured parsing
    return {
      score: 85,
      approvalLikelihood: 'high',
      riskFactors: [],
      recommendedProducts: [],
      requiredDocuments: [],
      nextSteps: [],
    };
  }
}
```

### Document OCR & Intelligent Extraction

**OCR Service:**
```typescript
// backend/src/services/ocr-service.ts
import Tesseract from 'tesseract.js';
import { createWorker } from 'tesseract.js';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import Anthropic from '@anthropic-ai/sdk';

export class OcrService {
  private claude: Anthropic;

  constructor() {
    this.claude = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async processDocument(filePath: string, documentType: string): Promise<DocumentData> {
    // Extract text via OCR
    const text = await this.extractText(filePath);

    // Use Claude to intelligently extract structured data
    const extractedData = await this.extractStructuredData(text, documentType);

    return extractedData;
  }

  private async extractText(filePath: string): Promise<string> {
    const worker = await createWorker();

    try {
      // Preprocess image for better OCR accuracy
      const processedImage = await sharp(filePath)
        .greyscale()
        .normalize()
        .sharpen()
        .toBuffer();

      // Perform OCR
      const { data: { text } } = await worker.recognize(processedImage);

      return text;
    } finally {
      await worker.terminate();
    }
  }

  private async extractStructuredData(text: string, documentType: string): Promise<DocumentData> {
    const message = await this.claude.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 0,
      system: `You are a document data extraction specialist. Extract structured data from ${documentType} documents.
Output JSON format with relevant fields based on document type.`,
      messages: [
        {
          role: 'user',
          content: `Extract data from this ${documentType}:\n\n${text}`,
        },
      ],
    });

    // Parse extracted data
    const extractedData = JSON.parse(message.content[0].text);

    return extractedData;
  }
}
```

### Real-Time Chat with WebSocket

**Chat Handler:**
```typescript
// backend/src/websocket/chat-handler.ts
import { Server, Socket } from 'socket.io';
import { ChatService } from '../services/chat-service';
import { QualifyingAgent } from '../agents/qualifying-agent';
import { logger } from '../lib/logger';

export class ChatHandler {
  private io: Server;
  private chatService: ChatService;
  private qualifyingAgent: QualifyingAgent;

  constructor(io: Server) {
    this.io = io;
    this.chatService = new ChatService();
    this.qualifyingAgent = new QualifyingAgent();
  }

  handleConnection(socket: Socket) {
    logger.info(`Client connected: ${socket.id}`);

    // Join lead-specific room
    socket.on('join:lead', async (leadId: string) => {
      socket.join(`lead:${leadId}`);

      // Load chat history
      const messages = await this.chatService.getChatHistory(leadId);
      socket.emit('chat:history', messages);
    });

    // Handle incoming messages
    socket.on('chat:message', async (data: { leadId: string; message: string }) => {
      try {
        // Store user message
        const userMessage = await this.chatService.saveMessage({
          leadId: data.leadId,
          role: 'user',
          content: data.message,
        });

        // Broadcast to room
        this.io.to(`lead:${data.leadId}`).emit('chat:message', userMessage);

        // Show typing indicator
        this.io.to(`lead:${data.leadId}`).emit('chat:typing', { isTyping: true });

        // Generate AI response
        const aiResponse = await this.qualifyingAgent.generateChatResponse(
          data.leadId,
          data.message
        );

        // Store AI message
        const assistantMessage = await this.chatService.saveMessage({
          leadId: data.leadId,
          role: 'assistant',
          content: aiResponse,
        });

        // Hide typing indicator and send response
        this.io.to(`lead:${data.leadId}`).emit('chat:typing', { isTyping: false });
        this.io.to(`lead:${data.leadId}`).emit('chat:message', assistantMessage);

      } catch (error) {
        logger.error('Chat message error:', error);
        socket.emit('chat:error', { message: 'Failed to process message' });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  }
}
```

**Frontend WebSocket Hook:**
```typescript
// frontend/src/hooks/useWebSocket.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useWebSocket(leadId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_WS_URL, {
      auth: {
        token: localStorage.getItem('auth_token'),
      },
    });

    newSocket.on('connect', () => {
      newSocket.emit('join:lead', leadId);
    });

    newSocket.on('chat:history', (history: ChatMessage[]) => {
      setMessages(history);
    });

    newSocket.on('chat:message', (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on('chat:typing', ({ isTyping }) => {
      setIsTyping(isTyping);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [leadId]);

  const sendMessage = (content: string) => {
    if (socket) {
      socket.emit('chat:message', { leadId, message: content });
    }
  };

  return { messages, sendMessage, isTyping };
}
```

### Compliance Checking

**Compliance Agent:**
```typescript
// backend/src/agents/compliance-agent.ts
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '../lib/prisma';

export class ComplianceAgent {
  private claude: Anthropic;

  constructor() {
    this.claude = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async checkCompliance(leadId: string): Promise<ComplianceCheckResult> {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        borrower: true,
        documents: true,
        communications: true,
      },
    });

    if (!lead) throw new Error('Lead not found');

    // Check RESPA, TRID, TILA compliance
    const message = await this.claude.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 0,
      system: `You are a mortgage compliance expert. Analyze leads for RESPA, TRID, and TILA compliance.
Check for:
- Required disclosures provided within timeframes
- Accurate fee disclosures
- Proper consent documentation
- TCPA compliance for communications
- Fair lending compliance

Output a structured JSON report with compliance status and any violations.`,
      messages: [
        {
          role: 'user',
          content: `Check compliance for this lead:\n\n${JSON.stringify(lead, null, 2)}`,
        },
      ],
    });

    const complianceResult = JSON.parse(message.content[0].text);

    // Store compliance check
    await prisma.complianceCheck.create({
      data: {
        leadId,
        respaCompliant: complianceResult.respa.compliant,
        tridCompliant: complianceResult.trid.compliant,
        tilaCompliant: complianceResult.tila.compliant,
        violations: complianceResult.violations,
        checkedAt: new Date(),
      },
    });

    return complianceResult;
  }
}
```

---

## 🐝 SWARM ORCHESTRATION

### Agent Roles for Nyra Assistant

**1. Qualifying Agent (Lead Analysis)**
- **Responsibilities**: Analyze borrower financials, assess loan eligibility, calculate qualification scores
- **AI Model**: Claude Sonnet 4.5
- **Coordination**: Share qualification results via memory

**2. Document Extraction Agent (OCR + AI)**
- **Responsibilities**: Extract text from documents, parse structured data, validate completeness
- **AI Model**: Claude Sonnet 4.5 + Tesseract OCR
- **Coordination**: Store extracted data in memory for other agents

**3. Compliance Agent (RESPA/TRID/TILA)**
- **Responsibilities**: Check regulatory compliance, flag violations, generate audit reports
- **AI Model**: Claude Sonnet 4.5
- **Coordination**: Report compliance status to routing agent

**4. Routing Agent (Lead Assignment)**
- **Responsibilities**: Score leads, assign to loan officers, prioritize pipeline
- **AI Model**: Claude Sonnet 4.5 + rule-based logic
- **Coordination**: Update CRM with assignments

**5. Chat Agent (Borrower Communication)**
- **Responsibilities**: Real-time chat responses, answer questions, collect information
- **AI Model**: Claude Sonnet 4.5 (streaming)
- **Coordination**: Update lead data based on conversations

**6. Database Agent (Data Management)**
- **Responsibilities**: CRUD operations, data validation, audit logging
- **Tools**: Prisma ORM, PostgreSQL
- **Coordination**: Provide data access layer for all agents

### Swarm Initialization

**Hierarchical Coordinator Setup:**
```bash
# Initialize hierarchical swarm (queen coordinates workers)
npx archon-os@alpha swarm init --topology hierarchical --agents 6

# Spawn agents
npx archon-os@alpha agent spawn --type qualifying-agent
npx archon-os@alpha agent spawn --type document-extractor
npx archon-os@alpha agent spawn --type compliance-checker
npx archon-os@alpha agent spawn --type routing-agent
npx archon-os@alpha agent spawn --type chat-agent
npx archon-os@alpha agent spawn --type database-agent
```

**Task Orchestration:**
```bash
# Orchestrate lead qualification workflow
npx archon-os@alpha task orchestrate \
  --task "Qualify lead and route to loan officer" \
  --priority critical \
  --strategy adaptive \
  --max-agents 6
```

---

## 🧠 MEMORY MANAGEMENT

### Store Agent Context

**Store Qualification Results:**
```bash
npx archon-os@alpha memory store \
  --key "nyra/leads/{leadId}/qualification" \
  --namespace "coordination" \
  --value '{
    "score": 85,
    "approvalLikelihood": "high",
    "riskFactors": ["high_dti"],
    "recommendedProducts": ["conventional_30yr", "fha_30yr"]
  }'
```

**Store Document Data:**
```bash
npx archon-os@alpha memory store \
  --key "nyra/leads/{leadId}/documents/paystub" \
  --namespace "document-data" \
  --value '{
    "employer": "Acme Corp",
    "grossIncome": 5000,
    "netIncome": 3750,
    "ytdGross": 50000,
    "extractedAt": "2025-01-01T00:00:00Z"
  }'
```

**Store Compliance Status:**
```bash
npx archon-os@alpha memory store \
  --key "nyra/leads/{leadId}/compliance" \
  --namespace "compliance" \
  --value '{
    "respaCompliant": true,
    "tridCompliant": true,
    "tilaCompliant": true,
    "violations": []
  }'
```

---

## 🚀 DEPLOYMENT & CI/CD

### Docker Configuration

**Backend Dockerfile:**
```dockerfile
# apps/nyra-assistant/Dockerfile.backend
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production

FROM base AS builder
WORKDIR /app
COPY backend/ ./
RUN npm ci
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nyra

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

USER nyra
EXPOSE 3001

CMD ["node", "dist/server.js"]
```

**Frontend Dockerfile:**
```dockerfile
# apps/nyra-assistant/Dockerfile.frontend
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY frontend/ ./
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Docker Compose:**
```yaml
# apps/nyra-assistant/docker-compose.yml
version: '3.9'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:80"
    environment:
      - VITE_API_URL=http://backend:3001
      - VITE_WS_URL=ws://backend:3001
    depends_on:
      - backend

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/nyra_assistant
      - REDIS_URL=redis://redis:6379
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    volumes:
      - ./uploads:/app/uploads
    depends_on:
      - db
      - redis

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=nyra_assistant
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

---

## 📊 MONITORING & ANALYTICS

**Prometheus Metrics:**
```typescript
// backend/src/lib/metrics.ts
import client from 'prom-client';

export const register = new client.Registry();

export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

export const leadQualificationDuration = new client.Histogram({
  name: 'lead_qualification_duration_seconds',
  help: 'Duration of lead qualification in seconds',
  buckets: [1, 5, 10, 30, 60],
});

export const documentOcrDuration = new client.Histogram({
  name: 'document_ocr_duration_seconds',
  help: 'Duration of document OCR in seconds',
  buckets: [1, 5, 10, 30, 60],
});

register.registerMetric(httpRequestDuration);
register.registerMetric(leadQualificationDuration);
register.registerMetric(documentOcrDuration);
```

---

## 🔒 SECURITY & COMPLIANCE

**JWT Authentication:**
```typescript
// backend/src/middleware/auth.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};
```

---

## 🔗 DEPENDENCIES & INTEGRATIONS

**Integration with Mortgage CRM:**
```typescript
// backend/src/lib/crm-client.ts
export const crmClient = {
  createLead: async (leadData: Lead) => {
    const response = await fetch(`${process.env.CRM_API_URL}/api/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CRM_API_KEY}`,
      },
      body: JSON.stringify(leadData),
    });
    return response.json();
  },
};
```

---

**Remember**: Nyra Assistant is the intelligence layer of Project-Nyra. Focus on multi-agent orchestration, real-time performance, and accurate document processing. Always coordinate agents via memory and maintain compliance audit trails.
