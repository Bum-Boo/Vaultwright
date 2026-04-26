import { z } from "zod";
import { LIMITS } from "../safety/limits.js";
import { readNote } from "./readNote.js";

export const readNotesBatchInput = z.object({
  vaultPath: z.string(),
  notePaths: z.array(z.string()).min(1),
  maxFiles: z.number().int().positive().max(LIMITS.maxBatchFiles).optional(),
  maxCharsPerFile: z.number().int().positive().max(LIMITS.maxCharsPerNote).optional(),
  totalMaxChars: z.number().int().positive().max(LIMITS.totalMaxBatchChars).optional()
});

export async function readNotesBatch(input: z.infer<typeof readNotesBatchInput>) {
  const parsed = readNotesBatchInput.parse(input);
  const maxFiles = parsed.maxFiles ?? LIMITS.maxBatchFiles;
  const totalMaxChars = parsed.totalMaxChars ?? LIMITS.totalMaxBatchChars;
  let remaining = totalMaxChars;

  const results = [];
  for (const notePath of parsed.notePaths.slice(0, maxFiles)) {
    try {
      if (remaining <= 0) {
        results.push({ path: notePath, content: "", truncated: true, charCount: 0 });
        continue;
      }
      const result = await readNote({
        vaultPath: parsed.vaultPath,
        notePath,
        maxChars: Math.min(parsed.maxCharsPerFile ?? LIMITS.maxCharsPerNote, remaining)
      });
      remaining = Math.max(0, remaining - result.content.length);
      results.push(result);
    } catch (error) {
      results.push({
        path: notePath,
        content: "",
        truncated: false,
        charCount: 0,
        error: error instanceof Error ? error.message : "Unknown read error"
      });
    }
  }
  return results;
}
