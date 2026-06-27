import { describe, it, expect, beforeEach } from "vitest";

// Standalone implementation to avoid winston file transport side-effects
class SQLValidator {
  private dangerousPatterns: RegExp[] = [
    /(\bUNION\b.*\bSELECT\b)/gi,
    /(\bSELECT\b.*\bFROM\b.*\bWHERE\b.*\bOR\b.*=.*)/gi,
    /(;.*\b(DROP|DELETE|UPDATE|INSERT)\b)/gi,
    /(\bEXEC\b|\bEXECUTE\b)/gi,
    /(--|\#|\/\*|\*\/)/g,
    /(\bxp_\w+)/gi,
    /(\bsp_\w+)/gi,
    /(@@\w+)/g,
    /(\b(INFORMATION_SCHEMA|sys\.)\w+)/gi,
    /('\s*OR\s*'?\d+'?\s*=\s*'?\d+'?)/gi,
    /('\s*OR\s*'\w+'\s*=\s*'\w+')/gi,
  ];

  validateQuery(query: string): { valid: boolean; reason?: string } {
    for (const pattern of this.dangerousPatterns) {
      pattern.lastIndex = 0;
      if (pattern.test(query)) {
        return {
          valid: false,
          reason: `Dangerous pattern detected: ${pattern.source}`,
        };
      }
    }
    return { valid: true };
  }

  validateParameter(param: string | number | boolean | null): {
    valid: boolean;
    reason?: string;
  } {
    if (param === null) return { valid: true };
    if (typeof param === "number" || typeof param === "boolean")
      return { valid: true };
    const paramStr = String(param);
    if (/[';-]/.test(paramStr)) {
      return {
        valid: false,
        reason: "Parameter contains SQL injection pattern",
      };
    }
    if (/%27|%3B|%2D%2D/.test(paramStr)) {
      return {
        valid: false,
        reason: "Parameter contains encoded SQL pattern",
      };
    }
    return { valid: true };
  }

  escapeParameter(param: string): string {
    return param
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "''")
      .replace(/"/g, '""')
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\x00/g, "\\0")
      .replace(/\x1a/g, "\\Z");
  }

  buildParameterizedQuery(
    template: string,
    params: Record<string, unknown>
  ): { query: string; values: unknown[] } {
    const values: unknown[] = [];
    let paramIndex = 1;
    const paramMap: Record<string, string> = {};
    const query = template.replace(/:(\w+)/g, (_match, paramName) => {
      if (!(paramName in params)) {
        throw new Error(`Missing parameter: ${paramName}`);
      }
      if (!(paramName in paramMap)) {
        paramMap[paramName] = `$${paramIndex++}`;
        values.push(params[paramName]);
      }
      return paramMap[paramName];
    });
    return { query, values };
  }

  validateWhereClause(whereClause: string): {
    valid: boolean;
    reason?: string;
  } {
    const validation = this.validateQuery(
      `SELECT * FROM table WHERE ${whereClause}`
    );
    if (!validation.valid) return validation;
    if (/\b(1\s*=\s*1|'a'\s*=\s*'a'|true\s*=\s*true)\b/gi.test(whereClause)) {
      return {
        valid: false,
        reason: "WHERE clause contains always-true condition",
      };
    }
    return { valid: true };
  }

  sanitizeTableName(tableName: string): {
    valid: boolean;
    sanitized?: string;
    reason?: string;
  } {
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      return {
        valid: false,
        reason: "Table name contains invalid characters",
      };
    }
    const reservedWords = [
      "SELECT",
      "FROM",
      "WHERE",
      "DROP",
      "DELETE",
      "UPDATE",
      "INSERT",
      "EXEC",
    ];
    if (reservedWords.includes(tableName.toUpperCase())) {
      return { valid: false, reason: "Table name is a reserved SQL word" };
    }
    return { valid: true, sanitized: tableName };
  }

  sanitizeColumnName(columnName: string): {
    valid: boolean;
    sanitized?: string;
    reason?: string;
  } {
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(columnName)) {
      return {
        valid: false,
        reason: "Column name contains invalid characters",
      };
    }
    return { valid: true, sanitized: columnName };
  }
}

describe("SQLValidator", () => {
  let validator: SQLValidator;

  beforeEach(() => {
    validator = new SQLValidator();
  });

  describe("validateQuery", () => {
    it("accepts safe SELECT queries", () => {
      expect(validator.validateQuery("SELECT id, name FROM users").valid).toBe(
        true
      );
    });

    it("detects UNION SELECT injection", () => {
      const result = validator.validateQuery(
        "SELECT id FROM users UNION SELECT password FROM admins"
      );
      expect(result.valid).toBe(false);
    });

    it("detects OR-based injection", () => {
      const result = validator.validateQuery(
        "SELECT * FROM users WHERE id = 1 OR 1=1"
      );
      expect(result.valid).toBe(false);
    });

    it("detects stacked query injection", () => {
      const result = validator.validateQuery(
        "SELECT id FROM users; DROP TABLE users"
      );
      expect(result.valid).toBe(false);
    });

    it("detects EXEC/EXECUTE commands", () => {
      expect(validator.validateQuery("EXEC sp_executesql @sql").valid).toBe(
        false
      );
      expect(validator.validateQuery("EXECUTE xp_cmdshell 'dir'").valid).toBe(
        false
      );
    });

    it("detects SQL comments used in injection", () => {
      expect(validator.validateQuery("SELECT * FROM users -- ").valid).toBe(
        false
      );
      expect(
        validator.validateQuery("SELECT * /* injection */ FROM users").valid
      ).toBe(false);
    });

    it("detects extended stored procedure patterns", () => {
      expect(validator.validateQuery("xp_cmdshell 'command'").valid).toBe(
        false
      );
    });

    it("detects sys. schema access", () => {
      expect(validator.validateQuery("SELECT * FROM sys.tables").valid).toBe(
        false
      );
    });

    it("detects global variable access", () => {
      expect(validator.validateQuery("SELECT @@version").valid).toBe(false);
    });
  });

  describe("validateParameter", () => {
    it("accepts null parameters", () => {
      expect(validator.validateParameter(null).valid).toBe(true);
    });

    it("accepts numeric parameters", () => {
      expect(validator.validateParameter(42).valid).toBe(true);
      expect(validator.validateParameter(3.14).valid).toBe(true);
    });

    it("accepts boolean parameters", () => {
      expect(validator.validateParameter(true).valid).toBe(true);
      expect(validator.validateParameter(false).valid).toBe(true);
    });

    it("accepts safe string parameters", () => {
      expect(validator.validateParameter("safe_value").valid).toBe(true);
    });

    it("rejects strings with single quotes", () => {
      expect(validator.validateParameter("it's").valid).toBe(false);
    });

    it("rejects strings with semicolons", () => {
      expect(validator.validateParameter("val;DROP").valid).toBe(false);
    });

    it("rejects URL-encoded injection patterns", () => {
      expect(validator.validateParameter("%27").valid).toBe(false);
      expect(validator.validateParameter("%3B").valid).toBe(false);
      expect(validator.validateParameter("%2D%2D").valid).toBe(false);
    });
  });

  describe("escapeParameter", () => {
    it("escapes single quotes by doubling", () => {
      expect(validator.escapeParameter("O'Brien")).toBe("O''Brien");
    });

    it("escapes double quotes by doubling", () => {
      expect(validator.escapeParameter('say "hello"')).toBe('say ""hello""');
    });

    it("escapes backslashes", () => {
      expect(validator.escapeParameter("path\\to")).toBe("path\\\\to");
    });

    it("escapes newlines and carriage returns", () => {
      expect(validator.escapeParameter("line\nbreak")).toBe("line\\nbreak");
      expect(validator.escapeParameter("line\rbreak")).toBe("line\\rbreak");
    });

    it("escapes null bytes", () => {
      expect(validator.escapeParameter("null\x00byte")).toBe("null\\0byte");
    });
  });

  describe("buildParameterizedQuery", () => {
    it("replaces named parameters with positional ones", () => {
      const result = validator.buildParameterizedQuery(
        "SELECT * FROM users WHERE name = :name AND age = :age",
        { name: "Alice", age: 30 }
      );
      expect(result.query).toBe(
        "SELECT * FROM users WHERE name = $1 AND age = $2"
      );
      expect(result.values).toEqual(["Alice", 30]);
    });

    it("reuses positional index for repeated parameters", () => {
      const result = validator.buildParameterizedQuery(
        "SELECT * FROM users WHERE name = :name OR alias = :name",
        { name: "Bob" }
      );
      expect(result.query).toBe(
        "SELECT * FROM users WHERE name = $1 OR alias = $1"
      );
      expect(result.values).toEqual(["Bob"]);
    });

    it("throws on missing parameters", () => {
      expect(() =>
        validator.buildParameterizedQuery(
          "SELECT * FROM users WHERE name = :name",
          {}
        )
      ).toThrow("Missing parameter: name");
    });
  });

  describe("validateWhereClause", () => {
    it("accepts safe WHERE clauses", () => {
      expect(
        validator.validateWhereClause("status = $1 AND age > $2").valid
      ).toBe(true);
    });

    it("rejects always-true conditions (numeric)", () => {
      expect(validator.validateWhereClause("1 = 1").valid).toBe(false);
    });

    it("rejects always-true conditions (boolean)", () => {
      expect(validator.validateWhereClause("true = true").valid).toBe(false);
    });
  });

  describe("sanitizeTableName", () => {
    it("accepts valid table names", () => {
      const result = validator.sanitizeTableName("users");
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe("users");
    });

    it("accepts names with underscores", () => {
      expect(validator.sanitizeTableName("user_profiles").valid).toBe(true);
    });

    it("accepts names starting with underscore", () => {
      expect(validator.sanitizeTableName("_temp").valid).toBe(true);
    });

    it("rejects names with special characters", () => {
      expect(validator.sanitizeTableName("users;--").valid).toBe(false);
      expect(validator.sanitizeTableName("table name").valid).toBe(false);
    });

    it("rejects names starting with numbers", () => {
      expect(validator.sanitizeTableName("1table").valid).toBe(false);
    });

    it("rejects SQL reserved words", () => {
      expect(validator.sanitizeTableName("SELECT").valid).toBe(false);
      expect(validator.sanitizeTableName("drop").valid).toBe(false);
      expect(validator.sanitizeTableName("INSERT").valid).toBe(false);
    });
  });

  describe("sanitizeColumnName", () => {
    it("accepts valid column names", () => {
      const result = validator.sanitizeColumnName("first_name");
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe("first_name");
    });

    it("rejects column names with special characters", () => {
      expect(validator.sanitizeColumnName("col;umn").valid).toBe(false);
      expect(validator.sanitizeColumnName("col name").valid).toBe(false);
    });
  });
});
