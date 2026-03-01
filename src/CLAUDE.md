# Source Folder Build Prompt

Use `src/` for core domain orchestration and non-deployable modules.

## Rules
- If code becomes independently deployable, move it to `services/`.
- Domain modules should be grouped by business capability.
- Avoid putting container/bootstrap artifacts here.
