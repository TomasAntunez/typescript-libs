import { Bool, parseOptional } from '@chuli-dev/value-objects';

import {
  BaseInput,
  type BaseInputPrimitives,
  type BaseInputProps,
} from '../shared/base-input.vo.js';
import { BOOL_FALSE, BOOL_TRUE } from '../shared/constants.js';

export interface ArgProps extends BaseInputProps {
  isRequired?: Bool;
  isVariadic?: Bool;
  parse?: (raw: string) => unknown;
}

export interface ArgPrimitives extends BaseInputPrimitives {
  isRequired?: boolean;
  isVariadic?: boolean;
  parse?: (raw: string) => unknown;
}

export class Arg extends BaseInput {
  readonly isRequired: Bool;
  readonly isVariadic: Bool;
  readonly parse?: (raw: string) => unknown;

  constructor(props: ArgProps) {
    super(props);
    this.isRequired = props.isRequired ?? BOOL_TRUE;
    this.isVariadic = props.isVariadic ?? BOOL_FALSE;
    this.parse = props.parse;
  }

  static fromPrimitives(this: void, primitives: ArgPrimitives): Arg {
    return new Arg({
      ...BaseInput.parsePrimitives(primitives),
      isRequired: parseOptional(primitives.isRequired, Bool.fromBoolean),
      isVariadic: parseOptional(primitives.isVariadic, Bool.fromBoolean),
      parse: primitives.parse,
    });
  }

  toUsage(): string {
    const name = this.isVariadic.toBoolean() ? `${this.name.toString()}...` : this.name.toString();

    return this.isRequired.toBoolean() ? `<${name}>` : `[${name}]`;
  }
}
