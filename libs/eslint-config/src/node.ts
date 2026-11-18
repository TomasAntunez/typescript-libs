import type { Linter } from 'eslint';
import pluginN from 'eslint-plugin-n';
import globals from 'globals';

export const node: Linter.Config[] = [
  {
    name: '@chuli-dev/node',
    files: ['**/*.{js,mjs,jsx,ts,tsx,mts}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      n: pluginN,
    },
    rules: {
      'n/no-deprecated-api': 'error',
      'n/prefer-node-protocol': 'error',
      'n/no-process-exit': 'error',
    },
  },
];
