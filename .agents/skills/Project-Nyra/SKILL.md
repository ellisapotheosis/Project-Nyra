```markdown
# Project-Nyra Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill introduces the development patterns and conventions used in the Project-Nyra TypeScript codebase. It covers file naming, import/export styles, commit message habits, and testing patterns. This guide is designed to help contributors write consistent, maintainable code and understand the project's structure.

## Coding Conventions

### File Naming
- Use **camelCase** for all file names.
  - Example: `userProfile.ts`, `dataFetcher.test.ts`

### Imports
- Use **relative imports** for referencing modules within the project.
  - Example:
    ```typescript
    import { fetchData } from './dataFetcher';
    ```

### Exports
- Use **named exports** for all modules.
  - Example:
    ```typescript
    // In dataFetcher.ts
    export function fetchData() { /* ... */ }
    ```

### Commit Messages
- Commit messages are generally freeform, with occasional use of the `deps` prefix for dependency updates.
- Keep commit messages concise (average ~65 characters).
  - Example:
    ```
    deps: update lodash to v4.17.21
    Fix bug in user authentication flow
    ```

## Workflows

### Dependency Updates
**Trigger:** When updating or adding dependencies  
**Command:** `/update-deps`

1. Update the relevant dependency in your package manager (e.g., `npm install <package>@latest`).
2. Commit the changes with a message prefixed by `deps:`.
   - Example: `deps: upgrade typescript to 4.9.5`
3. Push your changes and open a pull request if required.

### Writing and Running Tests
**Trigger:** When adding new features or fixing bugs  
**Command:** `/run-tests`

1. Create or update test files using the `*.test.*` pattern (e.g., `userProfile.test.ts`).
2. Write tests using the project's chosen (undetected) testing framework.
3. Run tests with the appropriate command for your test runner (e.g., `npm test` or `yarn test`).
4. Ensure all tests pass before committing.

## Testing Patterns

- Test files follow the `*.test.*` naming convention.
  - Example: `dataFetcher.test.ts`
- The testing framework is not specified; use the project's existing test setup.
- Example test structure:
  ```typescript
  // dataFetcher.test.ts
  import { fetchData } from './dataFetcher';

  describe('fetchData', () => {
    it('returns expected data', () => {
      // test implementation
    });
  });
  ```

## Commands
| Command        | Purpose                                 |
|----------------|-----------------------------------------|
| /update-deps   | Standardize dependency update workflow  |
| /run-tests     | Run all tests before committing changes |
```
