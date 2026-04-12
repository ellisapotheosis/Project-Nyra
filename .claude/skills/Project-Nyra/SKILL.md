```markdown
# Project-Nyra Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the Project-Nyra JavaScript codebase. It covers file naming, import/export styles, commit message conventions, and testing patterns. By following these guidelines, contributors can ensure consistency and maintainability throughout the project.

## Coding Conventions

### File Naming
- Use **camelCase** for all file names.
  - Example: `userProfile.js`, `dataFetcher.js`

### Import Style
- Use **relative imports** to reference other modules.
  - Example:
    ```javascript
    import { fetchData } from './dataFetcher';
    ```

### Export Style
- Use **named exports** for all modules.
  - Example:
    ```javascript
    // In dataFetcher.js
    export function fetchData() { ... }

    // In another file
    import { fetchData } from './dataFetcher';
    ```

### Commit Message Conventions
- Follow **conventional commit** style.
- Use prefixes such as `fix` and `docs`.
- Keep commit message length around 57 characters.
  - Example:
    ```
    fix: resolve issue with user authentication flow
    docs: update README with setup instructions
    ```

## Workflows

### Making a Code Change
**Trigger:** When you need to fix a bug or implement a feature  
**Command:** `/make-change`

1. Create a new branch for your change.
2. Make code changes following the coding conventions.
3. Write or update relevant tests.
4. Commit your changes using a conventional commit message (e.g., `fix: correct typo in dataFetcher`).
5. Push your branch and open a pull request.

### Writing Documentation
**Trigger:** When updating or adding documentation  
**Command:** `/update-docs`

1. Edit or create documentation files as needed.
2. Use clear, concise language.
3. Commit with a `docs:` prefix (e.g., `docs: add API usage example`).
4. Push your changes and open a pull request.

## Testing Patterns

- Test files follow the `*.test.*` naming pattern.
  - Example: `userProfile.test.js`
- The specific testing framework is not detected; check existing test files for patterns.
- Place tests alongside the modules they cover or in a dedicated `tests` directory.
- Example test file structure:
  ```javascript
  // userProfile.test.js
  import { getUserProfile } from './userProfile';

  describe('getUserProfile', () => {
    it('returns correct profile data', () => {
      // test implementation
    });
  });
  ```

## Commands
| Command        | Purpose                                   |
|----------------|-------------------------------------------|
| /make-change   | Start the process for making code changes  |
| /update-docs   | Begin updating or adding documentation     |
```
