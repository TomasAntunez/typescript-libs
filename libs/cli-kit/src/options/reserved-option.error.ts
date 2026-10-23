import { BusinessRuleError } from '@chuli-dev/errors';

export class ReservedOptionError extends BusinessRuleError {
  constructor(identifier: string, key: string) {
    super(`Reserved option: ${identifier}`, {
      metadata: { key },
    });
  }
}
