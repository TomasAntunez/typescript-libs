import { Cli } from '@chuli-dev/cli-kit';

import { FarewellCommand } from './commands/farewell.command.js';
import { GreetCommand } from './commands/greet.command.js';
import { PingCommand } from './commands/ping.command.js';
import { WriteDistPackageJsonsCommand } from './commands/write-dist-package-jsons.command.js';

const cli = Cli.fromPrimitives({
  name: 'chuli-dev',
  version: '0.0.1',
  description: 'Internal CLI for the chuli-dev monorepo',
  commands: [
    new FarewellCommand(),
    new GreetCommand(),
    new PingCommand(),
    new WriteDistPackageJsonsCommand(),
  ],
});

await cli.run();
