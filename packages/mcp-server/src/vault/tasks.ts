export type MarkdownTask = {
  lineNumber: number;
  raw: string;
  text: string;
  done: boolean;
  dueDateCandidate?: string;
  priorityCandidate?: string;
  recurrenceCandidate?: string;
};

const priorityOnlyMarkers = ["\u{23EB}", "\u{1F53C}", "\u{1F53D}"];

function detectDueDate(text: string): string | undefined {
  return text.match(/(?:^|\s)(?:due|\u{1F4C5})\s*:?\s*(\d{4}-\d{2}-\d{2})(?:\s|$)/iu)?.[1];
}

function detectPriority(text: string): string | undefined {
  const named = text.match(
    /(?:^|\s)priority\s*:?\s*(highest|high|medium|low|lowest|[A-C])(?:\s|$)/iu
  )?.[1];
  if (named) return named;
  return priorityOnlyMarkers.find((marker) => text.includes(marker));
}

function detectRecurrence(text: string): string | undefined {
  const interval = String.raw`(?:day|daily|week|weekly|month|monthly|year|yearly|\d+\s+(?:days?|weeks?|months?|years?))`;
  const emoji = text.match(
    new RegExp(String.raw`(?:^|\s)(\u{1F501}\s+every\s+${interval}[^#@\n]*)`, "iu")
  )?.[1];
  if (emoji) return emoji.trim();
  return text
    .match(new RegExp(String.raw`(?:^|\s)(every\s+${interval}[^#@\n]*)(?:\s|$)`, "iu"))?.[1]
    ?.trim();
}

export function extractMarkdownTasks(markdown: string): MarkdownTask[] {
  return markdown.split(/\r?\n/).flatMap((line, index) => {
    const match = line.match(/^\s*[-*]\s+\[([ xX])\]\s+(.*)$/);
    if (!match) return [];
    const text = match[2].trim();
    return [
      {
        lineNumber: index + 1,
        raw: line,
        text,
        done: match[1].toLowerCase() === "x",
        dueDateCandidate: detectDueDate(text),
        priorityCandidate: detectPriority(text),
        recurrenceCandidate: detectRecurrence(text)
      }
    ];
  });
}
