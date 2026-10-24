# @chuli-dev/cli-kit

Object-oriented building blocks for CLIs in TypeScript.

## ✨ Features

- **Command-oriented** - Every command is a class with a declarative config and an `execute` method
- **Typed input** - Declare the shape of arguments and options once; `execute` receives a fully typed `input`
- **Positional arguments** - Required, optional and variadic, validated in declaration order
- **Options and flags** - Long and short names, required options, custom parsers
- **Built-in help** - `--help` / `-h` for the CLI and for every command, plus `--version` / `-v`
- **Typed errors** - Every parsing or configuration failure throws a dedicated error class built on [`@chuli-dev/errors`](https://www.npmjs.com/package/@chuli-dev/errors)
- **Dual ESM/CJS** - Ships both module formats with proper conditional exports and TypeScript declarations

## 📦 Installation

```bash
npm install @chuli-dev/cli-kit @chuli-dev/errors @chuli-dev/value-objects
```

`@chuli-dev/errors` and `@chuli-dev/value-objects` are declared as peer dependencies so consumers share a single instance across all `@chuli-dev/*` libraries that rely on them.

## 🚀 Quick Start

Declare a command:

```ts
import { Command, CommandConfig, type CommandInput, OptionType } from '@chuli-dev/cli-kit';

type GreetInput = CommandInput<{ name: string }, { times?: number; shout: boolean }>;

export class GreetCommand extends Command<GreetInput> {
  readonly config = CommandConfig.fromPrimitives<GreetInput>({
    name: 'greet',
    description: 'Greet someone',
    args: {
      name: { name: 'name', description: 'Who to greet' },
    },
    options: {
      times: {
        type: OptionType.Option,
        name: 'times',
        shortName: 't',
        description: 'How many times to repeat the greeting',
        parse: Number,
      },
      shout: {
        type: OptionType.Flag,
        name: 'shout',
        shortName: 's',
        description: 'Greet in uppercase',
      },
    },
  });

  execute(input: GreetInput): void {
    const greeting = `Hello, ${input.args.name}!`;

    for (let i = 0; i < (input.options.times ?? 1); i++) {
      console.log(input.options.shout ? greeting.toUpperCase() : greeting);
    }
  }
}
```

Register it in a `Cli` and run it:

```ts
import { Cli } from '@chuli-dev/cli-kit';

import { GreetCommand } from './commands/greet.command.js';

const cli = Cli.fromPrimitives({
  name: 'my-cli',
  version: '1.0.0',
  description: 'Example CLI built with cli-kit',
  commands: [new GreetCommand()],
});

await cli.run();
```

`run()` reads `process.argv`, picks the command by its first token, parses the rest and calls `execute`:

```
$ my-cli greet World -t 2 --shout
HELLO, WORLD!
HELLO, WORLD!
```

## 🧩 Declaring input

A command's input is split in `args` (positional) and `options` (named). Both are objects whose keys become the keys of `input.args` / `input.options`, so the declaration must match the `CommandInput` type parameter key by key. TypeScript enforces this at compile time.

### Arguments

| Field         | Type                       | Default | Description                                                     |
| ------------- | -------------------------- | ------- | --------------------------------------------------------------- |
| `name`        | `string`                   | -       | Shown in usage and help. Lowercase letters, digits, hyphens     |
| `description` | `string`                   | -       | Shown in help                                                   |
| `isRequired`  | `boolean`                  | `true`  | Missing required arguments throw `MissingRequiredArgumentError` |
| `isVariadic`  | `boolean`                  | `false` | Collects every remaining positional token into an array         |
| `parse`       | `(raw: string) => unknown` | -       | Transforms the raw token. Defaults to the string itself         |

Arguments are consumed in declaration order. Two rules are checked when the config is built:

- A required argument cannot follow an optional one.
- A variadic argument must be the last one.

### Options

| Field         | Type                                     | Default | Description                                                                                   |
| ------------- | ---------------------------------------- | ------- | --------------------------------------------------------------------------------------------- |
| `type`        | `OptionType.Option` or `OptionType.Flag` | -       | An `Option` takes a value, a `Flag` is a boolean switch                                       |
| `name`        | `string`                                 | -       | Long form, used as `--name`                                                                   |
| `shortName`   | `string`                                 | -       | Single letter, used as `-n`                                                                   |
| `description` | `string`                                 | -       | Shown in help                                                                                 |
| `isRequired`  | `boolean`                                | `false` | `Option` only. Missing required options throw `MissingRequiredOptionError`                    |
| `parse`       | `(raw: string) => unknown`               | -       | `Option`: transforms the raw value. `Flag`: receives `true` when present, `false` when absent |

- An `Option` takes its value from the next token: `--times 3` or `-t 3`. The value may start with `-`, so negative numbers work.
- A `Flag` resolves to `false` when absent, so the declared type should be a non-optional `boolean`.
- Options can be placed anywhere among the arguments. Each one may appear once; repeating it throws `RepeatedOptionError`.
- `help` and `h` are reserved for the built-in help and cannot be declared.

### Commands without input

Use `InputValues` for the side you don't need:

```ts
import { type CommandInput, type InputValues } from '@chuli-dev/cli-kit';

type CleanInput = CommandInput<InputValues, { dryRun: boolean }>;
```

## 🆘 Built-in help

`--help` / `-h` on their own (or an empty command line) print the global help; after a command they print that command's help. `--version` / `-v` print the version.

```
$ my-cli --help
my-cli 1.0.0
Example CLI built with cli-kit

Usage: my-cli <command> [arguments] [options]

Commands:
  greet  Greet someone

Options:
  -h, --help     Show this help
  -v, --version  Show the version
```

```
$ my-cli greet --help
Usage: my-cli greet <name> [options]

Greet someone

Arguments:
  name  Who to greet

Options:
  -t, --times <value>  How many times to repeat the greeting
  -s, --shout          Greet in uppercase
  -h, --help           Show this help
```

Required arguments render as `<name>`, optional ones as `[name]`, variadic ones with a trailing `...`. Required options get a `(required)` suffix in their description.

## ⚠️ Errors

`run()` does not catch anything. Parsing and execution failures propagate so the host application decides how to report them and which exit code to use.

Every error thrown by this library extends a class from `@chuli-dev/errors`, so a single `instanceof` separates bad user input from bad configuration:

```ts
import { ValidationError } from '@chuli-dev/errors';

try {
  await cli.run();
} catch (err) {
  if (err instanceof ValidationError) {
    console.error(err.message);
    process.exitCode = 1;
  } else {
    throw err;
  }
}
```

### User input (`ValidationError`)

| Error                          | When                                                         |
| ------------------------------ | ------------------------------------------------------------ |
| `UnknownCommandError`          | The first token does not match any registered command        |
| `UnexpectedArgumentError`      | More positional tokens than declared arguments               |
| `MissingRequiredArgumentError` | A required argument was not provided                         |
| `UnknownOptionError`           | A token starting with `-` does not match any declared option |
| `MissingOptionValueError`      | An `Option` was the last token, with no value after it       |
| `MissingRequiredOptionError`   | A required option was not provided                           |
| `RepeatedOptionError`          | The same option appeared more than once                      |

### Configuration (`BusinessRuleError`)

| Error                       | When                                                                            |
| --------------------------- | ------------------------------------------------------------------------------- |
| `DuplicateCommandError`     | Two commands share the same name                                                |
| `DuplicateIdentifierError`  | Two arguments or options share the same name or short name                      |
| `InvalidArgumentOrderError` | A required argument follows an optional one, or a variadic argument is not last |
| `ReservedOptionError`       | An option is named `help` or uses `h` as short name                             |

Invalid names (empty, wrong characters, short names longer than one letter) throw `InvalidValueError` from `@chuli-dev/value-objects`.

## 🧱 Building blocks

`fromPrimitives` is the convenient entry point, but every piece is a plain class you can instantiate yourself through its `Props` interface:

| Class                            | Role                                                                 |
| -------------------------------- | -------------------------------------------------------------------- |
| `Cli`                            | Command registry and entry point (`run`)                             |
| `Command`                        | Abstract base: `config` + `execute`                                  |
| `CommandConfig`                  | Name, description, `Args` and `Options`. Owns `parse` and `showHelp` |
| `Args` / `Arg`                   | Positional arguments                                                 |
| `Options` / `Option` / `Flag`    | Named options                                                        |
| `Identifier` / `ShortIdentifier` | Validated names (`Text` subclasses from `@chuli-dev/value-objects`)  |

## 📝 Notes

- Option values are always taken from the next token. `--times=3` and bundled short flags (`-st`) are not supported.
- Any token starting with `-` is treated as an option, so positional argument values cannot start with `-`.
- Names are normalized to lowercase. `Identifier` accepts `[a-z][a-z0-9-]+` (at least two characters); `ShortIdentifier` accepts exactly one letter.

## 🔧 Requirements

- **Node.js** `>=20`
- **TypeScript** `>=5` (only if consuming the type declarations)

## 📄 License

MIT - see the [LICENSE](https://github.com/TomasAntunez/typescript-libs/blob/main/libs/cli-kit/LICENSE) file for details.

## 👤 Author

**chuli-dev** - [@TomasAntunez](https://github.com/TomasAntunez)
