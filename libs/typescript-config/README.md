# @chuli-dev/typescript-config

Strict TypeScript configuration presets for ESM and CommonJS projects.

## ✨ Features

- **ESM and CommonJS** - Dedicated presets for both module systems
- **Strict by default** - Most strict TypeScript validations enabled
- **Multi-platform** - Presets for Node.js, Web, React, and libraries
- **Library presets are composite** - Ready for TypeScript project references
- **Zero-config** - Sensible defaults that work out of the box

## 📦 Installation

```bash
npm install --save-dev @chuli-dev/typescript-config typescript
```

## 🚀 Quick Start

Choose the configuration that matches your project:

### Node.js Application

```json
{
  "extends": "@chuli-dev/typescript-config/node",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["dist", "node_modules", "**/*.test.ts", "**/*.spec.ts"]
}
```

### Web/Browser Application

```json
{
  "extends": "@chuli-dev/typescript-config/web",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["dist", "node_modules", "**/*.test.ts", "**/*.spec.ts"]
}
```

### React Application

```json
{
  "extends": "@chuli-dev/typescript-config/react",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": [
    "dist",
    "node_modules",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx"
  ]
}
```

### Library (npm package)

```json
{
  "extends": "@chuli-dev/typescript-config/lib",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["dist", "node_modules", "**/*.test.ts", "**/*.spec.ts"]
}
```

Use this setup for framework-agnostic libraries when your source code lives in `src/`.

### Node.js Library (npm package)

```json
{
  "extends": "@chuli-dev/typescript-config/node.lib",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["dist", "node_modules", "**/*.test.ts", "**/*.spec.ts"]
}
```

Use this setup for libraries that run in Node.js and need Node.js typings.

### CommonJS Variants

For projects that target CommonJS (or for the CJS half of a dual ESM/CJS build), use the `.cjs` variants:

```json
{
  "extends": "@chuli-dev/typescript-config/node.cjs",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["dist", "node_modules", "**/*.test.ts", "**/*.spec.ts"]
}
```

Available CJS presets: `lib.cjs`, `node.cjs`, `node.cjs.lib`. They emit `module: "CommonJS"` and disable `verbatimModuleSyntax` (incompatible with CommonJS output).

## 📋 Available Configurations

| Configuration      | Description                                                     | Use Case                    |
| ------------------ | --------------------------------------------------------------- | --------------------------- |
| **`base`**         | Minimal ESM setup with strict validations                       | Custom ESM setups           |
| **`lib`**          | ESM library (composite, declaration via composite)              | Publishing ESM npm packages |
| **`lib.cjs`**      | CommonJS library (composite, declaration via composite)         | Publishing CJS npm packages |
| **`node`**         | Node.js ESM with Node typings                                   | ESM server applications     |
| **`node.lib`**     | Node.js ESM library (composite, declaration via composite)      | ESM Node.js packages        |
| **`node.cjs`**     | Node.js CommonJS with Node typings                              | CJS server applications     |
| **`node.cjs.lib`** | Node.js CommonJS library (composite, declaration via composite) | CJS Node.js packages        |
| **`web`**          | Browser environment (ESM)                                       | Web applications            |
| **`react`**        | React with JSX support (ESM)                                    | React applications          |

## 📝 Notes

- Library presets enable `composite: true`, which implicitly enables `declaration`. They are ready to participate in TypeScript project references (`tsc -b`). Configure `rootDir`, `outDir`, `tsBuildInfoFile`, `include`, and `exclude` in your project.
- Use `lib` / `lib.cjs` for framework-agnostic libraries, and `node.lib` / `node.cjs.lib` when your library needs Node typings.
- For dual ESM/CJS builds, run `tsc -b` against two configs (one extending `lib` / `node.lib` and one extending `lib.cjs` / `node.cjs.lib`) outputting to separate folders, each with its own `tsBuildInfoFile`.
- The `exclude` patterns shown are examples. Keep tests in `exclude` only if they should not be part of your build output.
- `noUnusedLocals` is not enabled by default. Turn it on if you want it.

## 🔧 Requirements

- **TypeScript** `>=5.0.0`
- **Node.js** `>=20.0.0`

## 📄 License

MIT - see the [LICENSE](https://github.com/TomasAntunez/typescript-libs/blob/main/libs/typescript-config/LICENSE) file for details.

## 👤 Author

**chuli-dev** - [@TomasAntunez](https://github.com/TomasAntunez)
