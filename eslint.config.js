/** @format */

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import config from 'eslint/config';

export default config.defineConfig(
  config.globalIgnores(['lib/**/*'], 'Ignore Build Directory'),
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  },
  {
    rules: {
      'no-console': 'warn',
      'consistent-return': ['warn'],
      'consistent-this': ['warn', 'that'],
      'dot-notation': ['warn'],
      eqeqeq: ['warn'],
      'grouped-accessor-pairs': ['warn'],
      'init-declarations': ['warn', 'always'],
      'linebreak-style': ['warn', 'unix'],
      'max-classes-per-file': ['warn', 1],
      'new-cap': ['warn'],
      'no-alert': ['warn'],
      'no-case-declarations': ['warn'],
      'no-constant-condition': [
        'error',
        {
          checkLoops: false,
        },
      ],
      'no-duplicate-imports': ['warn'],
      'no-eq-null': ['warn'],
      'no-eval': ['warn'],
      'no-extra-semi': ['warn'],
      'no-global-assign': ['warn'],
      'no-implicit-coercion': ['warn'],
      'no-implicit-globals': ['warn'],
      'no-implied-eval': ['warn'],
      'no-inline-comments': ['warn'],
      'no-invalid-this': ['warn'],
      'no-multi-assign': ['warn'],
      'no-new': ['warn'],
      'no-new-func': ['warn'],
      'no-new-object': ['warn'],
      'no-new-wrappers': ['warn'],
      'no-param-reassign': ['warn'],
      'no-redeclare': ['warn'],
      'no-sequences': ['warn'],
      'no-throw-literal': ['warn'],
      'no-useless-assignment': ['off'],
      'no-useless-call': ['warn'],
      'no-useless-constructor': ['warn'],
      'no-useless-rename': ['warn'],
      'no-var': ['warn'],
      'one-var': ['warn', 'never'],
      'operator-assignment': ['warn', 'always'],
      'prefer-const': ['warn'],
      'prefer-promise-reject-errors': ['warn'],
      'prefer-rest-params': ['warn'],
      'prefer-spread': ['warn'],
      'prefer-template': ['warn'],
      'require-await': ['warn'],
      semi: ['warn', 'always'],
      'space-before-function-paren': ['warn', 'never'],
      '@typescript-eslint/no-empty-function': [
        'error',
        {
          allow: ['methods', 'setters'],
        },
      ],
      '@typescript-eslint/no-extraneous-class': ['off'],
      '@typescript-eslint/no-non-null-assertion': ['off'],
      '@typescript-eslint/no-unnecessary-condition': ['off'],
      '@typescript-eslint/no-unused-vars': ['off'],
      '@typescript-eslint/prefer-literal-enum-member': ['off'],
      '@typescript-eslint/restrict-template-expressions': ['off'],
    },
  }
);
