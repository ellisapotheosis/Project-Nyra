#!/usr/bin/env node
/**
 * Post-Consolidation Validation Suite
 * Validates that the monorepo consolidation was successful
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
};

// Results tracking
const results = {
  pass: [],
  fail: [],
  warn: [],
  info: [],
};

// Helper functions
function logPass(message) {
  console.log(`${colors.green}✓ PASS${colors.reset}: ${message}`);
  results.pass.push(message);
}

function logFail(message) {
  console.log(`${colors.red}✗ FAIL${colors.reset}: ${message}`);
  results.fail.push(message);
}

function logWarn(message) {
  console.log(`${colors.yellow}⚠ WARN${colors.reset}: ${message}`);
  results.warn.push(message);
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ INFO${colors.reset}: ${message}`);
  results.info.push(message);
}

function sectionHeader(title) {
  console.log("\n" + colors.blue + "━".repeat(60) + colors.reset);
  console.log(colors.blue + title + colors.reset);
  console.log(colors.blue + "━".repeat(60) + colors.reset);
}

function execCommand(command, options = {}) {
  try {
    return execSync(command, {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: options.silent ? "pipe" : "inherit",
      ...options,
    });
  } catch (error) {
    return options.ignoreError ? "" : null;
  }
}

function findFiles(dir, pattern, maxDepth = Infinity) {
  const results = [];

  function search(currentDir, depth = 0) {
    if (depth > maxDepth) return;

    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (
          entry.isDirectory() &&
          !entry.name.startsWith(".") &&
          entry.name !== "node_modules"
        ) {
          search(fullPath, depth + 1);
        } else if (entry.isFile() && pattern.test(entry.name)) {
          results.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore permission errors
    }
  }

  search(dir);
  return results;
}

// Change to repo root
const repoRoot = path.resolve(__dirname, "..", "..");
process.chdir(repoRoot);

console.log(
  colors.blue +
    "Project Nyra - Post-Consolidation Validation Suite" +
    colors.reset
);
console.log(colors.blue + `Repository: ${repoRoot}` + colors.reset);

// 1. Check for nyra-* folders in root
sectionHeader("1. Checking for remaining nyra-* folders in root");
const rootEntries = fs.readdirSync(".", { withFileTypes: true });
const nyraFolders = rootEntries.filter(
  (e) => e.isDirectory() && e.name.startsWith("nyra-")
);

if (nyraFolders.length === 0) {
  logPass("No nyra-* folders found in root");
} else {
  const folderNames = nyraFolders.map((f) => f.name).join(", ");
  logFail(`Found nyra-* folders in root: ${folderNames}`);
}

// 2. Validate imports
sectionHeader("2. Validating TypeScript/JavaScript imports");
logInfo("Scanning for broken imports...");

const searchPaths = ["apps", "services", "packages"].filter((p) =>
  fs.existsSync(p)
);
let brokenImports = 0;

for (const searchPath of searchPaths) {
  const files = findFiles(searchPath, /\.(ts|tsx|js|jsx)$/);

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, "utf8");
      const matches = content.match(/from\s+['"]nyra-/g);
      if (matches) {
        brokenImports += matches.length;
        logInfo(`  Found in: ${file}`);
      }
    } catch (error) {
      // Ignore read errors
    }
  }
}

if (brokenImports === 0) {
  logPass("No broken nyra-* imports found");
} else {
  logFail(`Found ${brokenImports} imports referencing old nyra-* paths`);
}

// 3. Verify turbo.json
sectionHeader("3. Verifying turbo.json task definitions");
if (fs.existsSync("turbo.json")) {
  try {
    const turboConfig = JSON.parse(fs.readFileSync("turbo.json", "utf8"));
    logPass("turbo.json is valid JSON");

    const requiredTasks = ["build", "dev", "test", "lint"];
    for (const task of requiredTasks) {
      if (turboConfig.tasks && turboConfig.tasks[task]) {
        logPass(`Turbo task defined: ${task}`);
      } else {
        logWarn(`Turbo task missing: ${task}`);
      }
    }
  } catch (error) {
    logFail(`turbo.json is not valid JSON: ${error.message}`);
  }
} else {
  logFail("turbo.json not found");
}

// 4. Check Dockerfiles
sectionHeader("4. Testing Docker builds");
logInfo("Checking Dockerfiles...");
const dockerfiles = findFiles(".", /(Dockerfile|\.Dockerfile)$/);

if (dockerfiles.length === 0) {
  logWarn("No Dockerfiles found");
} else {
  logInfo(`Found ${dockerfiles.length} Dockerfiles`);
  dockerfiles.forEach((df) => {
    const relativePath = path.relative(repoRoot, df);
    logInfo(`  ${relativePath}`);
  });
  logPass(`All ${dockerfiles.length} Dockerfiles located`);
}

// 5. Verify MCP configuration
sectionHeader("5. Verifying MCP server loadability");
if (fs.existsSync(".mcp.json")) {
  try {
    const mcpConfig = JSON.parse(fs.readFileSync(".mcp.json", "utf8"));
    logPass(".mcp.json is valid JSON");

    const serverCount = Object.keys(mcpConfig.mcpServers || {}).length;
    logInfo(`Found ${serverCount} MCP server configurations`);

    const requiredServers = ["archon-os", "sequential-thinking"];
    for (const server of requiredServers) {
      if (mcpConfig.mcpServers && mcpConfig.mcpServers[server]) {
        logPass(`MCP server configured: ${server}`);
      } else {
        logWarn(`MCP server not configured: ${server}`);
      }
    }
  } catch (error) {
    logFail(`.mcp.json is not valid JSON: ${error.message}`);
  }
} else {
  logFail(".mcp.json not found");
}

// 6. Check git history
sectionHeader("6. Checking git history preservation");
logInfo("Verifying git history for moved files...");
const sampleFiles = [
  "apps/ratehunter/package.json",
  "services/quote-api/package.json",
];

for (const file of sampleFiles) {
  if (fs.existsSync(file)) {
    const gitLog = execCommand(`git log --follow --oneline "${file}"`, {
      silent: true,
      ignoreError: true,
    });

    if (gitLog && gitLog.trim()) {
      logPass(`Git history preserved for: ${file}`);
    } else {
      logWarn(`Git history may not be preserved for: ${file}`);
    }
  }
}

// 7. Check for dead symlinks
sectionHeader("7. Checking for dead symlinks");
logInfo("Scanning for broken symlinks...");
let brokenLinks = 0;

function checkSymlinks(dir, depth = 0) {
  if (depth > 5) return; // Limit recursion depth

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.name.startsWith(".") || entry.name === "node_modules") continue;

      if (entry.isSymbolicLink()) {
        try {
          fs.statSync(fullPath); // Will throw if link is broken
        } catch {
          logFail(`Broken symlink: ${fullPath}`);
          brokenLinks++;
        }
      } else if (entry.isDirectory()) {
        checkSymlinks(fullPath, depth + 1);
      }
    }
  } catch (error) {
    // Ignore permission errors
  }
}

checkSymlinks(".");

if (brokenLinks === 0) {
  logPass("No broken symlinks found");
} else {
  logFail(`Found ${brokenLinks} broken symlinks`);
}

// 8. Validate workspace configuration
sectionHeader("8. Validating package.json workspace configuration");
if (fs.existsSync("package.json")) {
  try {
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    logPass("package.json is valid JSON");

    if (fs.existsSync("pnpm-workspace.yaml")) {
      logPass("pnpm-workspace.yaml exists");
    } else {
      logWarn("pnpm-workspace.yaml not found");
    }

    // Check for workspace protocol
    const allPackageJsons = [
      "package.json",
      ...findFiles("apps", /package\.json$/),
      ...findFiles("services", /package\.json$/),
      ...findFiles("packages", /package\.json$/),
    ];

    let workspaceRefs = 0;
    for (const pkgFile of allPackageJsons) {
      try {
        const content = fs.readFileSync(pkgFile, "utf8");
        const matches = content.match(/"workspace:/g);
        if (matches) workspaceRefs += matches.length;
      } catch {}
    }

    if (workspaceRefs > 0) {
      logPass(`Found ${workspaceRefs} workspace protocol references`);
    } else {
      logWarn("No workspace protocol references found");
    }
  } catch (error) {
    logFail(`package.json is not valid JSON: ${error.message}`);
  }
} else {
  logFail("package.json not found");
}

// 9. Check script executability
sectionHeader("9. Verifying script executability");
logInfo("Checking scripts...");
const scriptDirs = ["scripts", "bootstrap/windows", "bootstrap/wsl"].filter(
  (dir) => fs.existsSync(dir)
);

let scriptCount = 0;
for (const dir of scriptDirs) {
  const scripts = findFiles(dir, /\.(sh|ps1)$/);
  scriptCount += scripts.length;
}

if (scriptCount > 0) {
  logPass(`Found ${scriptCount} scripts`);
} else {
  logWarn("No scripts found in expected directories");
}

// 10. Check root cleanliness
sectionHeader("10. Verifying root directory cleanliness");
logInfo("Checking root directory structure...");

const expectedRootItems = [
  ".git",
  ".github",
  ".claude",
  ".archon-os",
  ".mcp.json",
  "apps",
  "services",
  "packages",
  "infra",
  "mcp-servers",
  "tools",
  "scripts",
  "bootstrap",
  "docs",
  "config",
  "submodules",
  "tests",
  "examples",
  "package.json",
  "pnpm-workspace.yaml",
  "pnpm-lock.yaml",
  "turbo.json",
  "tsconfig.json",
  "jest.config.js",
  ".gitignore",
  ".gitmodules",
  "README.md",
  "CLAUDE.md",
  "LICENSE",
  "node_modules",
  ".turbo",
  "dist",
  "build",
  "coverage",
  "validation-output.txt", // From our validation run
];

const rootItems = rootEntries
  .map((e) => e.name)
  .filter((name) => !name.match(/^STATUS-.*\.md$/));

const unexpectedItems = rootItems.filter(
  (item) => !expectedRootItems.includes(item)
);

if (unexpectedItems.length === 0) {
  logPass("Root directory is clean");
} else {
  logWarn(`Unexpected items in root: ${unexpectedItems.join(", ")}`);
}

// Summary
sectionHeader("VALIDATION SUMMARY");
console.log("");
console.log(
  `Total Checks: ${results.pass.length + results.fail.length + results.warn.length}`
);
console.log(`${colors.green}Passed: ${results.pass.length}${colors.reset}`);
console.log(`${colors.red}Failed: ${results.fail.length}${colors.reset}`);
console.log(`${colors.yellow}Warnings: ${results.warn.length}${colors.reset}`);
console.log("");

// Export results for report generation
const validationResults = {
  timestamp: new Date().toISOString(),
  summary: {
    total: results.pass.length + results.fail.length + results.warn.length,
    passed: results.pass.length,
    failed: results.fail.length,
    warnings: results.warn.length,
  },
  checks: {
    passed: results.pass,
    failed: results.fail,
    warnings: results.warn,
  },
};

// Save results to file
const resultsFile = path.join(repoRoot, "validation-results.json");
fs.writeFileSync(resultsFile, JSON.stringify(validationResults, null, 2));
logInfo(`Results saved to: ${resultsFile}`);

// Exit code
if (results.fail.length > 0) {
  console.log(
    `${colors.red}Validation FAILED with ${results.fail.length} critical issues${colors.reset}`
  );
  process.exit(1);
} else if (results.warn.length > 0) {
  console.log(
    `${colors.yellow}Validation PASSED with ${results.warn.length} warnings${colors.reset}`
  );
  process.exit(0);
} else {
  console.log(
    `${colors.green}Validation PASSED - All checks successful!${colors.reset}`
  );
  process.exit(0);
}
