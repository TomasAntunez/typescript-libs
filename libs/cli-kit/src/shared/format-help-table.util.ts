const PADDING = '  ';

export interface HelpTableRow {
  label: string;
  description?: string;
}

export const formatHelpTable = (rows: HelpTableRow[]): string[] => {
  let width = 0;

  for (const row of rows) {
    if (row.label.length > width) {
      width = row.label.length;
    }
  }

  const descriptionColumn = PADDING.length + width + PADDING.length;
  const descriptionWidth = process.stdout.columns
    ? process.stdout.columns - descriptionColumn
    : Infinity;

  const continuationPrefix = ' '.repeat(descriptionColumn);

  const lines: string[] = [];

  for (const row of rows) {
    if (!row.description) {
      lines.push(`${PADDING}${row.label}`);
      continue;
    }

    let prefix = `${PADDING}${row.label.padEnd(width)}${PADDING}`;

    for (const chunk of wrapWords(row.description, descriptionWidth)) {
      lines.push(`${prefix}${chunk}`);
      prefix = continuationPrefix;
    }
  }

  return lines;
};

const wrapWords = (text: string, width: number): string[] => {
  const chunks: string[] = [];
  let chunk = '';

  for (const word of text.split(' ')) {
    if (!chunk) {
      chunk = word;
      continue;
    }

    if (chunk.length + 1 + word.length > width) {
      chunks.push(chunk);
      chunk = word;
      continue;
    }

    chunk = `${chunk} ${word}`;
  }

  chunks.push(chunk);

  return chunks;
};
