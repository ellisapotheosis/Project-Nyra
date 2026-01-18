import type { PlopTypes } from "@turbo/gen";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  // Generator for creating new workspace packages
  plop.setGenerator("workspace-package", {
    description: "Create a new workspace package",
    prompts: [
      {
        type: "list",
        name: "type",
        message: "What type of package?",
        choices: ["app", "service", "package", "mcp-server", "tool"],
      },
      {
        type: "input",
        name: "name",
        message: "Package name:",
        validate: (input: string) => {
          if (!input) return "Package name is required";
          if (!/^[a-z0-9-]+$/.test(input)) {
            return "Package name must be lowercase and contain only letters, numbers, and hyphens";
          }
          return true;
        },
      },
      {
        type: "input",
        name: "description",
        message: "Package description:",
      },
    ],
    actions: (data) => {
      const actions: PlopTypes.ActionType[] = [];
      const basePath = `{{type}}s/{{dashCase name}}`;

      // Create package.json
      actions.push({
        type: "add",
        path: `${basePath}/package.json`,
        templateFile: "templates/package.json.hbs",
      });

      // Create tsconfig.json for TS packages
      if (data?.type !== "tool") {
        actions.push({
          type: "add",
          path: `${basePath}/tsconfig.json`,
          templateFile: "templates/tsconfig.json.hbs",
        });
      }

      // Create README
      actions.push({
        type: "add",
        path: `${basePath}/README.md`,
        templateFile: "templates/README.md.hbs",
      });

      // Type-specific files
      if (data?.type === "app") {
        actions.push(
          {
            type: "add",
            path: `${basePath}/src/app/page.tsx`,
            templateFile: "templates/app/page.tsx.hbs",
          },
          {
            type: "add",
            path: `${basePath}/src/app/layout.tsx`,
            templateFile: "templates/app/layout.tsx.hbs",
          }
        );
      } else if (data?.type === "service") {
        actions.push({
          type: "add",
          path: `${basePath}/src/main.ts`,
          templateFile: "templates/service/main.ts.hbs",
        });
      } else if (data?.type === "package") {
        actions.push({
          type: "add",
          path: `${basePath}/src/index.ts`,
          templateFile: "templates/package/index.ts.hbs",
        });
      }

      return actions;
    },
  });

  // Generator for creating React components
  plop.setGenerator("component", {
    description: "Create a new React component",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Component name:",
        validate: (input: string) => {
          if (!input) return "Component name is required";
          if (!/^[A-Z][a-zA-Z0-9]*$/.test(input)) {
            return "Component name must be PascalCase and start with an uppercase letter";
          }
          return true;
        },
      },
      {
        type: "input",
        name: "path",
        message: "Component path (relative to src/components):",
        default: "",
      },
    ],
    actions: [
      {
        type: "add",
        path: "src/components/{{path}}/{{pascalCase name}}/{{pascalCase name}}.tsx",
        templateFile: "templates/component/Component.tsx.hbs",
      },
      {
        type: "add",
        path: "src/components/{{path}}/{{pascalCase name}}/index.ts",
        templateFile: "templates/component/index.ts.hbs",
      },
    ],
  });

  // Generator for creating API routes
  plop.setGenerator("api-route", {
    description: "Create a new API route",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Route name:",
        validate: (input: string) => {
          if (!input) return "Route name is required";
          return true;
        },
      },
      {
        type: "list",
        name: "method",
        message: "HTTP method:",
        choices: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      },
    ],
    actions: [
      {
        type: "add",
        path: "src/app/api/{{dashCase name}}/route.ts",
        templateFile: "templates/api/route.ts.hbs",
      },
    ],
  });

  // Generator for creating hooks
  plop.setGenerator("hook", {
    description: "Create a new React hook",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Hook name (without 'use' prefix):",
        validate: (input: string) => {
          if (!input) return "Hook name is required";
          if (!/^[A-Z][a-zA-Z0-9]*$/.test(input)) {
            return "Hook name must be PascalCase and start with an uppercase letter";
          }
          return true;
        },
      },
    ],
    actions: [
      {
        type: "add",
        path: "src/hooks/use{{pascalCase name}}.ts",
        templateFile: "templates/hook/useHook.ts.hbs",
      },
    ],
  });
}
