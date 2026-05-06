import eslintConfigPrettier from '@electron-toolkit/eslint-config-prettier'
import tseslint from '@electron-toolkit/eslint-config-ts'
import eslintPluginQuery from '@tanstack/eslint-plugin-query'
import { defineConfig } from 'eslint/config'
import jsoncPlugin from 'eslint-plugin-jsonc'
import eslintPluginReact from 'eslint-plugin-react'
import eslintPluginReactHooks from 'eslint-plugin-react-hooks'
import eslintPluginReactRefresh from 'eslint-plugin-react-refresh'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import * as jsoncParser from 'jsonc-eslint-parser'

export default defineConfig(
  { ignores: ['**/node_modules', '**/dist', '**/out', '**/playwright-report'] },
  tseslint.configs.recommended,
  eslintPluginReact.configs.flat.recommended,
  eslintPluginReact.configs.flat['jsx-runtime'],
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    plugins: {
      'react-hooks': eslintPluginReactHooks,
      'react-refresh': eslintPluginReactRefresh,
    },
    rules: {
      ...eslintPluginReactHooks.configs.recommended.rules,
      ...eslintPluginReactRefresh.configs.vite.rules,
      'react/jsx-boolean-value': ['warn', 'never'],
      'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
      'react-hooks/incompatible-library': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-refresh/only-export-components': 'off',
      'react/display-name': 'off',
      'react-hooks/use-memo': 'off',
      'react/prop-types': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/immutability': 'off',
    },
  },
  eslintConfigPrettier,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^\\u0000'],
            ['^react$', '^react-dom$'],
            ['^@?\\w'],
            ['^@shared/'],
            ['^@renderer/components/'],
            ['^@renderer/helpers/'],
            ['^@renderer/hooks/'],
            ['^@renderer/layouts/'],
            ['^@renderer/routes/'],
            ['^@renderer/assets/'],
            ['^@[^/]+/[^/]+/'],
            ['^\\.\\.(?!/?$)', '^\\.\\./?$', '^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            ['^.+\\.?(css)$'],
          ],
        },
      ],
    },
  },
  {
    plugins: {
      '@tanstack/query': eslintPluginQuery,
    },
    rules: {
      '@tanstack/query/prefer-query-object-syntax': 'off',
      '@tanstack/query/exhaustive-deps': 'off',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    // Target all JSON files
    files: ['src/shared/locales/**/*.json'],
    // Use the special parser for JSON
    languageOptions: {
      parser: jsoncParser,
    },
    // Enable the JSONC plugin
    plugins: {
      jsonc: jsoncPlugin,
    },
    rules: {
      // This rule will enforce alphabetically sorted keys in your JSON files.
      'jsonc/sort-keys': [
        'error',
        {
          pathPattern: '^$', // Sort keys at the root level
          order: { type: 'asc' },
        },
        {
          pathPattern: '.*', // Sort keys in all nested objects
          order: { type: 'asc' },
        },
      ],
    },
  }
)
