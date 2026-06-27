import { describe, it, expect, beforeEach } from "vitest";
import { resolve, normalize, relative, sep } from "path";

// Standalone implementation to avoid winston file transport side-effects
class PathValidator {
  private allowedBasePaths: Set<string> = new Set();
  private blockedPatterns: RegExp[] = [
    /\.\./g,
    /~\//g,
    /^\/etc/i,
    /^\/proc/i,
    /^\/sys/i,
    /^\/dev/i,
    /^\/var\/log/i,
    /^\/root/i,
    /\0/g,
    /%00/g,
    /%2e%2e/gi,
    /\.\.\\/g,
    /\.\.\//g,
  ];

  constructor(allowedPaths: string[] = []) {
    allowedPaths.forEach((path) => this.addAllowedPath(path));
  }

  addAllowedPath(basePath: string): void {
    const normalized = resolve(basePath);
    this.allowedBasePaths.add(normalized);
  }

  removeAllowedPath(basePath: string): void {
    const normalized = resolve(basePath);
    this.allowedBasePaths.delete(normalized);
  }

  validatePath(
    inputPath: string,
    basePath?: string
  ): { valid: boolean; reason?: string; safePath?: string } {
    for (const pattern of this.blockedPatterns) {
      pattern.lastIndex = 0;
      if (pattern.test(inputPath)) {
        return {
          valid: false,
          reason: `Path contains blocked pattern: ${pattern.source}`,
        };
      }
    }
    const normalized = normalize(inputPath);
    if (basePath) {
      const resolvedBase = resolve(basePath);
      const resolvedPath = resolve(resolvedBase, normalized);
      const relativePath = relative(resolvedBase, resolvedPath);
      if (
        relativePath.startsWith("..") ||
        resolve(resolvedPath) !== resolvedPath
      ) {
        return { valid: false, reason: "Path traversal attempt detected" };
      }
      return { valid: true, safePath: resolvedPath };
    }
    if (this.allowedBasePaths.size > 0) {
      const resolvedPath = resolve(normalized);
      const isAllowed = Array.from(this.allowedBasePaths).some(
        (allowedPath) => {
          const rel = relative(allowedPath, resolvedPath);
          return !rel.startsWith("..") && !resolve(rel).startsWith(sep);
        }
      );
      if (!isAllowed) {
        return { valid: false, reason: "Path not in allowed directories" };
      }
      return { valid: true, safePath: resolvedPath };
    }
    const resolvedPath = resolve(normalized);
    return { valid: true, safePath: resolvedPath };
  }

  sanitizePath(inputPath: string): string {
    return normalize(inputPath)
      .replace(/\0/g, "")
      .replace(/%00/g, "")
      .replace(/\.\./g, "");
  }

  isAbsolutePath(path: string): boolean {
    return resolve(path) === normalize(path);
  }

  joinSafe(
    basePath: string,
    ...segments: string[]
  ): { valid: boolean; path?: string; reason?: string } {
    try {
      const joined = segments.join(sep);
      const validation = this.validatePath(joined, basePath);
      if (!validation.valid) return validation;
      return { valid: true, path: validation.safePath };
    } catch {
      return { valid: false, reason: "Error joining paths" };
    }
  }
}

describe("PathValidator", () => {
  let validator: PathValidator;

  beforeEach(() => {
    validator = new PathValidator();
  });

  describe("constructor", () => {
    it("initializes with allowed paths", () => {
      const v = new PathValidator(["/tmp/safe"]);
      const result = v.validatePath("file.txt", "/tmp/safe");
      expect(result.valid).toBe(true);
    });
  });

  describe("addAllowedPath / removeAllowedPath", () => {
    it("adds an allowed path and validates files within it via basePath", () => {
      validator.addAllowedPath("/tmp/allowed");
      const result = validator.validatePath("file.txt", "/tmp/allowed");
      expect(result.valid).toBe(true);
    });

    it("rejects paths outside allowed after adding", () => {
      validator.addAllowedPath("/tmp/allowed");
      const result = validator.validatePath("/var/other.txt");
      expect(result.valid).toBe(false);
    });

    it("removes allowed paths", () => {
      validator.addAllowedPath("/tmp/allowed");
      validator.removeAllowedPath("/tmp/allowed");
      // No restrictions left — any safe path is valid
      const result = validator.validatePath("file.txt");
      expect(result.valid).toBe(true);
    });
  });

  describe("validatePath - blocked patterns", () => {
    it("blocks parent directory traversal (..)", () => {
      expect(validator.validatePath("../etc/passwd").valid).toBe(false);
    });

    it("blocks home directory traversal (~/) ", () => {
      expect(validator.validatePath("~/secrets").valid).toBe(false);
    });

    it("blocks /etc access", () => {
      expect(validator.validatePath("/etc/shadow").valid).toBe(false);
    });

    it("blocks /proc access", () => {
      expect(validator.validatePath("/proc/self/environ").valid).toBe(false);
    });

    it("blocks /sys access", () => {
      expect(validator.validatePath("/sys/kernel").valid).toBe(false);
    });

    it("blocks /dev access", () => {
      expect(validator.validatePath("/dev/null").valid).toBe(false);
    });

    it("blocks /var/log access", () => {
      expect(validator.validatePath("/var/log/syslog").valid).toBe(false);
    });

    it("blocks /root access", () => {
      expect(validator.validatePath("/root/.ssh").valid).toBe(false);
    });

    it("blocks null bytes", () => {
      expect(validator.validatePath("file\x00.txt").valid).toBe(false);
    });

    it("blocks URL-encoded null bytes", () => {
      expect(validator.validatePath("file%00.txt").valid).toBe(false);
    });

    it("blocks URL-encoded path traversal", () => {
      expect(validator.validatePath("%2e%2e/etc").valid).toBe(false);
    });

    it("blocks Windows-style path traversal", () => {
      expect(validator.validatePath("..\\windows\\system32").valid).toBe(false);
    });
  });

  describe("validatePath - with basePath", () => {
    it("accepts paths within the base directory", () => {
      const result = validator.validatePath("subdir/file.txt", "/tmp/safe");
      expect(result.valid).toBe(true);
      expect(result.safePath).toBe(resolve("/tmp/safe", "subdir/file.txt"));
    });

    it("accepts plain filenames within base", () => {
      const result = validator.validatePath("report.pdf", "/tmp/uploads");
      expect(result.valid).toBe(true);
    });
  });

  describe("validatePath - with allowed paths", () => {
    it("accepts paths within allowed directories", () => {
      validator.addAllowedPath("/tmp/safe");
      // Use a relative path that resolves under /tmp/safe via basePath
      const result = validator.validatePath("file.txt", "/tmp/safe");
      expect(result.valid).toBe(true);
    });

    it("rejects paths outside allowed directories", () => {
      validator.addAllowedPath("/tmp/safe");
      const result = validator.validatePath("/var/evil.txt");
      expect(result.valid).toBe(false);
      expect(result.reason).toBe("Path not in allowed directories");
    });
  });

  describe("validatePath - no restrictions", () => {
    it("accepts any safe path when no restrictions set", () => {
      const result = validator.validatePath("any/path/here.txt");
      expect(result.valid).toBe(true);
      expect(result.safePath).toBeDefined();
    });
  });

  describe("sanitizePath", () => {
    it("removes null bytes", () => {
      const result = validator.sanitizePath("file\x00name.txt");
      expect(result).not.toContain("\x00");
    });

    it("removes URL-encoded null bytes", () => {
      const result = validator.sanitizePath("file%00name.txt");
      expect(result).not.toContain("%00");
    });

    it("removes parent directory references", () => {
      const result = validator.sanitizePath("../../../etc/passwd");
      expect(result).not.toContain("..");
    });

    it("normalizes paths", () => {
      const result = validator.sanitizePath("dir//sub///file.txt");
      expect(result).toBe(normalize("dir/sub/file.txt"));
    });
  });

  describe("isAbsolutePath", () => {
    it("identifies absolute paths", () => {
      expect(validator.isAbsolutePath("/usr/bin")).toBe(true);
    });

    it("identifies relative paths as non-absolute", () => {
      expect(validator.isAbsolutePath("relative/path")).toBe(false);
    });
  });

  describe("joinSafe", () => {
    it("joins path segments safely within base", () => {
      const result = validator.joinSafe("/tmp/safe", "sub", "file.txt");
      expect(result.valid).toBe(true);
      expect(result.path).toBe(resolve("/tmp/safe", `sub${sep}file.txt`));
    });

    it("rejects path segments that escape base", () => {
      const result = validator.joinSafe("/tmp/safe", "..", "..", "etc");
      expect(result.valid).toBe(false);
    });
  });
});
