# Link Opportunities Proposal

> Example output only. In a real run, Vaultwright would save this as a new note under `Vaultwright/Proposals/`.
> This proposal does not insert links. Review each suggestion manually.

## High Confidence

| Source                           | Target                                   | Matched text                  | Confidence | Reason                                                |
| -------------------------------- | ---------------------------------------- | ----------------------------- | ---------- | ----------------------------------------------------- |
| `Projects/Obsidian AI Plugin.md` | `Notes/Personal Knowledge Management.md` | Personal Knowledge Management | 0.72       | Existing note title is mentioned without a wiki link. |
| `Daily/2026-04-25.md`            | `Study/Operating Systems Lecture 01.md`  | Operating Systems Lecture 01  | 0.72       | Existing note title is mentioned without a wiki link. |
| `Inbox/lecture messy note.md`    | `Study/Database Indexing.md`             | Database Indexing             | 0.72       | Existing note title is mentioned without a wiki link. |

## Medium Confidence

| Source                                   | Target                           | Matched text           | Confidence | Reason                                                                               |
| ---------------------------------------- | -------------------------------- | ---------------------- | ---------- | ------------------------------------------------------------------------------------ |
| `Inbox/Untitled AI idea.md`              | `Notes/MCP.md`                   | Model Context Protocol | 0.62       | Alias match for an existing note.                                                    |
| `Notes/Personal Knowledge Management.md` | `Projects/Obsidian AI Plugin.md` | Vaultwright            | 0.62       | Alias or related-project wording may refer to the project, but context needs review. |

## Suggested Manual Review

1. Open each source note in Obsidian.
2. Confirm the matched text really refers to the target note.
3. Add wiki links manually only for suggestions that still make sense in context.
