import { z } from "zod";
import { LIMITS } from "../safety/limits.js";
import { scanMarkdownFiles } from "../vault/scanMarkdown.js";

export const scanVaultInput = z.object({
  vaultPath: z.string(),
  excludedFolders: z.array(z.string()).optional(),
  maxFiles: z.number().int().positive().max(LIMITS.maxFiles).optional()
});

export async function scanVault(input: z.infer<typeof scanVaultInput>) {
  const parsed = scanVaultInput.parse(input);
  return await scanMarkdownFiles(parsed.vaultPath, parsed);
}
