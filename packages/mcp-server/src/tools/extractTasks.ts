import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { LIMITS } from "../safety/limits.js";
import { resolveVaultPath } from "../vault/pathSafety.js";
import { scanMarkdownFiles } from "../vault/scanMarkdown.js";
import { extractMarkdownTasks } from "../vault/tasks.js";

export const extractTasksInput = z.object({
  vaultPath: z.string(),
  excludedFolders: z.array(z.string()).optional(),
  includeDone: z.boolean().optional(),
  limit: z.number().int().positive().max(LIMITS.maxTasks).optional()
});

export async function extractTasks(input: z.infer<typeof extractTasksInput>) {
  const parsed = extractTasksInput.parse(input);
  const vaultRoot = await resolveVaultPath(parsed.vaultPath);
  const limit = parsed.limit ?? LIMITS.maxTasks;
  const files = await scanMarkdownFiles(parsed.vaultPath, { excludedFolders: parsed.excludedFolders });
  const tasks = [];
  for (const file of files) {
    const content = await fs.readFile(path.join(vaultRoot, file.path), "utf8");
    for (const task of extractMarkdownTasks(content)) {
      if (!parsed.includeDone && task.done) continue;
      tasks.push({ sourcePath: file.path, ...task });
      if (tasks.length >= limit) return tasks;
    }
  }
  return tasks;
}
