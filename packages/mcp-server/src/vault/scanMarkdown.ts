import { promises as fs } from "node:fs";
import path from "node:path";
import { LIMITS } from "../safety/limits.js";
import { isExcluded, isInside, isMarkdownPath, resolveVaultPath } from "./pathSafety.js";
import { parseMarkdown } from "./parseMarkdown.js";

export type MarkdownFileMetadata = {
  path: string;
  basename: string;
  title: string;
  headings: string[];
  tags: string[];
  frontmatter: Record<string, unknown>;
  wikiLinks: string[];
  markdownLinks: { text: string; href: string }[];
  modifiedTime: string;
  createdTime: string;
  wordCount: number;
  taskCount: number;
};

export async function scanMarkdownFiles(
  vaultPath: string,
  options: { excludedFolders?: string[]; maxFiles?: number } = {}
): Promise<MarkdownFileMetadata[]> {
  const vaultRoot = await resolveVaultPath(vaultPath);
  const maxFiles = Math.min(options.maxFiles ?? LIMITS.maxFiles, LIMITS.maxFiles);
  const results: MarkdownFileMetadata[] = [];

  async function walk(directory: string): Promise<void> {
    if (results.length >= maxFiles) return;
    const entries = await fs.readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      if (results.length >= maxFiles) break;
      const absolute = path.join(directory, entry.name);
      const relative = path.relative(vaultRoot, absolute);
      if (isExcluded(relative, options.excludedFolders)) continue;
      const stat = await fs.lstat(absolute);
      if (stat.isSymbolicLink()) continue;
      const realPath = await fs.realpath(absolute);
      if (!isInside(vaultRoot, realPath)) continue;
      if (stat.isDirectory()) {
        await walk(absolute);
      } else if (stat.isFile() && isMarkdownPath(entry.name)) {
        const content = await fs.readFile(absolute, "utf8");
        const parsed = parseMarkdown(content, entry.name);
        results.push({
          path: relative.split(path.sep).join("/"),
          basename: path.basename(entry.name, ".md"),
          title: parsed.title,
          headings: parsed.headings,
          tags: parsed.tags,
          frontmatter: parsed.frontmatter,
          wikiLinks: parsed.wikiLinks,
          markdownLinks: parsed.markdownLinks,
          modifiedTime: stat.mtime.toISOString(),
          createdTime: stat.birthtime.toISOString(),
          wordCount: parsed.wordCount,
          taskCount: parsed.taskCount
        });
      }
    }
  }

  await walk(vaultRoot);
  return results;
}
