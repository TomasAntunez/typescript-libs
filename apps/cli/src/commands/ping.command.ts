import { Command, CommandConfig } from '@chuli-dev/cli-kit';

export class PingCommand extends Command {
  readonly config = CommandConfig.fromPrimitives({
    name: 'ping',
    description: 'Replies with pong',
  });

  execute(): void {
    console.log('pong');
  }
}
