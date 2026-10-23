import { Bool, parseOptional } from '@chuli-dev/value-objects';

import { BOOL_FALSE } from '../shared/constants.js';

import { BaseOption, type BaseOptionPrimitives, type BaseOptionProps } from './base-option.vo.js';
import { OptionType } from './option-type.enum.js';

export interface OptionProps extends BaseOptionProps {
  isRequired?: Bool;
  parse?: (raw: string) => unknown;
}

export interface OptionPrimitives extends BaseOptionPrimitives {
  isRequired?: boolean;
  parse?: (raw: string) => unknown;
}

export class Option extends BaseOption {
  readonly type = OptionType.Option;
  readonly isRequired: Bool;
  readonly parse?: (raw: string) => unknown;

  constructor(props: OptionProps) {
    super(props);
    this.isRequired = props.isRequired ?? BOOL_FALSE;
    this.parse = props.parse;
  }

  static fromPrimitives(this: void, primitives: OptionPrimitives): Option {
    return new Option({
      ...BaseOption.parsePrimitives(primitives),
      isRequired: parseOptional(primitives.isRequired, Bool.fromBoolean),
      parse: primitives.parse,
    });
  }

  override toUsage(): string {
    return `${super.toUsage()} <value>`;
  }
}
