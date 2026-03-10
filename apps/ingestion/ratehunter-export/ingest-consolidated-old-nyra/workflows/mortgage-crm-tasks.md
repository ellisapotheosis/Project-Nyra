# Mortgage CRM - Task Breakdown

## Epic Overview

**Project**: Mortgage CRM System
**Methodology**: TDD London School + Enterprise Grade
**Total Estimated Effort**: 140 story points (10-14 weeks)
**Priority Framework**: MoSCoW

## Epic 1: Enterprise Architecture & Foundation (15 SP)

### Story 1.1: Architecture Decision Records
**Priority**: MUST HAVE
**Effort**: 3 SP
**Dependencies**: None

**Acceptance Criteria**:
- [ ] Hexagonal architecture documented
- [ ] Security model specified
- [ ] Compliance framework defined
- [ ] Technology stack decisions recorded
- [ ] ADRs stored in version control

**Technical Tasks**:
1. Create ADR template in `docs/architecture/adr-template.md`
2. Write ADR-001: Hexagonal Architecture Pattern
3. Write ADR-002: Security and Authentication (OAuth 2.0 + OIDC)
4. Write ADR-003: Compliance Framework (RESPA, TILA, HMDA)
5. Write ADR-004: Database Choice (PostgreSQL + Prisma)
6. Write ADR-005: API Design (REST + GraphQL)
7. Document key architectural constraints

### Story 1.2: Database Schema Design
**Priority**: MUST HAVE
**Effort**: 5 SP
**Dependencies**: 1.1

**Acceptance Criteria**:
- [ ] Complete ER diagram created
- [ ] All entities and relationships defined
- [ ] Prisma schema written
- [ ] Database migrations generated
- [ ] Seed data created for development

**Technical Tasks**:
1. Design core entities:
   ```prisma
   model Lead {
     id            String   @id @default(cuid())
     source        String
     status        LeadStatus
     borrowerId    String
     borrower      Borrower @relation(fields: [borrowerId], references: [id])
     propertyId    String?
     property      Property? @relation(fields: [propertyId], references: [id])
     loanRequest   LoanRequest?
     documents     Document[]
     communications Communication[]
     tasks         Task[]
     timeline      Timeline[]
     assignedToId  String?
     assignedTo    User? @relation(fields: [assignedToId], references: [id])
     createdAt     DateTime @default(now())
     updatedAt     DateTime @updatedAt

     @@index([status])
     @@index([assignedToId])
     @@index([createdAt])
   }

   model Borrower {
     id            String   @id @default(cuid())
     // Personal Info
     firstName     String
     lastName      String
     email         String   @unique
     phone         String
     ssn           String   @unique  // Encrypted
     dateOfBirth   DateTime
     // Employment
     employmentStatus String
     employer      String?
     jobTitle      String?
     yearsEmployed Float?
     annualIncome  Float?
     // Financials
     creditScore   Int?
     assets        Asset[]
     liabilities   Liability[]
     // Relations
     leads         Lead[]
     applications  LoanApplication[]
     createdAt     DateTime @default(now())
     updatedAt     DateTime @updatedAt

     @@index([email])
   }

   model LoanApplication {
     id              String   @id @default(cuid())
     leadId          String
     lead            Lead @relation(fields: [leadId], references: [id])
     borrowerId      String
     borrower        Borrower @relation(fields: [borrowerId], references: [id])
     loanType        LoanType
     amount          Float
     term            Int      // in months
     rate            Float
     productId       String
     product         LoanProduct @relation(fields: [productId], references: [id])
     status          ApplicationStatus
     milestones      Milestone[]
     conditions      Condition[]
     disclosures     Disclosure[]
     ausResponse     AUSResponse?
     createdAt       DateTime @default(now())
     updatedAt       DateTime @updatedAt
     submittedAt     DateTime?
     approvedAt      DateTime?
     fundedAt        DateTime?

     @@index([status])
     @@index([borrowerId])
     @@index([createdAt])
   }

   enum LeadStatus {
     NEW
     CONTACTED
     QUALIFIED
     PRE_APPROVED
     APPLICATION
     PROCESSING
     UNDERWRITING
     APPROVED
     CLOSING
     FUNDED
     CLOSED
     LOST
   }

   enum ApplicationStatus {
     DRAFT
     SUBMITTED
     PROCESSING
     UNDERWRITING
     APPROVED
     CONDITIONALLY_APPROVED
     DENIED
     WITHDRAWN
   }
   ```

2. Create indexes for performance
3. Setup audit trail tables
4. Generate initial migration
5. Create seed data script

### Story 1.3: Security Infrastructure
**Priority**: MUST HAVE
**Effort**: 4 SP
**Dependencies**: 1.1

**Acceptance Criteria**:
- [ ] Authentication service integrated (Auth0/Clerk)
- [ ] RBAC middleware implemented
- [ ] Field-level encryption working
- [ ] Audit logging functional
- [ ] Security tests passing

**Technical Tasks**:
1. Integrate Auth0 or Clerk:
   ```typescript
   // auth.service.ts
   import { auth } from "@clerk/nextjs";

   export class AuthService {
     async getCurrentUser(): Promise<User | null> {
       const { userId } = auth();
       if (!userId) return null;

       return await prisma.user.findUnique({
         where: { clerkId: userId },
         include: { role: true }
       });
     }

     async requireAuth(): Promise<User> {
       const user = await this.getCurrentUser();
       if (!user) {
         throw new UnauthorizedError("Authentication required");
       }
       return user;
     }

     async requireRole(allowedRoles: Role[]): Promise<User> {
       const user = await this.requireAuth();
       if (!allowedRoles.includes(user.role.name)) {
         throw new ForbiddenError("Insufficient permissions");
       }
       return user;
     }
   }
   ```

2. Implement RBAC middleware:
   ```typescript
   export function requireRole(...roles: Role[]) {
     return async (req: Request, res: Response, next: NextFunction) => {
       try {
         await authService.requireRole(roles);
         next();
       } catch (error) {
         if (error instanceof UnauthorizedError) {
           return res.status(401).json({ error: error.message });
         }
         if (error instanceof ForbiddenError) {
           return res.status(403).json({ error: error.message });
         }
         next(error);
       }
     };
   }

   // Usage
   router.post("/api/leads", requireRole("loan_officer", "admin"), createLead);
   ```

3. Implement field-level encryption:
   ```typescript
   import { createCipheriv, createDecipheriv } from "crypto";

   class EncryptionService {
     private algorithm = "aes-256-gcm";
     private key = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");

     encrypt(text: string): string {
       const iv = crypto.randomBytes(16);
       const cipher = createCipheriv(this.algorithm, this.key, iv);

       let encrypted = cipher.update(text, "utf8", "hex");
       encrypted += cipher.final("hex");

       const authTag = cipher.getAuthTag();

       return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
     }

     decrypt(encryptedText: string): string {
       const [ivHex, authTagHex, encrypted] = encryptedText.split(":");

       const iv = Buffer.from(ivHex, "hex");
       const authTag = Buffer.from(authTagHex, "hex");

       const decipher = createDecipheriv(this.algorithm, this.key, iv);
       decipher.setAuthTag(authTag);

       let decrypted = decipher.update(encrypted, "hex", "utf8");
       decrypted += decipher.final("utf8");

       return decrypted;
     }
   }

   // Prisma middleware for auto-encryption
   prisma.$use(async (params, next) => {
     if (params.model === "Borrower") {
       if (params.action === "create" || params.action === "update") {
         if (params.args.data.ssn) {
           params.args.data.ssn = encryptionService.encrypt(
             params.args.data.ssn
           );
         }
       }

       const result = await next(params);

       if (params.action === "findUnique" || params.action === "findMany") {
         if (result?.ssn) {
           result.ssn = encryptionService.decrypt(result.ssn);
         }
       }

       return result;
     }

     return next(params);
   });
   ```

4. Implement audit logging:
   ```typescript
   class AuditLogger {
     async log(event: AuditEvent): Promise<void> {
       await prisma.auditLog.create({
         data: {
           userId: event.userId,
           action: event.action,
           entityType: event.entityType,
           entityId: event.entityId,
           changes: event.changes,
           ipAddress: event.ipAddress,
           userAgent: event.userAgent,
           timestamp: new Date()
         }
       });
     }
   }

   // Middleware for automatic audit logging
   export function auditLog(action: string) {
     return async (req: Request, res: Response, next: NextFunction) => {
       const originalSend = res.send;

       res.send = function (data) {
         auditLogger.log({
           userId: req.user?.id,
           action,
           entityType: req.params.entityType,
           entityId: req.params.id,
           changes: req.body,
           ipAddress: req.ip,
           userAgent: req.get("user-agent")
         });

         return originalSend.call(this, data);
       };

       next();
     };
   }
   ```

### Story 1.4: CI/CD Pipeline Setup
**Priority**: MUST HAVE
**Effort**: 3 SP
**Dependencies**: 1.2

**Acceptance Criteria**:
- [ ] GitHub Actions workflow created
- [ ] Automated testing on PR
- [ ] Database migrations in pipeline
- [ ] Deployment to staging automated
- [ ] Production deployment with approval

**Technical Tasks**:
1. Create `.github/workflows/ci.yml`:
   ```yaml
   name: CI/CD

   on:
     pull_request:
       branches: [main, develop]
     push:
       branches: [main, develop]

   jobs:
     lint:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: "20"
         - run: npm ci
         - run: npm run lint
         - run: npm run typecheck

     test:
       runs-on: ubuntu-latest
       services:
         postgres:
           image: postgres:16
           env:
             POSTGRES_PASSWORD: postgres
           options: >-
             --health-cmd pg_isready
             --health-interval 10s
             --health-timeout 5s
             --health-retries 5
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
         - run: npm ci
         - run: npm run prisma:generate
         - run: npm run prisma:migrate:test
         - run: npm run test:unit
         - run: npm run test:integration

     security:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - run: npm audit --production
         - uses: snyk/actions/node@master
           env:
             SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

     deploy_staging:
       needs: [lint, test, security]
       if: github.ref == 'refs/heads/develop'
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Deploy to Staging
           run: |
             # Deploy to staging environment
             echo "Deploying to staging..."

     deploy_production:
       needs: [lint, test, security]
       if: github.ref == 'refs/heads/main'
       runs-on: ubuntu-latest
       environment:
         name: production
         url: https://app.mortgage-crm.com
       steps:
         - uses: actions/checkout@v3
         - name: Deploy to Production
           run: |
             # Deploy to production
             echo "Deploying to production..."
   ```

## Epic 2: Core Domain - TDD Implementation (35 SP)

### Story 2.1: Lead Management Domain (TDD Cycle 1)
**Priority**: MUST HAVE
**Effort**: 10 SP
**Dependencies**: 1.2

**Acceptance Criteria**:
- [ ] Lead entity with all business rules
- [ ] State machine for lead lifecycle
- [ ] Lead assignment logic
- [ ] Lead qualification rules
- [ ] Test coverage > 90%

**TDD Workflow**:

**Step 1: Write Acceptance Test (Outside-In)**
```typescript
// tests/use-cases/create-lead.test.ts
describe("CreateLeadUseCase", () => {
  let useCase: CreateLeadUseCase;
  let mockLeadRepo: jest.Mocked<ILeadRepository>;
  let mockNotificationService: jest.Mocked<INotificationService>;
  let mockLeadAssigner: jest.Mocked<ILeadAssigner>;

  beforeEach(() => {
    mockLeadRepo = createMockLeadRepo();
    mockNotificationService = createMockNotificationService();
    mockLeadAssigner = createMockLeadAssigner();

    useCase = new CreateLeadUseCase(
      mockLeadRepo,
      mockNotificationService,
      mockLeadAssigner
    );
  });

  it("should create a new lead from web form submission", async () => {
    // Arrange
    const leadData = {
      source: "website",
      borrower: {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "5551234567"
      },
      loanRequest: {
        amount: 350000,
        propertyType: "single_family",
        zipCode: "90210"
      }
    };

    mockLeadAssigner.assign.mockResolvedValue({
      loanOfficerId: "officer-123",
      reason: "round_robin"
    });

    // Act
    const result = await useCase.execute(leadData);

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(result.value.lead.status).toBe(LeadStatus.NEW);
    expect(mockLeadRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        status: LeadStatus.NEW,
        source: "website"
      })
    );
    expect(mockLeadAssigner.assign).toHaveBeenCalled();
    expect(mockNotificationService.notifyLoanOfficer).toHaveBeenCalledWith(
      "officer-123",
      expect.any(Object)
    );
  });

  it("should return failure for invalid lead data", async () => {
    const invalidData = {
      source: "website",
      borrower: {
        firstName: "",  // Invalid: empty name
        lastName: "Doe",
        email: "invalid-email",  // Invalid: bad format
        phone: "555"  // Invalid: too short
      }
    };

    const result = await useCase.execute(invalidData);

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain("validation");
    expect(mockLeadRepo.save).not.toHaveBeenCalled();
  });
});
```

**Step 2: Implement Use Case (Make Test Pass)**
```typescript
// src/use-cases/create-lead.use-case.ts
export class CreateLeadUseCase {
  constructor(
    private leadRepo: ILeadRepository,
    private notificationService: INotificationService,
    private leadAssigner: ILeadAssigner
  ) {}

  async execute(data: CreateLeadDTO): Promise<Result<{ lead: Lead }>> {
    // Validate input
    const validationResult = this.validate(data);
    if (validationResult.isFailure) {
      return Result.fail(validationResult.error);
    }

    // Create lead entity
    const leadOrError = Lead.create({
      source: data.source,
      status: LeadStatus.NEW,
      borrower: data.borrower,
      loanRequest: data.loanRequest
    });

    if (leadOrError.isFailure) {
      return Result.fail(leadOrError.error);
    }

    const lead = leadOrError.value;

    // Assign to loan officer
    const assignment = await this.leadAssigner.assign(lead);
    lead.assignTo(assignment.loanOfficerId);

    // Save to repository
    await this.leadRepo.save(lead);

    // Send notification
    await this.notificationService.notifyLoanOfficer(
      assignment.loanOfficerId,
      {
        leadId: lead.id,
        borrowerName: lead.borrowerName,
        loanAmount: lead.loanRequest.amount
      }
    );

    return Result.ok({ lead });
  }

  private validate(data: CreateLeadDTO): Result<void> {
    const errors: string[] = [];

    if (!data.borrower.firstName || data.borrower.firstName.trim() === "") {
      errors.push("First name is required");
    }

    if (!this.isValidEmail(data.borrower.email)) {
      errors.push("Invalid email address");
    }

    if (!this.isValidPhone(data.borrower.phone)) {
      errors.push("Invalid phone number");
    }

    if (errors.length > 0) {
      return Result.fail(`Validation errors: ${errors.join(", ")}`);
    }

    return Result.ok();
  }
}
```

**Step 3: Test Domain Entity (Inside)**
```typescript
// tests/domain/lead.entity.test.ts
describe("Lead Entity", () => {
  describe("creation", () => {
    it("should create a valid lead", () => {
      const result = Lead.create({
        source: "website",
        status: LeadStatus.NEW,
        borrower: createValidBorrower(),
        loanRequest: createValidLoanRequest()
      });

      expect(result.isSuccess).toBe(true);
      expect(result.value.status).toBe(LeadStatus.NEW);
    });

    it("should fail for invalid borrower data", () => {
      const result = Lead.create({
        source: "website",
        status: LeadStatus.NEW,
        borrower: { firstName: "", lastName: "Doe" }, // Invalid
        loanRequest: createValidLoanRequest()
      });

      expect(result.isFailure).toBe(true);
    });
  });

  describe("state transitions", () => {
    it("should transition from NEW to CONTACTED", () => {
      const lead = createLead({ status: LeadStatus.NEW });

      const result = lead.markAsContacted({
        method: "phone",
        notes: "Left voicemail",
        contactedBy: "officer-123"
      });

      expect(result.isSuccess).toBe(true);
      expect(lead.status).toBe(LeadStatus.CONTACTED);
      expect(lead.lastContactedAt).toBeDefined();
    });

    it("should not allow invalid state transitions", () => {
      const lead = createLead({ status: LeadStatus.NEW });

      const result = lead.markAsApproved(); // Invalid: can't go from NEW to APPROVED

      expect(result.isFailure).toBe(true);
      expect(lead.status).toBe(LeadStatus.NEW); // Unchanged
    });

    it("should transition from QUALIFIED to PRE_APPROVED", () => {
      const lead = createLead({ status: LeadStatus.QUALIFIED });

      const result = lead.markAsPreApproved({
        amount: 350000,
        rate: 6.5,
        expiresAt: addDays(90)
      });

      expect(result.isSuccess).toBe(true);
      expect(lead.status).toBe(LeadStatus.PRE_APPROVED);
    });
  });

  describe("business rules", () => {
    it("should require contact within 15 minutes for web leads", () => {
      const lead = createLead({
        source: "website",
        createdAt: subtractMinutes(20)
      });

      expect(lead.isOverdueForContact()).toBe(true);
      expect(lead.minutesUntilOverdue()).toBe(-5);
    });

    it("should calculate lead score based on factors", () => {
      const lead = createLead({
        loanRequest: {
          amount: 500000,  // High amount = +10
          creditScore: 750 // Excellent credit = +20
        },
        source: "referral" // Referral = +15
      });

      expect(lead.calculateScore()).toBe(45);
    });

    it("should qualify lead if score > 30", () => {
      const lead = createLead({ /* score will be 45 */ });

      expect(lead.isQualified()).toBe(true);
    });
  });
});
```

**Step 4: Implement Domain Entity**
```typescript
// src/domain/lead.entity.ts
export class Lead extends AggregateRoot<LeadProps> {
  private constructor(props: LeadProps, id?: string) {
    super(props, id);
  }

  static create(props: CreateLeadProps): Result<Lead> {
    // Validate props
    if (!props.borrower?.firstName || props.borrower.firstName.trim() === "") {
      return Result.fail("Borrower first name is required");
    }

    if (!props.loanRequest?.amount || props.loanRequest.amount < 50000) {
      return Result.fail("Loan amount must be at least $50,000");
    }

    // Create entity
    return Result.ok(
      new Lead({
        ...props,
        status: LeadStatus.NEW,
        createdAt: new Date(),
        timeline: []
      })
    );
  }

  // State transitions
  markAsContacted(contactInfo: ContactInfo): Result<void> {
    if (!this.canTransitionTo(LeadStatus.CONTACTED)) {
      return Result.fail("Cannot transition to CONTACTED from current state");
    }

    this.props.status = LeadStatus.CONTACTED;
    this.props.lastContactedAt = new Date();
    this.props.timeline.push({
      event: "contacted",
      timestamp: new Date(),
      ...contactInfo
    });

    this.addDomainEvent(new LeadContactedEvent(this));

    return Result.ok();
  }

  markAsQualified(qualificationData: QualificationData): Result<void> {
    if (!this.canTransitionTo(LeadStatus.QUALIFIED)) {
      return Result.fail("Cannot transition to QUALIFIED from current state");
    }

    if (!this.isQualified()) {
      return Result.fail("Lead does not meet qualification criteria");
    }

    this.props.status = LeadStatus.QUALIFIED;
    this.props.qualificationData = qualificationData;

    this.addDomainEvent(new LeadQualifiedEvent(this));

    return Result.ok();
  }

  markAsPreApproved(preApprovalData: PreApprovalData): Result<void> {
    if (!this.canTransitionTo(LeadStatus.PRE_APPROVED)) {
      return Result.fail("Cannot transition to PRE_APPROVED from current state");
    }

    this.props.status = LeadStatus.PRE_APPROVED;
    this.props.preApprovalData = preApprovalData;

    this.addDomainEvent(new LeadPreApprovedEvent(this));

    return Result.ok();
  }

  // Business rules
  isQualified(): boolean {
    return this.calculateScore() > 30;
  }

  calculateScore(): number {
    let score = 0;

    // Loan amount factor
    if (this.props.loanRequest.amount > 400000) {
      score += 10;
    } else if (this.props.loanRequest.amount > 200000) {
      score += 5;
    }

    // Credit score factor
    if (this.props.loanRequest.creditScore) {
      if (this.props.loanRequest.creditScore > 740) {
        score += 20;
      } else if (this.props.loanRequest.creditScore > 680) {
        score += 10;
      } else if (this.props.loanRequest.creditScore > 620) {
        score += 5;
      }
    }

    // Source factor
    const sourceScores: Record<string, number> = {
      referral: 15,
      partner: 10,
      website: 5,
      cold_call: 2
    };
    score += sourceScores[this.props.source] || 0;

    return score;
  }

  isOverdueForContact(): boolean {
    const now = Date.now();
    const created = this.props.createdAt.getTime();
    const elapsed = now - created;

    // Web leads must be contacted within 15 minutes
    if (this.props.source === "website") {
      return elapsed > 15 * 60 * 1000;
    }

    // Other leads within 1 hour
    return elapsed > 60 * 60 * 1000;
  }

  minutesUntilOverdue(): number {
    const now = Date.now();
    const created = this.props.createdAt.getTime();
    const elapsed = (now - created) / (60 * 1000); // minutes

    const deadline = this.props.source === "website" ? 15 : 60;

    return Math.ceil(deadline - elapsed);
  }

  // State machine
  private canTransitionTo(newStatus: LeadStatus): boolean {
    const validTransitions: Record<LeadStatus, LeadStatus[]> = {
      [LeadStatus.NEW]: [LeadStatus.CONTACTED, LeadStatus.LOST],
      [LeadStatus.CONTACTED]: [LeadStatus.QUALIFIED, LeadStatus.LOST],
      [LeadStatus.QUALIFIED]: [
        LeadStatus.PRE_APPROVED,
        LeadStatus.APPLICATION,
        LeadStatus.LOST
      ],
      [LeadStatus.PRE_APPROVED]: [LeadStatus.APPLICATION, LeadStatus.LOST],
      [LeadStatus.APPLICATION]: [LeadStatus.PROCESSING],
      [LeadStatus.PROCESSING]: [LeadStatus.UNDERWRITING, LeadStatus.LOST],
      [LeadStatus.UNDERWRITING]: [
        LeadStatus.APPROVED,
        LeadStatus.CONDITIONALLY_APPROVED,
        LeadStatus.LOST
      ],
      [LeadStatus.APPROVED]: [LeadStatus.CLOSING],
      [LeadStatus.CLOSING]: [LeadStatus.FUNDED, LeadStatus.LOST],
      [LeadStatus.FUNDED]: [LeadStatus.CLOSED],
      [LeadStatus.CLOSED]: [],
      [LeadStatus.LOST]: []
    };

    return validTransitions[this.props.status]?.includes(newStatus) ?? false;
  }

  // Getters
  get status(): LeadStatus {
    return this.props.status;
  }

  get borrowerName(): string {
    return `${this.props.borrower.firstName} ${this.props.borrower.lastName}`;
  }

  get lastContactedAt(): Date | undefined {
    return this.props.lastContactedAt;
  }
}
```

**Technical Tasks for Story 2.1**:
1. Write acceptance tests for create lead use case
2. Implement CreateLeadUseCase
3. Write domain tests for Lead entity
4. Implement Lead entity with state machine
5. Write tests for LeadAssigner service
6. Implement LeadAssigner (round-robin, territory-based)
7. Write tests for lead qualification rules
8. Implement lead scoring algorithm
9. Create mock implementations for all interfaces
10. Achieve >90% test coverage

### Story 2.2: Loan Application Domain (TDD Cycle 2)
**Priority**: MUST HAVE
**Effort**: 10 SP
**Dependencies**: 2.1

**Acceptance Criteria**:
- [ ] Loan application entity complete
- [ ] Application submission workflow
- [ ] Document requirements generation
- [ ] AUS integration (mocked)
- [ ] Test coverage > 90%

**Technical Tasks**:
1. Write acceptance tests for SubmitApplicationUseCase
2. Implement application submission workflow
3. Write tests for LoanApplication entity
4. Implement LoanApplication with status transitions
5. Write tests for DocumentRequirementsGenerator
6. Implement document requirements based on loan type
7. Mock AUS integration (Desktop Underwriter / Loan Prospector)
8. Write tests for AUS response handling
9. Implement condition management
10. Achieve >90% test coverage

### Story 2.3: Compliance Engine (TDD Cycle 3)
**Priority**: MUST HAVE
**Effort**: 10 SP
**Dependencies**: 2.2

**Acceptance Criteria**:
- [ ] Loan Estimate generation working
- [ ] Closing Disclosure generation working
- [ ] 3-day timing rules enforced
- [ ] HMDA data collection automated
- [ ] Test coverage > 90%

**Technical Tasks**:
1. Write tests for LE generation
2. Implement Loan Estimate generator
3. Write tests for CD generation
4. Implement Closing Disclosure generator
5. Write tests for timing rules
6. Implement 3-day rule enforcement
7. Write tests for HMDA data collection
8. Implement HMDA LAR generation
9. Write tests for adverse action notices
10. Implement automated notice generation

### Story 2.4: Document Management Domain
**Priority**: MUST HAVE
**Effort**: 5 SP
**Dependencies**: 2.2

**Acceptance Criteria**:
- [ ] Document upload and storage
- [ ] Document categorization
- [ ] Document versioning
- [ ] E-signature integration (mocked)
- [ ] Test coverage > 85%

## Epic 3: API & Integration Layer (25 SP)

### Story 3.1: REST API Endpoints (TDD)
**Priority**: MUST HAVE
**Effort**: 10 SP
**Dependencies**: 2.1, 2.2, 2.3

**Acceptance Criteria**:
- [ ] All CRUD endpoints for leads
- [ ] All CRUD endpoints for applications
- [ ] Pipeline management endpoints
- [ ] Document upload/download endpoints
- [ ] API tests passing (>90% coverage)

### Story 3.2: GraphQL API (Optional)
**Priority**: SHOULD HAVE
**Effort**: 5 SP
**Dependencies**: 3.1

**Acceptance Criteria**:
- [ ] GraphQL schema defined
- [ ] Queries for complex data fetching
- [ ] Mutations for create/update operations
- [ ] Real-time subscriptions (WebSockets)
- [ ] GraphQL tests passing

### Story 3.3: External Service Integration
**Priority**: MUST HAVE
**Effort**: 10 SP
**Dependencies**: 2.2

**Acceptance Criteria**:
- [ ] Credit bureau integration (mocked first, then real)
- [ ] AUS integration working
- [ ] E-signature service integrated
- [ ] Document storage (S3/Azure Blob)
- [ ] Integration tests passing

## Epic 4: Frontend Application (30 SP)

### Story 4.1: Loan Officer Dashboard
**Priority**: MUST HAVE
**Effort**: 10 SP
**Dependencies**: 3.1

**Acceptance Criteria**:
- [ ] Pipeline kanban board
- [ ] Lead list with filters/search
- [ ] Task management
- [ ] Real-time notifications
- [ ] Component tests passing

### Story 4.2: Borrower Portal
**Priority**: SHOULD HAVE
**Effort**: 8 SP
**Dependencies**: 3.1

**Acceptance Criteria**:
- [ ] Application status tracking
- [ ] Document upload interface
- [ ] Communication with loan officer
- [ ] E-signature workflow
- [ ] Responsive design

### Story 4.3: Admin Panel
**Priority**: MUST HAVE
**Effort**: 8 SP
**Dependencies**: 3.1

**Acceptance Criteria**:
- [ ] User management
- [ ] Role/permission management
- [ ] System configuration
- [ ] Audit log viewer
- [ ] Reporting dashboard

### Story 4.4: Reporting & Analytics
**Priority**: SHOULD HAVE
**Effort**: 4 SP
**Dependencies**: 3.1

**Acceptance Criteria**:
- [ ] Pipeline metrics dashboard
- [ ] Conversion funnel reports
- [ ] Performance reports by loan officer
- [ ] Commission tracking
- [ ] Exportable reports (CSV, PDF)

## Epic 5: Enterprise Features & Polish (20 SP)

### Story 5.1: Workflow Automation
**Priority**: SHOULD HAVE
**Effort**: 8 SP
**Dependencies**: 2.1, 2.2, 3.1

**Acceptance Criteria**:
- [ ] Rule-based automation engine
- [ ] Auto-assignment rules
- [ ] Auto-email triggers
- [ ] Task auto-generation
- [ ] Workflow tests passing

### Story 5.2: Advanced Reporting
**Priority**: SHOULD HAVE
**Effort**: 6 SP
**Dependencies**: 4.4

**Acceptance Criteria**:
- [ ] Custom report builder
- [ ] Scheduled report generation
- [ ] Report templates
- [ ] Data visualization library
- [ ] Export functionality

### Story 5.3: Performance Optimization
**Priority**: MUST HAVE
**Effort**: 6 SP
**Dependencies**: All previous

**Acceptance Criteria**:
- [ ] API response times < 500ms (p95)
- [ ] Database query optimization
- [ ] Caching strategy implemented
- [ ] Background job processing
- [ ] Load testing passed

## Epic 6: Testing & Compliance Audit (15 SP)

### Story 6.1: Comprehensive QA Testing
**Priority**: MUST HAVE
**Effort**: 6 SP
**Dependencies**: All previous

**Acceptance Criteria**:
- [ ] All functional tests passing
- [ ] All integration tests passing
- [ ] E2E test suite complete
- [ ] No critical bugs
- [ ] Test coverage > 85%

### Story 6.2: Security Audit
**Priority**: MUST HAVE
**Effort**: 4 SP
**Dependencies**: All previous

**Acceptance Criteria**:
- [ ] Penetration testing passed
- [ ] Vulnerability scan clean
- [ ] Security best practices verified
- [ ] Compliance checklist complete
- [ ] SOC 2 Type II preparation

### Story 6.3: Compliance Verification
**Priority**: MUST HAVE
**Effort**: 5 SP
**Dependencies**: 2.3

**Acceptance Criteria**:
- [ ] RESPA compliance verified
- [ ] TILA compliance verified
- [ ] HMDA reporting tested
- [ ] Audit trail completeness verified
- [ ] Legal review completed

## Summary

### Total Effort: 140 Story Points (10-14 weeks)

| Epic | Story Points | Percentage | Duration |
|------|--------------|------------|----------|
| 1. Architecture & Foundation | 15 SP | 11% | 2 weeks |
| 2. Core Domain (TDD) | 35 SP | 25% | 3 weeks |
| 3. API & Integration | 25 SP | 18% | 2 weeks |
| 4. Frontend Application | 30 SP | 21% | 3 weeks |
| 5. Enterprise Features | 20 SP | 14% | 2 weeks |
| 6. Testing & Audit | 15 SP | 11% | 2 weeks |
| **Total** | **140 SP** | **100%** | **10-14 weeks** |

### Priority Breakdown

- **MUST HAVE**: 105 SP (75%)
- **SHOULD HAVE**: 35 SP (25%)
- **COULD HAVE**: 0 SP (0%)

### Critical Path

1. Architecture & Security (1.1, 1.2, 1.3)
2. Lead Domain (2.1)
3. Application Domain (2.2)
4. Compliance Engine (2.3)
5. API Layer (3.1)
6. Frontend (4.1)
7. Testing & Compliance (6.1, 6.3)

### Risk Mitigation

**Critical Risks**:
1. Data breach → Field-level encryption, security audit
2. Compliance violation → Automated checks, legal review
3. Data loss → Daily backups, point-in-time recovery
4. System downtime → High availability, health monitoring
5. Integration failures → Circuit breakers, fallback mechanisms
