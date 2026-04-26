export type MarkdownLink = { text: string; href: string };

export function extractWikiLinks(markdown: string): string[] {
  const links = new Set<string>();
  const regex = /\[\[([^\]]+)\]\]/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(markdown))) {
    links.add(match[1].split("|")[0].trim());
  }
  return Array.from(links);
}

export function extractMarkdownLinks(markdown: string): MarkdownLink[] {
  const links: MarkdownLink[] = [];
  const regex = /(?<!!)\[([^\]]+)\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(markdown))) {
    links.push({ text: match[1], href: match[2] });
  }
  return links;
}

export function stripCodeBlocks(markdown: string): string {
  return markdown.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]+`/g, "");
}
