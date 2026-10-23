import { parseOptional } from '@chuli-dev/value-objects';

import { ShortIdentifier } from '../identifiers/short-identifier.vo.js';
import {
  BaseInput,
  type BaseInputPrimitives,
  type BaseInputProps,
} from '../shared/base-input.vo.js';

export interface BaseOptionProps extends BaseInputProps {
  shortName?: ShortIdentifier;
}

export interface BaseOptionPrimitives extends BaseInputPrimitives {
  shortName?: string;
}

export abstract class BaseOption extends BaseInput {
  readonly shortName?: ShortIdentifier;

  constructor(props: BaseOptionProps) {
    super(props);
    this.shortName = props.shortName;
  }

  protected static override parsePrimitives(primitives: BaseOptionPrimitives): BaseOptionProps {
    return {
      ...BaseInput.parsePrimitives(primitives),
      shortName: parseOptional(primitives.shortName, ShortIdentifier.fromString),
    };
  }

  toUsage(): string {
    const name = `--${this.name.toString()}`;

    return this.shortName ? `-${this.shortName.toString()}, ${name}` : `    ${name}`;
  }
}
