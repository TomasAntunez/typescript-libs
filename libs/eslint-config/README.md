# @chuli-dev/eslint-config

Self-contained ESLint flat-config presets for modern TypeScript projects.

## ✨ Features

- **One import, one preset** - Each preset is a complete ESLint flat config; just `export default` it
- **Three orthogonal axes** - TypeScript (`none` / `strict` / `type-aware`) × Node.js × ESM enforcement
- **Flat config ready** - Built for ESLint v9+ `eslint.config.js`
- **Practical defaults** - Strong rules for code quality, imports, and consistency

## 📦 Installation

```bash
npm install --save-dev @chuli-dev/eslint-config eslint @eslint/js eslint-config-prettier eslint-plugin-simple-import-sort eslint-plugin-unused-imports eslint-plugin-n globals typescript typescript-eslint
```

Each preset only depends on a subset of the peers above:

| Peer dependency                    | Required by                  |
| ---------------------------------- | ---------------------------- |
| `eslint`                           | All presets                  |
| `@eslint/js`                       | All presets                  |
| `eslint-config-prettier`           | All presets                  |
| `eslint-plugin-simple-import-sort` | All presets                  |
| `eslint-plugin-unused-imports`     | All presets                  |
| `globals`                          | All presets                  |
| `eslint-plugin-n`                  | Any `node` / `*Node*` preset |
| `typescript`                       | Any `typescript*` preset     |
| `typescript-eslint`                | Any `typescript*` preset     |

> With npm v7+, peer dependencies are installed automatically when you add `@chuli-dev/eslint-config`.

## 🚀 Quick Start

Pick the preset that matches your project and use it directly as your flat config:

```js
// eslint.config.js
import { typescriptTypecheckedNodeEsm } from '@chuli-dev/eslint-config';

export default typescriptTypecheckedNodeEsm;
```

## 📋 Available Presets

| Preset                             | TypeScript | Node.js | ESM enforcement |
| ---------------------------------- | ---------- | ------- | --------------- |
| **`base`**                         | —          | —       | —               |
| **`node`**                         | —          | ✓       | —               |
| **`esm`**                          | —          | —       | ✓               |
| **`nodeEsm`**                      | —          | ✓       | ✓               |
| **`typescript`**                   | strict     | —       | —               |
| **`typescriptEsm`**                | strict     | —       | ✓               |
| **`typescriptNode`**               | strict     | ✓       | —               |
| **`typescriptNodeEsm`**            | strict     | ✓       | ✓               |
| **`typescriptTypechecked`**        | type-aware | —       | —               |
| **`typescriptTypecheckedEsm`**     | type-aware | —       | ✓               |
| **`typescriptTypecheckedNode`**    | type-aware | ✓       | —               |
| **`typescriptTypecheckedNodeEsm`** | type-aware | ✓       | ✓               |

### What each axis adds

- **TypeScript `strict`** - Enables `typescript-eslint`'s strict ruleset without type information.
- **TypeScript `type-aware`** - Adds rules that require type information (`no-floating-promises`, `no-misused-promises`, etc.). Requires a valid `tsconfig.json`.
- **Node.js** - Adds Node globals and `eslint-plugin-n` rules (`no-deprecated-api`, `prefer-node-protocol`, `no-process-exit`).
- **ESM enforcement** - Forces `sourceType: 'module'`, disables CJS globals, and forbids `require()` / `module.exports` syntax.

## 🔀 Import order

All presets sort imports via `eslint-plugin-simple-import-sort` into these groups, separated by a blank line:

1. Side-effect imports — `import './polyfills'`
2. Node.js built-ins with the `node:` protocol — `import { readFile } from 'node:fs/promises'`
3. External packages — `import React from 'react'`, `import { z } from 'zod'`
4. **Absolute internal paths** (see below)
5. Parent-relative imports — `import foo from '../foo'`
6. Same-folder relative imports — `import bar from './bar'`

### Absolute path prefixes

For the absolute-path group to pick up your internal imports, the specifier must start with one of these prefixes:

| Prefix       | Typical use                                |
| ------------ | ------------------------------------------ |
| `@/`         | Common Next.js / Vite default              |
| `~/`         | Alternative root alias                     |
| `src/`       | When `baseUrl` is the project root         |
| `@src/`      | Aliased `src/` root                        |
| `app/`       | App-scoped alias                           |
| `@app/`      | Aliased app-scoped alias                   |
| `libs/`      | Monorepo `libs/` root                      |
| `@libs/`     | Aliased monorepo `libs/` root              |
| `packages/`  | Turborepo / pnpm monorepo `packages/` root |
| `@packages/` | Aliased monorepo `packages/` root          |
| `shared/`    | Shared workspace folder                    |
| `@shared/`   | Aliased shared workspace                   |

Imports that don't match any of these fall through to the external-package group and get mixed with `react`, `zod`, etc. — which is usually not what you want. Either rename your alias to one of the prefixes above, or override the rule as shown below.

### Customizing the groups

Presets are plain flat-config arrays, so you can append a config object that re-declares `simple-import-sort/imports`. The full `groups` array must be redeclared — the plugin does not merge.

```js
// eslint.config.js
import { typescriptTypecheckedNodeEsm } from '@chuli-dev/eslint-config';

export default [
  ...typescriptTypecheckedNodeEsm,
  {
    rules: {
      'simple-import-sort/imports': [
        'warn',
        {
          groups: [
            ['^\\u0000'],
            ['^node:'],
            ['^@?\\w'],
            // Add your own prefix here (e.g. `#internal/`):
            [
              '^(@/|~\\/|src/|@src/|app/|@app/|libs/|@libs/|packages/|@packages/|shared/|@shared/|#internal/)',
            ],
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
          ],
        },
      ],
    },
  },
];
```

Each entry in `groups` is itself an array of regex strings; imports matching any regex inside the inner array land in that group, and groups are separated by blank lines in the output.

## 📝 Notes

- All presets include `eslint-config-prettier` to disable rules that conflict with Prettier formatting.
- Type-aware presets (`*Typechecked*`) lint only `*.ts`, `*.tsx`, `*.mts` files and require a `tsconfig.json` at the project root (via `projectService`).

## 🔧 Requirements

- **Node.js** `>=20`
- **ESLint** `>=9`
- **TypeScript** `>=5` (only if using TypeScript presets)

## 📄 License

MIT - see the [LICENSE](https://github.com/TomasAntunez/typescript-libs/blob/main/libs/eslint-config/LICENSE) file for details.

## 👤 Author

**chuli-dev** - [@TomasAntunez](https://github.com/TomasAntunez)
