import type { Linter } from 'eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export const react: Linter.Config[] = [
  {
    ...reactHooks.configs.flat.recommended,
    name: '@chuli-dev/react/hooks',
    files: ['**/*.{ts,tsx}'],
  },
];
