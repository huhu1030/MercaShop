import globals from 'globals';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import-x';

export default tseslint.config(
  // ===========================================
  // IGNORED PATHS
  // ===========================================
  {
    ignores: [
      "apps/api/src/generated",
      'packages/shared/src/apis',
      'eslint.config.js',
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
    ],
  },

  // ===========================================
  // BASE CONFIGS
  // ===========================================
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    ...react.configs.flat.recommended,
    settings: { react: { version: 'detect' } },
  },
  react.configs.flat['jsx-runtime'],
  jsxA11y.flatConfigs.recommended,
  importPlugin.flatConfigs.errors,
  importPlugin.flatConfigs.typescript,

  // ===========================================
  // PROJECT-SPECIFIC RULES
  // ===========================================
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ...react.configs.flat['jsx-runtime'].languageOptions,
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import-x/resolver': {
        typescript: {
          alwaysTryTypes: true,
          noWarnOnMultipleProjects: true,
          project: [
            './tsconfig.json',
            './apps/api/tsconfig.json',
            './apps/dashboard/tsconfig.json',
            './apps/storefront/tsconfig.json',
            './packages/shared/tsconfig.json',
          ],
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.d.ts'],
        },
      },
      'import-x/core-modules': ['virtual:pwa-register'],
    },
    rules: {
      // ===========================================
      // REACT RULES
      // ===========================================
      'react/prop-types': 'off', // Using TypeScript for prop validation
      'react/react-in-jsx-scope': 'off', // Not needed with new JSX transform
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // ===========================================
      // TYPESCRIPT RULES
      // ===========================================
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // ===========================================
      // IMPORT RULES
      // ===========================================
      'import-x/default': 'off',
      'import-x/no-duplicates': 'warn',
      'import-x/consistent-type-specifier-style': ['warn', 'prefer-top-level'],
      'import-x/no-unresolved': ['error', { ignore: ['^virtual:pwa-register$'] }],

      // ===========================================
      // GENERAL CODE QUALITY
      // ===========================================
      'no-implicit-coercion': 'warn',
      'no-empty-pattern': 'warn',
      'prefer-const': 'warn',
      'no-extra-boolean-cast': 'warn',
    },
  },

  // ===========================================
  // ARCHITECTURAL ENFORCEMENT
  // Prevent direct imports from generated API files
  // (except in api/clients/ which are the allowed wrappers)
  // ===========================================
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['src/api/clients/**', 'packages/shared/src/api/**'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/apis/api/apis/**',
                '**/apis/api/api',
                '**/apis/api/base',
                '**/apis/api/common',
                '**/apis/api/configuration',
                '**/apis/api/index',
                '@/apis/api/apis/**',
                '@/apis/api/api',
                '@/apis/api/base',
                '@/apis/api/common',
                '@/apis/api/configuration',
                '@/apis/api/index',
              ],
              message:
                'Direct imports from generated API files (apis/api/) are not allowed. ' +
                'Import from api/clients/ for API instances. Imports from apis/api/models are allowed.',
              allowTypeImports: true, // Types/interfaces are OK to import
            },
          ],
        },
      ],
    },
  },
);
