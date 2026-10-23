import { ValueObject } from '@chuli-dev/value-objects';

import { DuplicateIdentifierError } from '../identifiers/duplicate-identifier.error.js';
import type { HelpTableRow } from '../shared/format-help-table.util.js';
import type { InputValues } from '../shared/input-values.dto.js';
import type { ValuesAccumulator } from '../shared/values.accumulator.js';

import { Flag, type FlagPrimitives } from './flag.vo.js';
import { MissingRequiredOptionError } from './missing-required-option.error.js';
import { Option, type OptionPrimitives } from './option.vo.js';
import { OptionType } from './option-type.enum.js';
import { ReservedOptionError } from './reserved-option.error.js';
import { UnknownOptionError } from './unknown-option.error.js';

const RESERVED_NAME = 'help';
const RESERVED_SHORT_NAME = 'h';

export type OptionLike = Option | Flag;

export interface OptionMatch {
  key: string;
  option: OptionLike;
}

export type OptionLikePrimitives =
  | ({ type: OptionType.Option } & OptionPrimitives)
  | ({ type: OptionType.Flag } & FlagPrimitives);

export type OptionsItems<TValues extends InputValues = InputValues> = {
  [TKey in keyof TValues]-?: OptionLike;
};

export type OptionsPrimitives<TValues extends InputValues = InputValues> = {
  [TKey in keyof TValues]-?: OptionLikePrimitives;
};

export class Options<TValues extends InputValues = InputValues> extends ValueObject {
  readonly items: Readonly<OptionsItems<TValues>>;

  private readonly byName = new Map<string, OptionMatch>();
  private readonly byShortName = new Map<string, OptionMatch>();

  constructor(items: OptionsItems<TValues>) {
    super();

    for (const [key, option] of Object.entries<OptionLike>(items)) {
      const match: OptionMatch = { key, option };

      const name = option.name.toString();

      if (name === RESERVED_NAME) {
        throw new ReservedOptionError(name, key);
      }
      if (this.byName.has(name)) {
        throw new DuplicateIdentifierError(name, key);
      }
      this.byName.set(name, match);

      if (!option.shortName) continue;

      const shortName = option.shortName.toString();

      if (shortName === RESERVED_SHORT_NAME) {
        throw new ReservedOptionError(shortName, key);
      }
      if (this.byShortName.has(shortName)) {
        throw new DuplicateIdentifierError(shortName, key);
      }
      this.byShortName.set(shortName, match);
    }

    this.items = items;
  }

  static fromPrimitives<TValues extends InputValues>(
    this: void,
    primitives: OptionsPrimitives<TValues>,
  ): Options<TValues> {
    const items: OptionsItems = {};

    for (const [key, value] of Object.entries<OptionLikePrimitives>(primitives)) {
      items[key] =
        value.type === OptionType.Option
          ? Option.fromPrimitives(value)
          : Flag.fromPrimitives(value);
    }

    return new Options<TValues>(items as OptionsItems<TValues>);
  }

  match(token: string): OptionMatch {
    const match = token.startsWith('--')
      ? this.byName.get(token.slice(2))
      : this.byShortName.get(token.slice(1));

    if (match === undefined) {
      throw new UnknownOptionError(token);
    }

    return match;
  }

  complete(values: ValuesAccumulator): void {
    for (const match of this.byName.values()) {
      if (values.has(match.key)) continue;

      if (match.option.type === OptionType.Flag) {
        values.set(match.key, match.option.parse ? match.option.parse(false) : false);
        continue;
      }

      if (match.option.isRequired.toBoolean()) {
        throw new MissingRequiredOptionError(match.option.name.toString(), match.key);
      }
    }
  }

  toHelpRows(): HelpTableRow[] {
    const rows: HelpTableRow[] = [];

    for (const { option } of this.byName.values()) {
      let description = option.description?.toString();

      if (option.type === OptionType.Option && option.isRequired.toBoolean()) {
        description = description ? `${description} (required)` : '(required)';
      }

      rows.push({ label: option.toUsage(), description });
    }

    return rows;
  }
}
