import { Command, CommandConfig, type CommandInput, OptionType } from '@chuli-dev/cli-kit';

type FarewellArgs = {
  name: string;
  reason?: string;
};

type FarewellOptions = {
  times?: number;
  formal: boolean;
};

type FarewellInput = CommandInput<FarewellArgs, FarewellOptions>;

export class FarewellCommand extends Command<FarewellInput> {
  readonly config = CommandConfig.fromPrimitives<FarewellInput>({
    name: 'farewell',
    description: 'Example command to showcase declared input types',
    args: {
      name: { name: 'name', description: 'Who to say goodbye to' },
      reason: { name: 'reason', description: 'Why they are leaving', isRequired: false },
    },
    options: {
      times: {
        type: OptionType.Option,
        name: 'times',
        shortName: 't',
        description: 'How many times to repeat the farewell',
        parse: Number,
      },
      formal: {
        type: OptionType.Flag,
        name: 'formal',
        shortName: 'f',
        description: 'Use a formal farewell',
      },
    },
  });

  execute(input: FarewellInput): void {
    const { name, reason } = input.args;
    const { formal } = input.options;
    const times = input.options.times ?? 1;

    const farewell = formal ? `Farewell, ${name}.` : `Bye, ${name}!`;
    const suffix = reason === undefined ? '' : ` (${reason})`;

    for (let i = 0; i < times; i++) {
      console.log(`${farewell}${suffix}`);
    }
  }
}
