import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  Command,
  CommandConfig,
  type CommandInput,
  type InputValues,
  OptionType,
} from '@chuli-dev/cli-kit';
import { ConfigurationError } from '@chuli-dev/errors';

type WriteLibLicensesOptions = {
  clean: boolean;
};

type WriteLibLicensesInput = CommandInput<InputValues, WriteLibLicensesOptions>;

export class WriteLibLicensesCommand extends Command<WriteLibLicensesInput> {
  readonly config = CommandConfig.fromPrimitives<WriteLibLicensesInput>({
    name: 'write-lib-licenses',
    description: 'Copy the root LICENSE into each lib',
    options: {
      clean: {
        type: OptionType.Flag,
        name: 'clean',
        description: 'Remove the copied LICENSE files instead',
      },
    },
  });

  execute(input: WriteLibLicensesInput): void {
    const root = process.env['INIT_CWD'];

    if (!root) {
      throw new ConfigurationError(
        'INIT_CWD is not set. This command must be run via an npm script.',
      );
    }

    const license = readFileSync(resolve(root, 'LICENSE'), 'utf8');
    const libsDir = resolve(root, 'libs');

    for (const lib of readdirSync(libsDir, { withFileTypes: true })) {
      if (!lib.isDirectory()) continue;

      const targetPath = resolve(libsDir, lib.name, 'LICENSE');

      if (input.options.clean) {
        if (existsSync(targetPath)) rmSync(targetPath);
        continue;
      }

      if (existsSync(targetPath) && readFileSync(targetPath, 'utf8') === license) continue;

      writeFileSync(targetPath, license);
    }
  }
}
