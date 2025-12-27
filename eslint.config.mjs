import { defineConfig, globalIgnores } from 'eslint/config'
import typescriptEslintEslintPlugin from '@typescript-eslint/eslint-plugin'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tsParser from '@typescript-eslint/parser'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default defineConfig([
  globalIgnores([
    '**/.eslintrc.js',
    '**/pg_data',
    'src/app/(payload)/admin/importMap.js',
    'src/migrations/**',
  ]),
  {
    extends: compat.extends('plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'),

    plugins: {
      '@typescript-eslint': typescriptEslintEslintPlugin,
      'simple-import-sort': simpleImportSort,
      'react-hooks': reactHooks,
    },

    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },

      parser: tsParser,
      ecmaVersion: 5,
      sourceType: 'module',

      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },

    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-unused-vars': 'off',

      '@typescript-eslint/no-empty-object-type': [
        'error',
        {
          allowInterfaces: 'always',
        },
      ],

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      'simple-import-sort/imports': [
        'warn',
        {
          groups: [
            ['^@nestjs'],
            ['.module$', '.service$', '.guard$', '.controller$'],
            [
              '.dto$',
              '.entity$',
              '.interface$',
              '.enum$',
              '.decorator$',
              '.error$',
              '.exception$',
              'constants$',
            ],
            ['.config$', '.storage$', 'schema$', '.'],
          ],
        },
      ],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
])
