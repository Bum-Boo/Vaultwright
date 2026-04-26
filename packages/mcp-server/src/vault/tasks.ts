export type MarkdownTask = {
  lineNumber: number;
  raw: string;
  text: string;
  done: boolean;
  dueDateCandidate?: string;
  priorityCandidate?: string;
  recurrenceCandidate?: string;
};

export function extractMarkdownTasks(markdown: string): MarkdownTask[] {
  return markdown.split(/\r?\n/).flatMap((line, index) => {
    const match = line.match(/^\s*[-*]\s+\[([ xX])\]\s+(.*)$/);
    if (!match) return [];
    const text = match[2].trim();
    return [{
      lineNumber: index + 1,
      raw: line,
      text,
      done: match[1].toLowerCase() === "x",
      dueDateCandidate: text.match(/(?:due|📅)\s*:? ?(\d{4}-\d{2}-\d{2})/i)?.[1],
      priorityCandidate: text.match(/(?:priority|⏫|🔼|🔽)\s*:? ?([A-C]|high|medium|low)/i)?.[1],
      recurrenceCandidate: text.match(/(?:every|🔁)\s+([^#@\n]+)/i)?.[0]
    }];
  });
}
