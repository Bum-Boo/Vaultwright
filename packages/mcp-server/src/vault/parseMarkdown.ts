import path from "node:path";
import { parseFrontmatter } from "./frontmatter.js";
import { extractMarkdownLinks, extractWikiLinks, MarkdownLink } from "./links.js";
import { extractMarkdownTasks } from "./tasks.js";

export type ParsedMarkdown = {
  title: string;
  headings: string[];
  tags: string[];
  frontmatter: Record<string, unknown>;
  frontmatterError?: string;
  wikiLinks: string[];
  markdownLinks: MarkdownLink[];
  wordCount: number;
  taskCount: number;
};

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

export function parseMarkdown(markdown: string, filePath = "Untitled.md"): ParsedMarkdown {
  const fm = parseFrontmatter(markdown);
  const headings = Array.from(fm.content.matchAll(/^#{1,6}\s+(.+)$/gm)).map((m) => m[1].trim());
  const inlineTags = Array.from(fm.content.matchAll(/(^|\s)#([A-Za-z0-9_/-]+)/g)).map((m) => m[2]);
  const fmTags = Array.isArray(fm.data.tags)
    ? fm.data.tags.map(String)
    : typeof fm.data.tags === "string"
      ? fm.data.tags.split(/[,\s]+/)
      : [];
  const title =
    typeof fm.data.title === "string" && fm.data.title.trim()
      ? fm.data.title.trim()
      : (headings[0] ?? path.basename(filePath, ".md"));

  return {
    title,
    headings,
    tags: unique([...fmTags, ...inlineTags]),
    frontmatter: fm.data,
    frontmatterError: fm.error,
    wikiLinks: extractWikiLinks(fm.content),
    markdownLinks: extractMarkdownLinks(fm.content),
    wordCount: (fm.content.match(/\b[\w'-]+\b/g) ?? []).length,
    taskCount: extractMarkdownTasks(fm.content).length
  };
}
