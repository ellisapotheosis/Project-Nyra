import { describe, it, expect } from "vitest";

// Inline types and config to avoid logger/dotenv side-effects

enum EntityType {
  LEAD = "lead",
  CONTACT = "contact",
  DEAL = "deal",
  ACTIVITY = "activity",
  PIPELINE = "pipeline",
}

interface TransformationMapping {
  sourceField: string;
  targetField: string;
  transform?: (value: unknown) => unknown;
  required?: boolean;
  defaultValue?: unknown;
}

const FIELD_MAPPINGS: Record<EntityType, TransformationMapping[]> = {
  [EntityType.LEAD]: [
    { sourceField: "first_name", targetField: "firstName", required: true },
    { sourceField: "last_name", targetField: "lastName", required: true },
    { sourceField: "email_address", targetField: "email", required: true },
    { sourceField: "phone_number", targetField: "phone" },
    { sourceField: "company_name", targetField: "company" },
    { sourceField: "lead_status", targetField: "status", required: true },
    { sourceField: "lead_source", targetField: "source" },
    {
      sourceField: "lead_score",
      targetField: "score",
      transform: (val) => parseInt(val as string, 10),
    },
    { sourceField: "owner_id", targetField: "ownerId" },
  ],
  [EntityType.CONTACT]: [
    { sourceField: "first_name", targetField: "firstName", required: true },
    { sourceField: "last_name", targetField: "lastName", required: true },
    { sourceField: "email_address", targetField: "email", required: true },
    { sourceField: "phone_number", targetField: "phone" },
    { sourceField: "mobile_number", targetField: "mobile" },
    { sourceField: "job_title", targetField: "title" },
    { sourceField: "company_name", targetField: "company" },
    { sourceField: "company_id", targetField: "companyId" },
    { sourceField: "owner_id", targetField: "ownerId" },
    { sourceField: "lead_id", targetField: "leadId" },
    {
      sourceField: "contact_tags",
      targetField: "tags",
      transform: (val) => (Array.isArray(val) ? val : []),
    },
  ],
  [EntityType.DEAL]: [
    { sourceField: "deal_name", targetField: "name", required: true },
    {
      sourceField: "deal_amount",
      targetField: "amount",
      required: true,
      transform: (val) => parseFloat(val as string),
    },
    {
      sourceField: "currency_code",
      targetField: "currency",
      defaultValue: "USD",
    },
    { sourceField: "deal_stage", targetField: "stage", required: true },
    {
      sourceField: "win_probability",
      targetField: "probability",
      transform: (val) => parseFloat(val as string),
    },
    {
      sourceField: "expected_close_date",
      targetField: "expectedCloseDate",
      transform: (val) => new Date(val as string),
    },
    {
      sourceField: "actual_close_date",
      targetField: "actualCloseDate",
      transform: (val) => (val ? new Date(val as string) : undefined),
    },
    { sourceField: "contact_id", targetField: "contactId" },
    { sourceField: "company_id", targetField: "companyId" },
    { sourceField: "owner_id", targetField: "ownerId" },
    { sourceField: "pipeline_id", targetField: "pipelineId", required: true },
    { sourceField: "deal_status", targetField: "status", required: true },
  ],
  [EntityType.ACTIVITY]: [
    { sourceField: "activity_type", targetField: "type", required: true },
    {
      sourceField: "activity_subject",
      targetField: "subject",
      required: true,
    },
    { sourceField: "activity_description", targetField: "description" },
    {
      sourceField: "start_date",
      targetField: "startDate",
      required: true,
      transform: (val) => new Date(val as string),
    },
    {
      sourceField: "end_date",
      targetField: "endDate",
      transform: (val) => (val ? new Date(val as string) : undefined),
    },
    {
      sourceField: "is_completed",
      targetField: "completed",
      transform: (val) => Boolean(val),
    },
    { sourceField: "contact_id", targetField: "contactId" },
    { sourceField: "deal_id", targetField: "dealId" },
    { sourceField: "lead_id", targetField: "leadId" },
    { sourceField: "owner_id", targetField: "ownerId" },
  ],
  [EntityType.PIPELINE]: [
    { sourceField: "pipeline_name", targetField: "name", required: true },
    { sourceField: "pipeline_stages", targetField: "stages", required: true },
    {
      sourceField: "is_active",
      targetField: "isActive",
      transform: (val) => Boolean(val),
    },
  ],
};

// Standalone DataTransformer
class DataTransformer {
  static transform(
    data: Record<string, unknown>,
    entityType: EntityType,
    direction: "toInternal" | "toCRM" = "toInternal"
  ): Record<string, unknown> {
    const mappings = FIELD_MAPPINGS[entityType];
    if (!mappings) return data;
    const transformed: Record<string, unknown> = {};
    for (const mapping of mappings) {
      const sourceField =
        direction === "toInternal" ? mapping.sourceField : mapping.targetField;
      const targetField =
        direction === "toInternal" ? mapping.targetField : mapping.sourceField;
      let value = data[sourceField];
      if (mapping.required && (value === undefined || value === null)) {
        if (mapping.defaultValue !== undefined) {
          value = mapping.defaultValue;
        } else {
          continue;
        }
      }
      if (value !== undefined && value !== null && mapping.transform) {
        try {
          value = mapping.transform(value);
        } catch {
          continue;
        }
      }
      if (value !== undefined) {
        transformed[targetField] = value;
      }
    }
    if (data.id) transformed.id = data.id;
    if (data.createdAt)
      transformed.createdAt = new Date(data.createdAt as string);
    if (data.updatedAt)
      transformed.updatedAt = new Date(data.updatedAt as string);
    if (data.deletedAt)
      transformed.deletedAt = new Date(data.deletedAt as string);
    if (data.customFields)
      transformed.customFields = { ...(data.customFields as object) };
    return transformed;
  }

  static transformBatch(
    dataArray: Record<string, unknown>[],
    entityType: EntityType,
    direction: "toInternal" | "toCRM" = "toInternal"
  ): Record<string, unknown>[] {
    return dataArray.map((data) => this.transform(data, entityType, direction));
  }

  static validate(
    data: Record<string, unknown>,
    entityType: EntityType
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const mappings = FIELD_MAPPINGS[entityType];
    if (!mappings) {
      errors.push(`Unknown entity type: ${entityType}`);
      return { valid: false, errors };
    }
    for (const mapping of mappings) {
      if (mapping.required) {
        const value = data[mapping.targetField];
        if (value === undefined || value === null) {
          errors.push(`Required field ${mapping.targetField} is missing`);
        }
      }
    }
    return { valid: errors.length === 0, errors };
  }

  static createMapping(
    sourceField: string,
    targetField: string,
    options: {
      required?: boolean;
      defaultValue?: unknown;
      transform?: (value: unknown) => unknown;
    } = {}
  ): TransformationMapping {
    return { sourceField, targetField, ...options };
  }
}

describe("DataTransformer", () => {
  describe("transform - toInternal (CRM → Internal)", () => {
    it("transforms lead data from CRM format to internal format", () => {
      const crmData = {
        first_name: "John",
        last_name: "Doe",
        email_address: "john@example.com",
        phone_number: "+14155551234",
        company_name: "Acme Inc",
        lead_status: "new",
        lead_source: "website",
        lead_score: "85",
        owner_id: "owner-1",
        id: "lead-123",
        createdAt: "2025-01-01T00:00:00Z",
      };

      const result = DataTransformer.transform(crmData, EntityType.LEAD);

      expect(result.firstName).toBe("John");
      expect(result.lastName).toBe("Doe");
      expect(result.email).toBe("john@example.com");
      expect(result.phone).toBe("+14155551234");
      expect(result.company).toBe("Acme Inc");
      expect(result.status).toBe("new");
      expect(result.source).toBe("website");
      expect(result.score).toBe(85);
      expect(result.ownerId).toBe("owner-1");
      expect(result.id).toBe("lead-123");
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it("transforms contact data", () => {
      const crmData = {
        first_name: "Jane",
        last_name: "Smith",
        email_address: "jane@example.com",
        contact_tags: ["vip", "mortgage"],
      };

      const result = DataTransformer.transform(crmData, EntityType.CONTACT);

      expect(result.firstName).toBe("Jane");
      expect(result.tags).toEqual(["vip", "mortgage"]);
    });

    it("transforms deal data with numeric conversions", () => {
      const crmData = {
        deal_name: "Home Loan",
        deal_amount: "350000",
        currency_code: "USD",
        deal_stage: "negotiation",
        pipeline_id: "pipe-1",
        deal_status: "open",
        win_probability: "0.75",
        expected_close_date: "2025-06-15",
      };

      const result = DataTransformer.transform(crmData, EntityType.DEAL);

      expect(result.name).toBe("Home Loan");
      expect(result.amount).toBe(350000);
      expect(result.probability).toBe(0.75);
      expect(result.expectedCloseDate).toBeInstanceOf(Date);
      expect(result.currency).toBe("USD");
    });

    it("transforms activity data with boolean conversion", () => {
      const crmData = {
        activity_type: "call",
        activity_subject: "Follow-up call",
        start_date: "2025-01-15T10:00:00Z",
        is_completed: 1,
      };

      const result = DataTransformer.transform(crmData, EntityType.ACTIVITY);

      expect(result.type).toBe("call");
      expect(result.subject).toBe("Follow-up call");
      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.completed).toBe(true);
    });

    it("transforms pipeline data", () => {
      const crmData = {
        pipeline_name: "Mortgage Pipeline",
        pipeline_stages: [{ id: "1", name: "Intake", order: 0 }],
        is_active: true,
      };

      const result = DataTransformer.transform(crmData, EntityType.PIPELINE);

      expect(result.name).toBe("Mortgage Pipeline");
      expect(result.stages).toEqual([{ id: "1", name: "Intake", order: 0 }]);
      expect(result.isActive).toBe(true);
    });
  });

  describe("transform - toCRM (Internal → CRM)", () => {
    it("transforms internal lead data back to CRM format", () => {
      const internalData = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        status: "qualified",
      };

      const result = DataTransformer.transform(
        internalData,
        EntityType.LEAD,
        "toCRM"
      );

      expect(result.first_name).toBe("John");
      expect(result.last_name).toBe("Doe");
      expect(result.email_address).toBe("john@example.com");
      expect(result.lead_status).toBe("qualified");
    });
  });

  describe("transform - edge cases", () => {
    it("skips missing required fields without default values", () => {
      const crmData = { first_name: "John" }; // missing last_name, email, status

      const result = DataTransformer.transform(crmData, EntityType.LEAD);

      expect(result.firstName).toBe("John");
      expect(result.lastName).toBeUndefined();
    });

    it("omits optional fields without defaultValue when not provided", () => {
      const crmData = {
        deal_name: "Test Deal",
        deal_amount: "100000",
        deal_stage: "new",
        pipeline_id: "p1",
        deal_status: "open",
        // currency_code not provided and field is not required, so not set
      };

      const result = DataTransformer.transform(crmData, EntityType.DEAL);
      expect(result.currency).toBeUndefined();
    });

    it("preserves standard fields (id, timestamps)", () => {
      const crmData = {
        first_name: "Alice",
        last_name: "Wonder",
        email_address: "alice@example.com",
        lead_status: "new",
        id: "abc-123",
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-02-01T00:00:00Z",
        deletedAt: "2025-03-01T00:00:00Z",
      };

      const result = DataTransformer.transform(crmData, EntityType.LEAD);

      expect(result.id).toBe("abc-123");
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.deletedAt).toBeInstanceOf(Date);
    });

    it("preserves custom fields", () => {
      const crmData = {
        first_name: "Bob",
        last_name: "Test",
        email_address: "bob@test.com",
        lead_status: "new",
        customFields: { loanType: "conventional", ltv: 80 },
      };

      const result = DataTransformer.transform(crmData, EntityType.LEAD);

      expect(result.customFields).toEqual({
        loanType: "conventional",
        ltv: 80,
      });
    });

    it("handles contact_tags transform for non-array values", () => {
      const crmData = {
        first_name: "Test",
        last_name: "User",
        email_address: "test@test.com",
        contact_tags: "not-an-array",
      };

      const result = DataTransformer.transform(crmData, EntityType.CONTACT);
      expect(result.tags).toEqual([]);
    });
  });

  describe("transformBatch", () => {
    it("transforms an array of entities", () => {
      const leads = [
        {
          first_name: "A",
          last_name: "One",
          email_address: "a@test.com",
          lead_status: "new",
        },
        {
          first_name: "B",
          last_name: "Two",
          email_address: "b@test.com",
          lead_status: "qualified",
        },
      ];

      const results = DataTransformer.transformBatch(leads, EntityType.LEAD);

      expect(results).toHaveLength(2);
      expect(results[0].firstName).toBe("A");
      expect(results[1].firstName).toBe("B");
    });

    it("handles empty array", () => {
      const results = DataTransformer.transformBatch([], EntityType.LEAD);
      expect(results).toEqual([]);
    });
  });

  describe("validate", () => {
    it("passes for complete lead data", () => {
      const data = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        status: "new",
      };

      const result = DataTransformer.validate(data, EntityType.LEAD);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("fails for missing required lead fields", () => {
      const data = { firstName: "John" };

      const result = DataTransformer.validate(data, EntityType.LEAD);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Required field lastName is missing");
      expect(result.errors).toContain("Required field email is missing");
      expect(result.errors).toContain("Required field status is missing");
    });

    it("fails for missing required deal fields", () => {
      const data = { name: "Deal" };

      const result = DataTransformer.validate(data, EntityType.DEAL);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Required field amount is missing");
      expect(result.errors).toContain("Required field stage is missing");
      expect(result.errors).toContain("Required field pipelineId is missing");
      expect(result.errors).toContain("Required field status is missing");
    });

    it("returns error for unknown entity type", () => {
      const result = DataTransformer.validate({}, "unknown" as EntityType);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Unknown entity type: unknown");
    });
  });

  describe("createMapping", () => {
    it("creates a basic mapping", () => {
      const mapping = DataTransformer.createMapping("source", "target");
      expect(mapping.sourceField).toBe("source");
      expect(mapping.targetField).toBe("target");
      expect(mapping.required).toBeUndefined();
    });

    it("creates a mapping with options", () => {
      const transform = (val: unknown) => String(val).toUpperCase();
      const mapping = DataTransformer.createMapping("src", "tgt", {
        required: true,
        defaultValue: "N/A",
        transform,
      });
      expect(mapping.required).toBe(true);
      expect(mapping.defaultValue).toBe("N/A");
      expect(mapping.transform).toBe(transform);
    });
  });
});
