import type { Linter } from 'eslint';

export const esm: Linter.Config[] = [
  {
    name: '@chuli-dev/esm',
    files: ['**/*.{js,mjs,jsx,ts,tsx,mts}'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        require: 'off',
        module: 'off',
        exports: 'off',
        __dirname: 'off',
        __filename: 'off',
      },
    },
    rules: {
      'no-restricted-globals': ['error', 'require', 'module', 'exports'],
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='require']",
          message: 'CommonJS require is not allowed. Use ESM import syntax.',
        },
        {
          selector: "AssignmentExpression[left.object.name='module'][left.property.name='exports']",
          message: 'module.exports is not allowed. Use ESM export syntax.',
        },
        {
          selector: "AssignmentExpression[left.object.name='exports']",
          message: 'exports.* is not allowed. Use ESM export syntax.',
        },
      ],
    },
  },
];
