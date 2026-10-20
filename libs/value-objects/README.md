# @chuli-dev/value-objects

Value Object base classes and primitives for DDD-style TypeScript applications.

## ✨ Features

- **DDD-friendly** - Immutable, self-validating Value Objects with structural equality
- **Strict encapsulation** - `protected` constructors and `static` factory methods only
- **Reusable validation** - Static `validate` / `validateString` methods you can call without instantiating
- **Customizable error messages** - Override the default message per call, with structured metadata in every error
- **Dual ESM/CJS** - Ships both module formats with proper conditional exports and TypeScript declarations
- **Cross-platform** - Works in Node.js, modern browsers, Bun and Deno (no external runtime dependencies)

## 📦 Installation

```bash
npm install @chuli-dev/value-objects @chuli-dev/errors
```

`@chuli-dev/errors` is declared as a peer dependency so consumers share a single instance across all `@chuli-dev/*` libraries that rely on it.

## 🚀 Quick Start

```ts
import { Decimal, Uuid } from '@chuli-dev/value-objects';

const id = Uuid.create();
const price = Decimal.fromNumber(19.99);

console.log(id.toString()); // e.g. '7c9e6679-7425-40de-944b-e07fc1f90ae7'
console.log(price.toNumber()); // 19.99
```

Parsing untrusted input (throws `InvalidValueError` on failure):

```ts
import { Integer } from '@chuli-dev/value-objects';

const age = Integer.fromString(req.body.age, {
  message: 'Age must be an integer',
});
```

Catching validation errors:

```ts
import { Integer, InvalidValueError } from '@chuli-dev/value-objects';

try {
  Integer.fromString('not-a-number');
} catch (err) {
  if (err instanceof InvalidValueError) {
    console.error(err.message, err.metadata); // { value: 'not-a-number' }
  }
}
```

## 📋 Available Value Objects

### Foundation

| Class             | Description                                                         |
| ----------------- | ------------------------------------------------------------------- |
| **`ValueObject`** | Abstract marker base class for all Value Objects                    |
| **`Primitive`**   | Abstract base for single-value primitives (string, number, boolean) |

### Primitives

| Class         | Description                                                 |
| ------------- | ----------------------------------------------------------- |
| **`Text`**    | Non-empty string (trimmed)                                  |
| **`Decimal`** | Finite number (rejects `NaN` / `Infinity`)                  |
| **`Bool`**    | Boolean. Strict `'true'` / `'false'` parsing                |
| **`Integer`** | Integer number                                              |
| **`Uuid`**    | RFC 4122 UUID (versions 1-7). `create()` generates a new v4 |

### Numeric refinements

| Class                    | Constraint   |
| ------------------------ | ------------ |
| **`PositiveDecimal`**    | `value > 0`  |
| **`NegativeDecimal`**    | `value < 0`  |
| **`NonNegativeDecimal`** | `value >= 0` |
| **`NonPositiveDecimal`** | `value <= 0` |
| **`PositiveInteger`**    | `value > 0`  |
| **`NegativeInteger`**    | `value < 0`  |
| **`NonNegativeInteger`** | `value >= 0` |
| **`NonPositiveInteger`** | `value <= 0` |

## 🛠️ The Validation Contract

Every Value Object exposes a consistent set of static methods:

```ts
class Some extends Primitive<T> {
  // Validate a primitive value. Returns the normalized value when there's
  // a transformation (e.g. trimming, lowercasing); otherwise returns void.
  static validate(value: T, options?: ValidateOptions): T | void;

  // Validate a string representation and return the parsed primitive.
  // Available where parsing applies (Decimal, Bool, Integer, ...).
  static validateString(value: string, options?: ValidateOptions): T;

  // Factory methods. Validate first, then build the instance.
  static fromX(value: T, options?: ValidateOptions): Some;
  static fromString(value: string, options?: ValidateOptions): Some;
}
```

`ValidateOptions` lets you override the default error message:

```ts
interface ValidateOptions {
  message?: string;
}
```

Every failure throws an `InvalidValueError` with the offending input attached as `metadata.value`.

### Reusing validation without an instance

The `validate` / `validateString` methods are useful when you need to check input but don't want to allocate a Value Object:

```ts
import { Integer } from '@chuli-dev/value-objects';

if (req.query.page) {
  Integer.validateString(req.query.page); // throws if invalid
}
```

## 🟰 Equality

Value Objects compare by **structural equality**, not by reference:

```ts
import { Text } from '@chuli-dev/value-objects';

const a = Text.fromString('hello');
const b = Text.fromString('hello');

a === b; // false
a.isEqualTo(b); // true
```

`isEqualTo` checks the wrapped value only. Two `Primitive<T>` instances with matching values are equal even across the inheritance hierarchy — for example, a `Text` and a custom `Email extends Text` carrying the same string. TypeScript enforces type compatibility at compile time via the `other: this` parameter, so you can't accidentally compare across unrelated primitive types (e.g. `Text` with `Decimal`).

## 🧱 Creating your own Value Objects

Extend any of the provided classes to model domain-specific concepts:

```ts
import { InvalidValueError, Text, type ValidateOptions } from '@chuli-dev/value-objects';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email extends Text {
  static override validate(value: string, options: ValidateOptions = {}): string {
    const trimmed = super.validate(value, options);

    if (!EMAIL_REGEX.test(trimmed)) {
      throw new InvalidValueError(options.message ?? 'Value must be a valid email', {
        metadata: { value },
      });
    }

    return trimmed.toLowerCase();
  }

  static override fromString(value: string, options: ValidateOptions = {}): Email {
    return new Email(Email.validate(value, options));
  }
}
```

A few rules to keep the contract consistent:

- Keep constructors `protected` and expose only `static` factories.
- Override `validate` (and `validateString` where applicable) to compose with `super`.
- Override the matching `fromX` factories so they return your subclass type.

## 📝 Notes

- Value Objects are immutable by convention (`readonly` fields). They are not frozen at runtime to keep allocation cheap.
- `Uuid.create()` relies on the global `crypto.randomUUID()`. It works in Node.js `>=19`, modern browsers (secure contexts only), Bun and Deno.
- `InvalidValueError` extends `ValidationError` from [`@chuli-dev/errors`](https://www.npmjs.com/package/@chuli-dev/errors), so you can catch any validation failure from this library — including your own subclasses — by `instanceof InvalidValueError`.

## 🔧 Requirements

- **TypeScript** `>=5` (only if consuming the type declarations)

## 📄 License

MIT - see the [LICENSE](https://github.com/TomasAntunez/typescript-libs/blob/main/libs/value-objects/LICENSE) file for details.

## 👤 Author

**chuli-dev** - [@TomasAntunez](https://github.com/TomasAntunez)
