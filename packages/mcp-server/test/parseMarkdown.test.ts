import { describe, expect, it } from "vitest";
import { safeOutputFilename } from "../src/output/filenames.js";
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

  it("generates safe output filenames", () => {
    const name = safeOutputFilename("Inbox Cleanup: A/B?", new Date("2026-04-25T00:00:00.000Z"));
    expect(name).toBe("2026-04-25T00-00-00-000Z-inbox-cleanup-ab.md");
  });
});
