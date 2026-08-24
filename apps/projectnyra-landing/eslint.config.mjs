// `next lint` is incompatible with TypeScript 7. Keep ESLint CLI coverage
// for JavaScript/config files; TypeScript is checked by the package typecheck.
export default [
  {
    ignores: [
      "**/*.ts",
      "**/*.tsx",
      "**/node_modules/**",
      "**/.next/**",
      "**/out/**",
      "**/build/**",
    ],
  },
];
