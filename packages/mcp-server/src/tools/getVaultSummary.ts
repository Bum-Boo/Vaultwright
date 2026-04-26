import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { mergeExcludedFolders, VAULTWRIGHT_OUTPUT_FOLDERS } from "../safety/excludedFolders.js";
import { scanMarkdownFiles } from "../vault/scanMarkdown.js";
import { isExcluded, resolveVaultPath } from "../vault/pathSafety.js";

export const getVaultSummaryInput = z.object({
  vaultPath: z.string(),
  excludedFolders: z.array(z.string()).optional()
});

export async function getVaultSummary(input: z.infer<typeof getVaultSummaryInput>) {
  const parsed = getVaultSummaryInput.parse(input);
  const vaultRoot = await resolveVaultPath(parsed.vaultPath);
  const entries = await fs.readdir(vaultRoot, { withFileTypes: true });
  const excludedFolders = mergeExcludedFolders(parsed.excludedFolders);
  const totalMarkdownFiles = (await scanMarkdownFiles(vaultRoot, { excludedFolders })).length;
  return {
    vaultPath: vaultRoot,
    totalMarkdownFiles,
    topLevelFolders: entries
      .filter((entry) => entry.isDirectory() && !isExcluded(entry.name, excludedFolders))
      .map((entry) => entry.name)
      .sort(),
    excludedFolders,
    vaultwrightOutputFolders: VAULTWRIGHT_OUTPUT_FOLDERS.map((folder) => folder.split(path.sep).join("/")),
    lastScannedAt: new Date().toISOString()
  };
}
