import { ValueObject } from '@chuli-dev/value-objects';

import { DuplicateIdentifierError } from '../identifiers/duplicate-identifier.error.js';
import type { HelpTableRow } from '../shared/format-help-table.util.js';
import type { InputValues } from '../shared/input-values.dto.js';
import type { ValuesAccumulator } from '../shared/values.accumulator.js';

import { Arg, type ArgPrimitives } from './arg.vo.js';
import { InvalidArgumentOrderError } from './invalid-argument-order.error.js';
import { MissingRequiredArgumentError } from './missing-required-argument.error.js';
import { UnexpectedArgumentError } from './unexpected-argument.error.js';

export type ArgsItems<TValues extends InputValues = InputValues> = {
  [TKey in keyof TValues]-?: Arg;
};

export type ArgsPrimitives<TValues extends InputValues = InputValues> = {
  [TKey in keyof TValues]-?: ArgPrimitives;
};

export interface ArgMatch {
  key: string;
  arg: Arg;
}

export class Args<TValues extends InputValues = InputValues> extends ValueObject {
  readonly items: Readonly<ArgsItems<TValues>>;

  private readonly entries: ArgMatch[] = [];

  constructor(items: ArgsItems<TValues>) {
    super();

    const seenNames = new Set<string>();
    let optionalSeen = false;
    let variadicSeen = false;

    for (const [key, arg] of Object.entries<Arg>(items)) {
      this.entries.push({ key, arg });

      const name = arg.name.toString();

      if (seenNames.has(name)) {
        throw new DuplicateIdentifierError(name, key);
      }
      seenNames.add(name);

      const metadata = { name, key };

      if (variadicSeen) {
        throw new InvalidArgumentOrderError('Variadic argument must be the last one', metadata);
      }
      if (arg.isVariadic.toBoolean()) {
        variadicSeen = true;
      }

      if (arg.isRequired.toBoolean()) {
        if (optionalSeen) {
          throw new InvalidArgumentOrderError(
            'Required argument cannot follow an optional one',
            metadata,
          );
        }
      } else {
        optionalSeen = true;
      }
    }

    this.items = items;
  }

  static fromPrimitives<TValues extends InputValues>(
    this: void,
    primitives: ArgsPrimitives<TValues>,
  ): Args<TValues> {
    const items: ArgsItems = {};

    for (const [key, value] of Object.entries<ArgPrimitives>(primitives)) {
      items[key] = Arg.fromPrimitives(value);
    }

    return new Args<TValues>(items as ArgsItems<TValues>);
  }

  consume(index: number, token: string, values: ValuesAccumulator): number {
    const match = this.entries[index];

    if (!match) {
      throw new UnexpectedArgumentError(token);
    }

    const value = match.arg.parse ? match.arg.parse(token) : token;

    if (match.arg.isVariadic.toBoolean()) {
      values.append(match.key, value);
      return index;
    }

    values.set(match.key, value);

    return index + 1;
  }

  complete(index: number, values: ValuesAccumulator): void {
    for (const match of this.entries.slice(index)) {
      if (values.has(match.key)) continue;

      if (match.arg.isRequired.toBoolean()) {
        throw new MissingRequiredArgumentError(match.arg.name.toString(), match.key);
      }
    }
  }

  toUsage(): string {
    return this.entries.map(({ arg }) => arg.toUsage()).join(' ');
  }

  toHelpRows(): HelpTableRow[] {
    return this.entries.map(({ arg }) => ({
      label: arg.name.toString(),
      description: arg.description?.toString(),
    }));
  }
}
