module.exports = {
    root: true,
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'react'],
    rules: {
      // Ваши кастомные правила
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    env: {
      browser: true,
      node: true,
      es2022: true,
    },
    overrides: [
      {
        files: ['*.ts', '*.tsx'],
        parserOptions: {
          ecmaVersion: 'latest',
          sourceType: 'module',
          project: ['./tsconfig.json'],
        },
      },
    ],
  };