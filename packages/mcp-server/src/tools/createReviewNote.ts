import { z } from "zod";
import { wrapGeneratedNote } from "../output/markdown.js";
import { writeSafeNote } from "../output/writeSafeNote.js";

export const createReviewNoteInput = z.object({
  vaultPath: z.string(),
  reviewType: z.enum(["daily", "weekly", "project", "study"]),
  title: z.string().min(1),
  content: z.string().min(1)
});

export async function createReviewNote(input: z.infer<typeof createReviewNoteInput>) {
  const parsed = createReviewNoteInput.parse(input);
  return await writeSafeNote({
    vaultPath: parsed.vaultPath,
    outputKind: "Reviews",
    title: `${parsed.reviewType}-${parsed.title}`,
    content: wrapGeneratedNote(parsed.title, parsed.content)
  });
}
