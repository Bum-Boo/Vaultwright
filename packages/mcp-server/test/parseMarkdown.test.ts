import { describe, expect, it } from "vitest";
import { safeOutputFilename } from "../src/output/filenames.js";
import { patchProposalMarkdown } from "../src/output/markdown.js";
import { parseMarkdown } from "../src/vault/parseMarkdown.js";
import { extractMarkdownTasks } from "../src/vault/tasks.js";

describe("parseMarkdown", () => {
  it("parses frontmatter, headings, tags, wiki links, and tasks", () => {
    const parsed = parseMarkdown(`---
title: Test Note
tags: [pkm, review]
---
# Heading
Body with #inline and [[Codex]].
- [ ] Open task due 2026-05-01 priority high
- [x] Done task
`);
    expect(parsed.title).toBe("Test Note");
    expect(parsed.headings).toEqual(["Heading"]);
    expect(parsed.tags).toEqual(expect.arrayContaining(["pkm", "review", "inline"]));
    expect(parsed.wikiLinks).toEqual(["Codex"]);
    expect(parsed.taskCount).toBe(2);
  });

  it("extracts markdown tasks with candidates", () => {
    const tasks = extractMarkdownTasks("- [ ] Ship it due 2026-05-01 every week\n- [x] Done");
    expect(tasks[0]).toMatchObject({ done: false, dueDateCandidate: "2026-05-01" });
    expect(tasks[1].done).toBe(true);
  });

  it("does not infer recurrence or priority from ordinary task text", () => {
    const tasks = extractMarkdownTasks(
      "- [ ] Read every chapter eventually\n- [ ] Pick a high level design"
    );
    expect(tasks[0].recurrenceCandidate).toBeUndefined();
    expect(tasks[0].priorityCandidate).toBeUndefined();
    expect(tasks[1].recurrenceCandidate).toBeUndefined();
    expect(tasks[1].priorityCandidate).toBeUndefined();
  });

  it("detects explicit task markers only", () => {
    const tasks = extractMarkdownTasks(
      "- [ ] Ship it 📅 2026-05-01 priority high 🔁 every week\n- [ ] Escalate ⏫"
    );
    expect(tasks[0]).toMatchObject({
      dueDateCandidate: "2026-05-01",
      priorityCandidate: "high",
      recurrenceCandidate: "🔁 every week"
    });
    expect(tasks[1].priorityCandidate).toBe("⏫");
  });

  it("generates safe output filenames", () => {
    const name = safeOutputFilename("Inbox Cleanup: A/B?", new Date("2026-04-25T00:00:00.000Z"));
    expect(name).toBe("2026-04-25T00-00-00-000Z-inbox-cleanup-ab.md");
  });

  it("formats patch proposals as unapplied warning notes", () => {
    const markdown = patchProposalMarkdown({
      title: "Patch",
      targetNotePath: "Notes/A.md",
      rationale: "Clarify wording.",
      patchContent: "- old\n+ new"
    });
    expect(markdown).toBe(`# Patch

> [!warning]
> This is a Vaultwright patch proposal. It has not been applied.

Target note: \`Notes/A.md\`

## Rationale

Clarify wording.

## Proposed Patch

\`\`\`diff
- old
+ new
\`\`\`
`);
  });
});
