import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { LIMITS } from "../safety/limits.js";
import { extractWikiLinks, stripCodeBlocks } from "../vault/links.js";
import { resolveSafeNotePath, resolveVaultPath } from "../vault/pathSafety.js";
import { scanMarkdownFiles } from "../vault/scanMarkdown.js";

export const findLinkOpportunitiesInput = z.object({
  vaultPath: z.string(),
  notePath: z.string().optional(),
  excludedFolders: z.array(z.string()).optional(),
  limit: z.number().int().positive().max(LIMITS.maxLinkOpportunities).optional()
});

function aliases(frontmatter: Record<string, unknown>): string[] {
  const raw = frontmatter.aliases;
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === "string") return raw.split(",").map((value) => value.trim());
  return [];
}

export async function findLinkOpportunities(input: z.infer<typeof findLinkOpportunitiesInput>) {
  const parsed = findLinkOpportunitiesInput.parse(input);
  const note = parsed.notePath
    ? await resolveSafeNotePath(parsed.vaultPath, parsed.notePath, parsed.excludedFolders)
    : null;
  const vaultRoot = await resolveVaultPath(parsed.vaultPath);
  const files = await scanMarkdownFiles(parsed.vaultPath, {
    excludedFolders: parsed.excludedFolders
  });
  const readableFiles = files.filter((file) => !file.skipped);
  const targets = readableFiles.map((file) => ({
    path: file.path,
    title: file.title,
    names: [file.title, file.basename, ...aliases(file.frontmatter)].filter(
      (name) => name.length >= 4
    )
  }));
  const sources = note
    ? readableFiles.filter((file) => file.path === note.relativePath)
    : readableFiles;
  const opportunities = [];
  const seen = new Set<string>();

  for (const source of sources) {
    const raw = await fs.readFile(path.join(vaultRoot, source.path), "utf8");
    const content = stripCodeBlocks(raw);
    const existingLinks = new Set(extractWikiLinks(raw).map((link) => link.toLowerCase()));
    for (const target of targets) {
      if (source.path === target.path) continue;
      for (const name of target.names) {
        const pattern = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
        if (!pattern.test(content)) continue;
        if (
          existingLinks.has(target.title.toLowerCase()) ||
          existingLinks.has(target.path.replace(/\.md$/i, "").toLowerCase())
        )
          continue;
        const key = `${source.path}->${target.path}:${name.toLowerCase()}`;
        if (seen.has(key)) continue;
        seen.add(key);
        opportunities.push({
          sourcePath: source.path,
          targetPath: target.path,
          targetTitle: target.title,
          matchedText: name,
          reason: "Existing note title or alias is mentioned without an existing wiki link.",
          confidence: name === target.title ? 0.72 : 0.62
        });
        if (opportunities.length >= (parsed.limit ?? LIMITS.maxLinkOpportunities))
          return opportunities;
      }
    }
  }
  return opportunities;
}
