# @chuli-dev/errors

Domain-oriented error classes for TypeScript applications.

## ✨ Features

- **DDD-friendly** - Errors organized by domain and infrastructure layers
- **Minimal & flexible** - Lightweight base class, the consumer decides how to handle, log, or serialize
- **Dual ESM/CJS** - Ships both module formats with proper conditional exports and TypeScript declarations
- **Cross-platform** - Works in Node.js, modern browsers, Bun and Deno (no external runtime dependencies)
- **Native `Error` compatible** - Built on top of `Error` with full support for `cause`, `stack`, and `instanceof`
- **Optional `code` and `metadata`** - Attach machine-readable identifiers and structured context when you need them

## 📦 Installation

```bash
npm install @chuli-dev/errors
```

## 🚀 Quick Start

```ts
import { NotFoundError } from '@chuli-dev/errors';

throw new NotFoundError('User not found', {
  code: 'user_not_found',
  metadata: { userId: '123' },
});
```

Catch and inspect:

```ts
import { BaseError, NotFoundError } from '@chuli-dev/errors';

try {
  // ...
} catch (err) {
  if (err instanceof NotFoundError) {
    // handle the specific case
  }
  if (err instanceof BaseError) {
    // common handling for any error from this library
    console.error(err.name, err.message, err.code, err.metadata);
  }
}
```

## 📋 Available Errors

### Domain

| Error                     | Description                                                       |
| ------------------------- | ----------------------------------------------------------------- |
| **`BaseError`**           | Abstract base class extended by every error in this library       |
| **`AuthenticationError`** | The caller could not be authenticated                             |
| **`AuthorizationError`**  | The caller is authenticated but not allowed to perform the action |
| **`BusinessRuleError`**   | A domain invariant or business rule was violated                  |
| **`NotFoundError`**       | A required resource does not exist                                |
| **`RateLimitError`**      | A domain-defined usage limit was exceeded                         |
| **`ValidationError`**     | Input data did not satisfy the expected shape or constraints      |

### Infrastructure

| Error                      | Description                                                        |
| -------------------------- | ------------------------------------------------------------------ |
| **`ConfigurationError`**   | The application is misconfigured (missing env vars, invalid setup) |
| **`ExternalServiceError`** | A call to an external service failed                               |
| **`TimeoutError`**         | An operation took longer than the allowed time                     |

## 🛠️ The `BaseError` Contract

Every error extends `BaseError`, which itself extends the native `Error`.

```ts
interface BaseErrorOptions extends ErrorOptions {
  code?: string;
  metadata?: Record<string, unknown>;
}

abstract class BaseError extends Error {
  readonly code?: string;
  readonly metadata?: Record<string, unknown>;

  constructor(message: string, options?: BaseErrorOptions);
}
```

- **`name`** - Automatically set to the subclass name (e.g. `NotFoundError`)
- **`message`** - Human-readable description
- **`code`** - Optional machine-readable identifier
- **`metadata`** - Optional structured context to aid debugging or logging
- **`cause`** - Standard ES2022 option, supported through `ErrorOptions`
- **`stack`** - Captured via `Error.captureStackTrace` when available (Node.js, Bun, Chromium-based browsers); falls back to the standard `Error.stack` on engines without it (Firefox, Safari)

### Wrapping the cause

```ts
import { ExternalServiceError } from '@chuli-dev/errors';

try {
  await fetch(url);
} catch (err) {
  throw new ExternalServiceError('Failed to reach payments provider', {
    cause: err,
    code: 'payments_unreachable',
    metadata: { url },
  });
}
```

### Creating your own errors

`BaseError` is abstract. Extend it (or any of the provided classes) to create domain-specific errors:

```ts
import { BusinessRuleError } from '@chuli-dev/errors';

export class InsufficientBalanceError extends BusinessRuleError {}

throw new InsufficientBalanceError('Account balance is insufficient', {
  code: 'insufficient_balance',
  metadata: { accountId, requested, available },
});
```

## 📝 Notes

- Errors are intentionally minimal. Logging, serialization, and HTTP mapping are left to the consumer to keep the library framework-agnostic.
- Native `Error` properties (`name`, `message`, `stack`) are non-enumerable, so `JSON.stringify(err)` returns `{}` by default. Provide your own serializer when sending errors over the wire.

## 🔧 Requirements

- **TypeScript** `>=5` (only if consuming the type declarations)

## 📄 License

MIT - see the [LICENSE](https://github.com/TomasAntunez/typescript-libs/blob/main/libs/errors/LICENSE) file for details.

## 👤 Author

**chuli-dev** - [@TomasAntunez](https://github.com/TomasAntunez)
