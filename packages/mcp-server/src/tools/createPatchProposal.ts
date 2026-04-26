import { z } from "zod";
import { patchProposalMarkdown } from "../output/markdown.js";
import { writeSafeNote } from "../output/writeSafeNote.js";
import { resolveSafeNotePath } from "../vault/pathSafety.js";

export const createPatchProposalInput = z.object({
  vaultPath: z.string(),
  targetNotePath: z.string(),
  title: z.string().min(1),
  patchContent: z.string().min(1),
  rationale: z.string().optional(),
  excludedFolders: z.array(z.string()).optional()
});

export async function createPatchProposal(input: z.infer<typeof createPatchProposalInput>) {
  const parsed = createPatchProposalInput.parse(input);
  const target = await resolveSafeNotePath(
    parsed.vaultPath,
    parsed.targetNotePath,
    parsed.excludedFolders
  );
  const content = patchProposalMarkdown({
    title: parsed.title,
    targetNotePath: target.relativePath,
    patchContent: parsed.patchContent,
    rationale: parsed.rationale
  });
  const result = await writeSafeNote({
    vaultPath: parsed.vaultPath,
    outputKind: "Patches",
    title: parsed.title,
    content
  });
  return { ...result, targetNotePath: target.relativePath };
}
