import { z } from "zod";
import { wrapGeneratedNote } from "../output/markdown.js";
import { writeSafeNote } from "../output/writeSafeNote.js";

export const createProposalNoteInput = z.object({
  vaultPath: z.string(),
  proposalType: z.enum([
    "inbox-cleanup",
    "task-harvest",
    "link-opportunities",
    "moc",
    "dashboard",
    "other"
  ]),
  title: z.string().min(1),
  content: z.string().min(1)
});

export async function createProposalNote(input: z.infer<typeof createProposalNoteInput>) {
  const parsed = createProposalNoteInput.parse(input);
  return await writeSafeNote({
    vaultPath: parsed.vaultPath,
    outputKind: "Proposals",
    title: `${parsed.proposalType}-${parsed.title}`,
    content: wrapGeneratedNote(parsed.title, parsed.content)
  });
}
