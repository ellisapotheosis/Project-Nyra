export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/*.ts',
      '**/*.tsx',
      '.claude/**',
      'docs/**',
      'infra-archived/**',
      'archive/**',
      '_archived/**',
      'assets/**'
    ]
  },
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    rules: {}
  }
];
