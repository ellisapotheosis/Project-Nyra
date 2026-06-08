import { execFileSync } from "node:child_process";
import { accessSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("Portainer stack sync script", () => {
  const scriptPath = resolve("infra/scripts/portainer-sync-stack.py");

  it("keeps the Makefile Portainer sync entrypoint available", () => {
    accessSync(scriptPath);

    const help = execFileSync("python3", [scriptPath, "--help"], {
      encoding: "utf8",
    });

    expect(help).toContain("--endpoint-name");
    expect(help).toContain("--compose-file");
    expect(help).toContain("--dry-run");
  });
});
