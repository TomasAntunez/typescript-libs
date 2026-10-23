import { Command, CommandConfig, type CommandInput, OptionType } from '@chuli-dev/cli-kit';

type GreetArgs = {
  name: string;
  nicknames?: string[];
};

type GreetOptions = {
  times?: number;
  shout: boolean;
};

type GreetInput = CommandInput<GreetArgs, GreetOptions>;

export class GreetCommand extends Command<GreetInput> {
  readonly config = CommandConfig.fromPrimitives<GreetInput>({
    name: 'greet',
    description: 'Example command to showcase cli-kit',
    args: {
      name: { name: 'name', description: 'Who to greet' },
      nicknames: {
        name: 'nicknames',
        description: 'Extra nicknames appended to the greeting',
        isRequired: false,
        isVariadic: true,
      },
    },
    options: {
      times: {
        type: OptionType.Option,
        name: 'times',
        shortName: 't',
        description: 'How many times to repeat the greeting',
        parse: Number,
      },
      shout: {
        type: OptionType.Flag,
        name: 'shout',
        shortName: 's',
        description: 'Greet in uppercase',
      },
    },
  });

  execute(input: GreetInput): void {
    const { name, nicknames } = input.args;
    const { shout } = input.options;
    const times = input.options.times ?? 1;

    const greeting = `Hello, ${[name, ...(nicknames ?? [])].join(' ')}!`;

    for (let i = 0; i < times; i++) {
      console.log(shout ? greeting.toUpperCase() : greeting);
    }
  }
}
