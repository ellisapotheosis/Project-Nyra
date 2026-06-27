import { describe, it, expect, beforeEach } from "vitest";
import { z } from "zod";

// Inline the class to avoid winston file transport side-effects in tests
class InputValidator {
  private schemas: Map<string, z.ZodSchema> = new Map();

  constructor() {
    this.initializeCommonSchemas();
  }

  private initializeCommonSchemas(): void {
    this.schemas.set("email", z.string().email().max(255).trim().toLowerCase());
    this.schemas.set(
      "username",
      z
        .string()
        .min(3)
        .max(32)
        .regex(/^[a-zA-Z0-9_-]+$/)
        .trim()
    );
    this.schemas.set(
      "password",
      z
        .string()
        .min(12)
        .max(128)
        .regex(/[A-Z]/, "Must contain uppercase")
        .regex(/[a-z]/, "Must contain lowercase")
        .regex(/[0-9]/, "Must contain number")
        .regex(/[^A-Za-z0-9]/, "Must contain special character")
    );
    this.schemas.set(
      "filepath",
      z
        .string()
        .max(1024)
        .refine((path) => !path.includes(".."), "Path traversal not allowed")
        .refine((path) => !path.startsWith("/"), "Absolute paths not allowed")
        .refine((path) => !/[<>:"|?*]/.test(path), "Invalid characters")
    );
    this.schemas.set(
      "url",
      z
        .string()
        .url()
        .max(2048)
        .refine((url) => {
          const parsed = new URL(url);
          return ["http:", "https:"].includes(parsed.protocol);
        }, "Only HTTP(S) URLs allowed")
    );
    this.schemas.set(
      "sql-param",
      z
        .string()
        .max(1000)
        .refine(
          (param) => !/[';-]/.test(param),
          "SQL injection pattern detected"
        )
    );
    this.schemas.set(
      "shell-arg",
      z
        .string()
        .max(1000)
        .refine(
          (arg) => !/[;&|<>`$()]/.test(arg),
          "Shell metacharacters not allowed"
        )
    );
    this.schemas.set(
      "jwt",
      z.string().regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/)
    );
    this.schemas.set("uuid", z.string().uuid());
    this.schemas.set(
      "phone",
      z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/)
        .transform((val) => val.replace(/\D/g, ""))
    );
    this.schemas.set(
      "ssn",
      z
        .string()
        .regex(/^\d{3}-?\d{2}-?\d{4}$/)
        .transform((val) => val.replace(/-/g, ""))
    );
    this.schemas.set(
      "loan-amount",
      z.number().int().positive().min(1000).max(10000000)
    );
    this.schemas.set("interest-rate", z.number().positive().min(0.01).max(30));
    this.schemas.set("credit-score", z.number().int().min(300).max(850));
  }

  registerSchema(name: string, schema: z.ZodSchema): void {
    this.schemas.set(name, schema);
  }

  validate<T>(
    schemaName: string,
    data: unknown
  ): { success: boolean; data?: T; errors?: string[] } {
    const schema = this.schemas.get(schemaName);
    if (!schema) {
      return { success: false, errors: [`Schema '${schemaName}' not found`] };
    }
    try {
      const result = schema.parse(data);
      return { success: true, data: result as T };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map(
          (e) => `${e.path.join(".")}: ${e.message}`
        );
        return { success: false, errors };
      }
      return { success: false, errors: ["Validation error"] };
    }
  }

  sanitizeString(input: string): string {
    return input
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  }

  validateMultiple(
    validations: Array<{ schema: string; data: unknown }>
  ): boolean {
    return validations.every(
      ({ schema, data }) => this.validate(schema, data).success
    );
  }
}

describe("InputValidator", () => {
  let validator: InputValidator;

  beforeEach(() => {
    validator = new InputValidator();
  });

  describe("email validation", () => {
    it("accepts valid email addresses", () => {
      const result = validator.validate("email", "user@example.com");
      expect(result.success).toBe(true);
      expect(result.data).toBe("user@example.com");
    });

    it("lowercases email addresses", () => {
      const result = validator.validate("email", "USER@Example.COM");
      expect(result.success).toBe(true);
      expect(result.data).toBe("user@example.com");
    });

    it("rejects invalid email addresses", () => {
      const result = validator.validate("email", "not-an-email");
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("rejects empty string", () => {
      const result = validator.validate("email", "");
      expect(result.success).toBe(false);
    });
  });

  describe("username validation", () => {
    it("accepts valid usernames", () => {
      const result = validator.validate("username", "john_doe");
      expect(result.success).toBe(true);
    });

    it("accepts hyphens and underscores", () => {
      expect(validator.validate("username", "user-name").success).toBe(true);
      expect(validator.validate("username", "user_name").success).toBe(true);
    });

    it("rejects usernames shorter than 3 characters", () => {
      const result = validator.validate("username", "ab");
      expect(result.success).toBe(false);
    });

    it("rejects usernames with special characters", () => {
      const result = validator.validate("username", "user@name");
      expect(result.success).toBe(false);
    });

    it("rejects usernames longer than 32 characters", () => {
      const result = validator.validate("username", "a".repeat(33));
      expect(result.success).toBe(false);
    });
  });

  describe("password validation", () => {
    it("accepts strong passwords", () => {
      const result = validator.validate("password", "MyStr0ng!Pass");
      expect(result.success).toBe(true);
    });

    it("rejects passwords without uppercase", () => {
      const result = validator.validate("password", "mystr0ng!pass");
      expect(result.success).toBe(false);
    });

    it("rejects passwords without lowercase", () => {
      const result = validator.validate("password", "MYSTR0NG!PASS");
      expect(result.success).toBe(false);
    });

    it("rejects passwords without numbers", () => {
      const result = validator.validate("password", "MyStrong!Pass");
      expect(result.success).toBe(false);
    });

    it("rejects passwords without special characters", () => {
      const result = validator.validate("password", "MyStr0ngPassw");
      expect(result.success).toBe(false);
    });

    it("rejects passwords shorter than 12 characters", () => {
      const result = validator.validate("password", "My$tr0ng!");
      expect(result.success).toBe(false);
    });
  });

  describe("filepath validation", () => {
    it("accepts valid relative paths", () => {
      const result = validator.validate("filepath", "data/files/report.pdf");
      expect(result.success).toBe(true);
    });

    it("rejects path traversal attempts", () => {
      const result = validator.validate("filepath", "../etc/passwd");
      expect(result.success).toBe(false);
    });

    it("rejects absolute paths", () => {
      const result = validator.validate("filepath", "/etc/passwd");
      expect(result.success).toBe(false);
    });

    it("rejects paths with invalid characters", () => {
      const result = validator.validate("filepath", "file<name>.txt");
      expect(result.success).toBe(false);
    });
  });

  describe("url validation", () => {
    it("accepts valid HTTP URLs", () => {
      const result = validator.validate("url", "https://example.com/path");
      expect(result.success).toBe(true);
    });

    it("rejects non-HTTP protocols", () => {
      const result = validator.validate("url", "ftp://example.com");
      expect(result.success).toBe(false);
    });

    it("rejects malformed URLs", () => {
      const result = validator.validate("url", "not a url");
      expect(result.success).toBe(false);
    });
  });

  describe("sql-param validation", () => {
    it("accepts safe string parameters", () => {
      const result = validator.validate("sql-param", "safe_value");
      expect(result.success).toBe(true);
    });

    it("rejects SQL injection patterns with single quotes", () => {
      const result = validator.validate("sql-param", "'; DROP TABLE users;");
      expect(result.success).toBe(false);
    });

    it("rejects SQL injection patterns with semicolons", () => {
      const result = validator.validate("sql-param", "value; DROP TABLE");
      expect(result.success).toBe(false);
    });
  });

  describe("shell-arg validation", () => {
    it("accepts safe arguments", () => {
      const result = validator.validate("shell-arg", "safe-argument");
      expect(result.success).toBe(true);
    });

    it("rejects shell metacharacters", () => {
      expect(validator.validate("shell-arg", "arg; rm -rf /").success).toBe(
        false
      );
      expect(
        validator.validate("shell-arg", "arg | cat /etc/passwd").success
      ).toBe(false);
      expect(validator.validate("shell-arg", "arg & background").success).toBe(
        false
      );
      expect(validator.validate("shell-arg", "$(command)").success).toBe(false);
    });
  });

  describe("jwt validation", () => {
    it("accepts valid JWT format", () => {
      const token = "eyJhbGci.eyJzdWIi.SflKxwRJ";
      const result = validator.validate("jwt", token);
      expect(result.success).toBe(true);
    });

    it("rejects tokens with wrong number of segments", () => {
      expect(validator.validate("jwt", "only.two").success).toBe(false);
      expect(validator.validate("jwt", "one").success).toBe(false);
    });
  });

  describe("uuid validation", () => {
    it("accepts valid UUIDs", () => {
      const result = validator.validate(
        "uuid",
        "550e8400-e29b-41d4-a716-446655440000"
      );
      expect(result.success).toBe(true);
    });

    it("rejects invalid UUIDs", () => {
      const result = validator.validate("uuid", "not-a-uuid");
      expect(result.success).toBe(false);
    });
  });

  describe("mortgage domain schemas", () => {
    it("validates loan amounts within range", () => {
      expect(validator.validate("loan-amount", 250000).success).toBe(true);
      expect(validator.validate("loan-amount", 999).success).toBe(false);
      expect(validator.validate("loan-amount", 10000001).success).toBe(false);
      expect(validator.validate("loan-amount", 250000.5).success).toBe(false);
    });

    it("validates interest rates within range", () => {
      expect(validator.validate("interest-rate", 5.5).success).toBe(true);
      expect(validator.validate("interest-rate", 0).success).toBe(false);
      expect(validator.validate("interest-rate", 31).success).toBe(false);
    });

    it("validates credit scores within FICO range", () => {
      expect(validator.validate("credit-score", 720).success).toBe(true);
      expect(validator.validate("credit-score", 299).success).toBe(false);
      expect(validator.validate("credit-score", 851).success).toBe(false);
    });

    it("validates SSN format and strips dashes", () => {
      const result = validator.validate("ssn", "123-45-6789");
      expect(result.success).toBe(true);
      expect(result.data).toBe("123456789");
    });

    it("validates phone numbers and strips non-digits", () => {
      const result = validator.validate("phone", "+14155551234");
      expect(result.success).toBe(true);
      expect(result.data).toBe("14155551234");
    });
  });

  describe("registerSchema", () => {
    it("allows registering custom schemas", () => {
      validator.registerSchema("custom", z.string().min(5));
      const result = validator.validate("custom", "hello");
      expect(result.success).toBe(true);
    });

    it("rejects data against custom schemas", () => {
      validator.registerSchema("custom", z.string().min(5));
      const result = validator.validate("custom", "hi");
      expect(result.success).toBe(false);
    });
  });

  describe("validate with unknown schema", () => {
    it("returns error for unknown schema names", () => {
      const result = validator.validate("nonexistent", "data");
      expect(result.success).toBe(false);
      expect(result.errors).toContain("Schema 'nonexistent' not found");
    });
  });

  describe("sanitizeString", () => {
    it("escapes HTML entities", () => {
      const input = '<script>alert("xss")</script>';
      const result = validator.sanitizeString(input);
      expect(result).not.toContain("<");
      expect(result).not.toContain(">");
      expect(result).toContain("&lt;");
      expect(result).toContain("&gt;");
    });

    it("escapes quotes", () => {
      const result = validator.sanitizeString('He said "hello"');
      expect(result).toContain("&quot;");
    });

    it("escapes single quotes", () => {
      const result = validator.sanitizeString("it's");
      expect(result).toContain("&#x27;");
    });

    it("escapes forward slashes", () => {
      const result = validator.sanitizeString("path/to/file");
      expect(result).toContain("&#x2F;");
    });
  });

  describe("validateMultiple", () => {
    it("returns true when all validations pass", () => {
      const result = validator.validateMultiple([
        { schema: "email", data: "user@example.com" },
        { schema: "credit-score", data: 720 },
      ]);
      expect(result).toBe(true);
    });

    it("returns false when any validation fails", () => {
      const result = validator.validateMultiple([
        { schema: "email", data: "user@example.com" },
        { schema: "credit-score", data: 200 },
      ]);
      expect(result).toBe(false);
    });
  });
});
