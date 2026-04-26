import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { LIMITS } from "../safety/limits.js";
import { resolveVaultPath } from "../vault/pathSafety.js";
import { scanMarkdownFiles } from "../vault/scanMarkdown.js";

export const searchNotesInput = z.object({
  vaultPath: z.string(),
  query: z.string().min(1),
  excludedFolders: z.array(z.string()).optional(),
  maxFileBytesForScan: z.number().int().positive().max(LIMITS.maxFileBytesForScan).optional(),
  limit: z.number().int().positive().max(LIMITS.maxSearchResults).optional()
});

export async function searchNotes(input: z.infer<typeof searchNotesInput>) {
  const parsed = searchNotesInput.parse(input);
  const query = parsed.query.toLowerCase();
  const terms = query.split(/\s+/).filter(Boolean);
  const files = await scanMarkdownFiles(parsed.vaultPath, {
    excludedFolders: parsed.excludedFolders,
    maxFileBytesForScan: parsed.maxFileBytesForScan
  });
  const vaultRoot = await resolveVaultPath(parsed.vaultPath);
  const results = await Promise.all(
    files.map(async (file) => {
      const matchedFields = new Set<string>();
      let score = 0;
      const add = (field: string, weight: number, value: string | string[]) => {
        const haystack = Array.isArray(value) ? value.join(" ").toLowerCase() : value.toLowerCase();
        if (terms.some((term) => haystack.includes(term))) {
          matchedFields.add(field);
          score += weight;
        }
      };
      add("title", 8, file.title);
      add("basename", 6, file.basename);
      add("tags", 5, file.tags);
      add("headings", 4, file.headings);
      add("wikiLinks", 3, file.wikiLinks);
      if (file.skipped) {
        return {
          path: file.path,
          title: file.title,
          score,
          matchedFields: Array.from(matchedFields),
          snippet: file.warnings?.join(" ") ?? "",
          warnings: file.warnings ?? []
        };
      }
      const content = await fs.readFile(path.join(vaultRoot, file.path), "utf8");
      add("body", 1, content);
      const lower = content.toLowerCase();
      const index = Math.max(0, lower.indexOf(terms[0] ?? query));
      return {
        path: file.path,
        title: file.title,
        score,
        matchedFields: Array.from(matchedFields),
        snippet:
          score > 0
            ? content
                .slice(index, index + 220)
                .replace(/\s+/g, " ")
                .trim()
            : "",
        warnings: file.warnings ?? []
      };
    })
  );
  return results
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, parsed.limit ?? LIMITS.maxSearchResults);
}
