# @chuli-dev/prettier-config

Shared Prettier configuration for consistent code formatting across projects.

## ✨ Features

- **Consistent formatting** - Same code style across all your projects
- **Zero-config** - Install, reference, and you're done
- **Extensible** - Easily override specific options when needed

## 📋 Rules

| Rule            | Value  |
| --------------- | ------ |
| **singleQuote** | `true` |
| **printWidth**  | `100`  |

## 📦 Installation

```bash
npm install -D @chuli-dev/prettier-config prettier
```

## 🚀 Usage

Reference the config in your `package.json`:

```json
{
  "prettier": "@chuli-dev/prettier-config"
}
```

Or create a `.prettierrc` file:

```json
"@chuli-dev/prettier-config"
```

### Extending / Overriding

If you need to override specific options, use a `prettier.config.js` file:

```js
import prettierConfig from '@chuli-dev/prettier-config';

export default {
  ...prettierConfig,
  printWidth: 120,
};
```

## 🔧 Requirements

- **Prettier** `>=3.0.0`

## 📄 License

MIT - see the [LICENSE](https://github.com/TomasAntunez/typescript-libs/blob/main/libs/prettier-config/LICENSE) file for details.

## 👤 Author

**chuli-dev**
