---
name: "Project-Nyra"
description: "Repository-local skill describing the development patterns and contribution conventions used in Project Nyra."
metadata:
  short-description: "Project Nyra repository conventions"
---

# Project Nyra Development Patterns

Use this skill for repository-local conventions and contributor expectations in `project-nyra`.

## Overview

This skill summarizes development patterns and conventions used in the Project Nyra TypeScript codebase. It covers file naming, import and export style, commit message habits, and testing expectations so contributors can stay consistent with the repo.

## Coding Conventions

### File Naming

- Prefer `camelCase` for source filenames.
- Examples: `userProfile.ts`, `dataFetcher.test.ts`

### Imports

- Use relative imports when referencing nearby modules within the project.

Example:

```typescript
import { fetchData } from "./dataFetcher";
```

### Exports

- Prefer named exports for modules.

Example:

```typescript
export function fetchData() {
  /* ... */
}
```

### Commit Messages

- Keep commit messages concise.
- The repo occasionally uses a `deps:` prefix for dependency updates.

Examples:

- `deps: update lodash to v4.17.21`
- `fix auth race in session bootstrap`

## Workflows

### Dependency Updates

Trigger: updating or adding dependencies

1. Update the dependency with the repo's package manager.
2. Commit the change with a concise message.
3. Use a `deps:` prefix when the change is primarily a dependency update.

### Writing and Running Tests

Trigger: adding features or fixing bugs

1. Create or update tests using the `*.test.*` naming pattern.
2. Follow the repo's existing test framework and command conventions.
3. Run the relevant tests before committing.

## Testing Patterns

- Test files follow the `*.test.*` naming convention.
- Use the project's existing test setup instead of introducing a new framework ad hoc.

Example:

```typescript
import { fetchData } from "./dataFetcher";

describe("fetchData", () => {
  it("returns expected data", () => {
    // test implementation
  });
});
```
