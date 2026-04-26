import { promises as fs } from "node:fs";
import { z } from "zod";
import { LIMITS } from "../safety/limits.js";
import { resolveSafeNotePath } from "../vault/pathSafety.js";

export const readNoteInput = z.object({
  vaultPath: z.string(),
  notePath: z.string(),
  maxChars: z.number().int().positive().max(LIMITS.maxCharsPerNote).optional()
});

export async function readNote(input: z.infer<typeof readNoteInput>) {
  const parsed = readNoteInput.parse(input);
  const { absolutePath, relativePath } = await resolveSafeNotePath(parsed.vaultPath, parsed.notePath);
  const content = await fs.readFile(absolutePath, "utf8");
  const maxChars = parsed.maxChars ?? LIMITS.maxCharsPerNote;
  return {
    path: relativePath,
    content: content.slice(0, maxChars),
    truncated: content.length > maxChars,
    charCount: content.length
  };
}
