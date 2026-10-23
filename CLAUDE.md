# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

npm workspaces monorepo of shared TypeScript configuration/tooling libraries published to npm under the `@chuli-dev` scope. All packages are ESM-first (`"type": "module"`); `errors`, `value-objects` and `cli-kit` additionally ship a CommonJS build via conditional exports. Requires Node.js >= 20.

## Coding Principles

Keep everything as minimal as possible without sacrificing robustness. Clean, simple code is preferred above all — but never at the cost of correctness or reliability. When in doubt, choose the simpler option that still covers the real requirements; avoid speculative abstractions, premature configuration, and ceremony that doesn't pull its weight.

Use blank lines to separate logical groups of statements anywhere it improves readability — inside functions, between class members, between steps of a CI workflow, between config blocks. Don't run unrelated pieces together in a wall, and don't fragment every line either: group what belongs together and let the blank lines mark the seams.

## Workflow

Never run `git commit` (or any other write operation against git history) on your own. Stage and commit only when the user explicitly asks for it. You may freely edit files, run builds, and run lint/format checks without confirmation.

## Repository Layout

- `libs/` — Published packages: `typescript-config`, `eslint-config`, `prettier-config`, `errors`, `value-objects`, `cli-kit`
- `apps/` — Internal/private apps (`example`, `cli`) used to dogfood the libraries

## Common Commands

```bash
# Install all dependencies (from root). The root `postinstall` runs `husky`
# and then builds the whole graph via `tsc -b`, leaving every workspace
# ready-to-use under `dist/`.
npm install

# Build the full project (incremental via tsc project references). Also runs
# `write-dist-package-jsons` to drop the per-flavor `package.json` files in
# each dual lib's `dist/{esm,cjs}/`.
npm run build

# Tear down all build artifacts (the package.jsons inside dist, then tsc -b --clean).
npm run build:clean

# Run the example app (uses the built dist).
npm run start:example

# Run the internal cli app (bin linked by npm install; uses the built dist).
npx chuli-dev <command-name>

# Quality gates
npm run lint:check
npm run format:check

# Run lint on a single workspace
npm run lint:check --workspace=@chuli-dev/errors
```

## Architecture Notes

- **typescript-config**: Pure JSON config files (no build step). Exports platform-specific tsconfig presets: ESM (`./base`, `./lib`, `./node`, `./node.lib`) and CommonJS variants (`./lib.cjs`, `./node.cjs`, `./node.cjs.lib`). All `lib*` presets enable `composite: true` so consumers are ready to participate in TypeScript project references.
- **eslint-config**: TypeScript source in `src/` that builds to `dist/`. Exposes 12 self-contained ESLint flat-config presets across three orthogonal axes: TypeScript level (`none` / `strict` / `type-aware`) × Node.js × ESM enforcement. Consumers `export default` a single preset (e.g. `typescriptTypecheckedNodeEsm`) instead of composing fragments.
- **prettier-config**: Single JSON config file, no build step.
- **errors**: TypeScript source in `src/` that builds to dual ESM (`dist/esm/`) and CJS (`dist/cjs/`) outputs via the root `tsc -b` graph + conditional `exports`. Domain-oriented error classes. Cross-platform (uses `lib` tsconfig, no Node-specific typings; ships an ambient `Error.captureStackTrace` declaration in `globals.d.ts`).
- **value-objects**: Same dual-build pattern as `errors`. DDD-style Value Object base classes and primitives. Cross-platform; declares `@chuli-dev/errors` as a `peerDependency` so consumers share a single instance across libs. References `errors` via TS project references for typecheck-aware builds.
- **cli-kit**: Same dual-build pattern as `errors`. Object-oriented building blocks for CLIs (commands, arguments, options). Depends on `errors` and `value-objects`; references both via TS project references.
- **Build orchestration**: A single root `tsc -b tsconfig.build.esm.json tsconfig.build.cjs.json` builds the whole graph in topological order with incremental caching. Each lib declares `composite: true` (via its preset) plus `references` to its sibling deps for the matching flavor (esm refs esm, cjs refs cjs). The internal `apps/cli` is also part of the graph so it can be invoked as a compiled `node dist/main.js` from build steps.
- **Per-flavor `package.json`**: The `write-dist-package-jsons` command (in `apps/cli`) walks `libs/`, detects dual builds by the presence of both `tsconfig.esm.json` and `tsconfig.cjs.json`, and drops `{"type":"module"}` or `{"type":"commonjs"}` in each `dist/{esm,cjs}/`. Idempotent; `--clean` removes them.
- **Libraries reference each other via workspace `"*"` versions** (e.g., `cli-kit` depends on `errors` and `value-objects` at runtime).
- Root `package.json` sets the Prettier config for the entire repo via `"prettier": "@chuli-dev/prettier-config"`.

## Quality Gates

The publish workflow enforces two independent checks before any package is published:

1. `lint:check` — ESLint with `--max-warnings 0`. Warnings are not tolerated; treat them as errors. Fans out to workspaces via `npm run lint:check --workspaces --if-present`.
2. `format:check` — Prettier check across the whole repo.

TypeScript validation is not a separate gate: `tsc -b` is part of the build (triggered by `postinstall`), and any type error fails the install / build step itself.

To scale to a new lib or app, declare a `lint:check` script in its `package.json`. For a new publishable lib, add a `tsconfig.{esm,cjs}.json` (extending the matching `@chuli-dev/typescript-config` preset, with `tsBuildInfoFile` and `references` to its deps), and add it to `tsconfig.build.{esm,cjs}.json` at the root. The build, lint, and `write-dist-package-jsons` flows pick it up automatically.

## Publishing

Triggered manually via the `publish-packages.yml` GitHub Actions workflow (`workflow_dispatch`), selecting individual packages to publish. The workflow runs `npm ci` (which runs the root `postinstall` → `husky && npm run build`, leaving all libs built), then the quality gates, then `npm publish` for each selected package.
