# typescript-libs

A monorepo of focused, opinionated TypeScript libraries published under the `@chuli-dev` scope on npm.

## ✨ Features

- **TypeScript-first** - Strict configs, full type declarations, ESM-first packages
- **Dual ESM/CJS where it matters** - `errors` and `value-objects` ship both formats; configs stay ESM-only
- **Cross-platform domain libs** - `errors` and `value-objects` run in Node.js, modern browsers, Bun and Deno
- **Modern tooling** - Flat-config ESLint, strict `tsconfig` presets, opinionated Prettier defaults
- **Independent packages** - Pick only what you need

## 📦 Packages

| Package                                                  | Description                                                                |
| -------------------------------------------------------- | -------------------------------------------------------------------------- |
| [`@chuli-dev/typescript-config`](libs/typescript-config) | Strict TypeScript configuration presets for ESM and CommonJS projects      |
| [`@chuli-dev/eslint-config`](libs/eslint-config)         | Self-contained ESLint flat-config presets for modern TypeScript projects   |
| [`@chuli-dev/prettier-config`](libs/prettier-config)     | Shared Prettier configuration                                              |
| [`@chuli-dev/errors`](libs/errors)                       | Domain-oriented error classes for TypeScript applications                  |
| [`@chuli-dev/value-objects`](libs/value-objects)         | Value Object base classes and primitives for DDD-style TypeScript projects |

Each package is published independently to npm. See its README for installation and usage.

## 🏗️ Development

This is a monorepo managed with **npm workspaces**.

**Prerequisites:**

- Node.js `>=20`

**Setup:**

```bash
git clone git@github.com:TomasAntunez/typescript-libs.git
cd typescript-libs
npm install
```

`npm install` triggers the root `postinstall`, which runs `husky` and then builds the whole project with `tsc -b` (TypeScript project references in topological order with incremental caching). Every workspace ends up with a ready-to-use `dist/`.

**Common commands:**

```bash
npm run build          # tsc -b (incremental) + per-flavor dist package.jsons
npm run build:clean    # tear down all build artifacts

npm run lint:check     # eslint with --max-warnings 0 across workspaces
npm run format:check   # prettier check across the repo

npm run start:example  # run the example app from its built dist
npm run start:cli -- <command>   # run the internal cli
```

Type checking is not a separate gate: `tsc -b` is part of the build, so any type error fails the install/build itself.

Run lint on a single workspace with `--workspace`:

```bash
npm run lint:check --workspace=@chuli-dev/errors
```

## 📚 Documentation

Each package has its own README under `libs/`. The `apps/` folder contains internal apps (`example`, `cli`) used to dogfood the libraries.

## 🤝 Contributing

Contributions are welcome. For major changes, please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes following the [Conventional Commits](https://www.conventionalcommits.org/) spec
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT - see the [LICENSE](./LICENSE) file for details.

## 👤 Author

**chuli-dev**

- GitHub: [@TomasAntunez](https://github.com/TomasAntunez)

## ⭐ Support

If you find this project useful, consider giving it a star on GitHub.

---

Made with ❤️
