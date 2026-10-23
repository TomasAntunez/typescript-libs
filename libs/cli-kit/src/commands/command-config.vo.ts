import { parseOptional, Text } from '@chuli-dev/value-objects';

import { Args, type ArgsPrimitives } from '../args/args.vo.js';
import { UnexpectedArgumentError } from '../args/unexpected-argument.error.js';
import { Identifier } from '../identifiers/identifier.vo.js';
import { MissingOptionValueError } from '../options/missing-option-value.error.js';
import type { Option } from '../options/option.vo.js';
import { OptionType } from '../options/option-type.enum.js';
import { Options, type OptionsPrimitives } from '../options/options.vo.js';
import { RepeatedOptionError } from '../options/repeated-option.error.js';
import { UnknownOptionError } from '../options/unknown-option.error.js';
import { formatHelpTable } from '../shared/format-help-table.util.js';
import { ValuesAccumulator } from '../shared/values.accumulator.js';

import type { CommandInput } from './command-input.dto.js';

interface PendingValue {
  token: string;
  key: string;
  option: Option;
}

export interface CommandConfigProps<TInput extends CommandInput = CommandInput> {
  name: Identifier;
  description?: Text;
  args?: Args<TInput['args']>;
  options?: Options<TInput['options']>;
}

export type CommandConfigPrimitives<TInput extends CommandInput = CommandInput> = {
  name: string;
  description?: string;
} & (string extends keyof TInput['args']
  ? { args?: ArgsPrimitives<TInput['args']> }
  : { args: ArgsPrimitives<TInput['args']> }) &
  (string extends keyof TInput['options']
    ? { options?: OptionsPrimitives<TInput['options']> }
    : { options: OptionsPrimitives<TInput['options']> });

export class CommandConfig<TInput extends CommandInput = CommandInput> {
  readonly name: Identifier;
  readonly description?: Text;
  readonly args?: Args<TInput['args']>;
  readonly options?: Options<TInput['options']>;

  constructor(props: CommandConfigProps<TInput>) {
    this.name = props.name;
    this.description = props.description;
    this.args = props.args;
    this.options = props.options;
  }

  static fromPrimitives<TInput extends CommandInput = CommandInput>(
    primitives: CommandConfigPrimitives<TInput>,
  ): CommandConfig<TInput> {
    return new CommandConfig<TInput>({
      name: Identifier.fromString(primitives.name),
      description: parseOptional(primitives.description, Text.fromString),
      args: parseOptional(primitives.args, Args.fromPrimitives),
      options: parseOptional(primitives.options, Options.fromPrimitives),
    });
  }

  parse(tokens: string[]): TInput {
    const argValues = new ValuesAccumulator();
    const optionValues = new ValuesAccumulator();

    let argIndex = 0;
    let pendingValue: PendingValue | undefined;

    for (const token of tokens) {
      if (pendingValue) {
        const value = pendingValue.option.parse ? pendingValue.option.parse(token) : token;

        optionValues.set(pendingValue.key, value);
        pendingValue = undefined;
        continue;
      }

      if (!token.startsWith('-')) {
        if (!this.args) {
          throw new UnexpectedArgumentError(token);
        }

        argIndex = this.args.consume(argIndex, token, argValues);
        continue;
      }

      if (!this.options) {
        throw new UnknownOptionError(token);
      }

      const match = this.options.match(token);

      if (optionValues.has(match.key)) {
        throw new RepeatedOptionError(token, match.key);
      }

      if (match.option.type === OptionType.Flag) {
        optionValues.set(match.key, match.option.parse ? match.option.parse(true) : true);
      } else {
        pendingValue = { token, key: match.key, option: match.option };
      }
    }

    if (pendingValue) {
      throw new MissingOptionValueError(pendingValue.token, pendingValue.key);
    }

    this.options?.complete(optionValues);
    this.args?.complete(argIndex, argValues);

    return { args: argValues.toValues(), options: optionValues.toValues() } as TInput;
  }

  showHelp(cliName: string): void {
    const usage = [cliName, this.name.toString()];

    if (this.args) {
      usage.push(this.args.toUsage());
    }
    usage.push('[options]');

    const lines = [`Usage: ${usage.join(' ')}`];

    if (this.description) {
      lines.push('', this.description.toString());
    }

    if (this.args) {
      lines.push('', 'Arguments:', ...formatHelpTable(this.args.toHelpRows()));
    }

    const optionRows = this.options?.toHelpRows() ?? [];
    optionRows.push({ label: '-h, --help', description: 'Show this help' });

    lines.push('', 'Options:', ...formatHelpTable(optionRows));

    console.log(lines.join('\n'));
  }
}
