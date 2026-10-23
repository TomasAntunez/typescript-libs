import { parseOptional, Text } from '@chuli-dev/value-objects';

import type { Command } from '../commands/command.js';
import { Identifier } from '../identifiers/identifier.vo.js';
import { formatHelpTable, type HelpTableRow } from '../shared/format-help-table.util.js';

import { DuplicateCommandError } from './duplicate-command.error.js';
import { UnknownCommandError } from './unknown-command.error.js';

export interface CliProps {
  name: Identifier;
  version: Text;
  description?: Text;
  commands: Command[];
}

export interface CliPrimitives {
  name: string;
  version: string;
  description?: string;
  commands: Command[];
}

export class Cli {
  readonly name: Identifier;
  readonly version: Text;
  readonly description?: Text;

  private readonly commands = new Map<string, Command>();

  constructor(props: CliProps) {
    this.name = props.name;
    this.version = props.version;
    this.description = props.description;

    for (const command of props.commands) {
      const name = command.config.name.toString();

      if (this.commands.has(name)) {
        throw new DuplicateCommandError(name);
      }
      this.commands.set(name, command);
    }
  }

  static fromPrimitives(primitives: CliPrimitives): Cli {
    return new Cli({
      name: Identifier.fromString(primitives.name),
      version: Text.fromString(primitives.version),
      description: parseOptional(primitives.description, Text.fromString),
      commands: primitives.commands,
    });
  }

  async run(): Promise<void> {
    const [commandName, ...tokens] = process.argv.slice(2);

    if (!commandName || commandName === '--help' || commandName === '-h') {
      this.showHelp();
      return;
    }

    const command = this.commands.get(commandName);

    if (!command) {
      throw new UnknownCommandError(commandName, this.name.toString());
    }

    const input = command.config.parse(tokens);

    await command.execute(input);
  }

  private showHelp(): void {
    const name = this.name.toString();

    const lines = [`${name} ${this.version.toString()}`];

    if (this.description) {
      lines.push(this.description.toString());
    }

    lines.push('', `Usage: ${name} <command> [arguments] [options]`, '', 'Commands:');

    const rows: HelpTableRow[] = [];

    for (const [commandName, command] of this.commands) {
      rows.push({ label: commandName, description: command.config.description?.toString() });
    }

    lines.push(...formatHelpTable(rows));

    console.log(lines.join('\n'));
  }
}
