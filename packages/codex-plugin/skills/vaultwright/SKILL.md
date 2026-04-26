# Vaultwright Skill

Use this skill when the user asks Codex to inspect, summarize, review, organize, or plan work for an Obsidian vault.

## Safety model

- Treat Codex as the reasoning layer.
- Treat the Vaultwright MCP server as a deterministic local tool layer.
- The MCP server must not call OpenAI, ChatGPT, Codex, embeddings services, or external LLM APIs.
- Always start with read-only tools.
- Never ask Vaultwright v0.1 to modify, move, delete, overwrite, tag, relink, or mutate existing user notes.
- Generated proposals need user review before manual application.
- Never claim a patch was applied. `create_patch_proposal` only saves a proposal note.

## Preferred workflow

1. Start with `get_vault_summary` to confirm vault scope and exclusions.
2. Use `scan_vault`, `search_notes`, `extract_tasks`, and `find_link_opportunities` before reading many full notes.
3. Use `read_notes_batch` only for notes that are relevant to the requested workflow.
4. Save Daily Review, Weekly Review, Project Review, and Study Review outputs with `create_review_note`.
5. Save Inbox Cleanup, Task Harvest, Link Opportunities, MOC, Study Plan, Project Status, Writing Outline, and Dataview Dashboard drafts with `create_proposal_note`.
6. Use `create_patch_proposal` only when proposing edits to existing notes. Do not apply the patch.

## Workflow prompts

For a Daily Review, collect recent daily notes, open tasks, inbox fragments, and link opportunities. Produce a concise review with priorities, follow-ups, and suggested manual cleanup.

For a Weekly Review, scan the vault, summarize active projects, overdue or recurring tasks, orphan-like notes, inbox themes, and suggested next actions.

For Inbox Cleanup, inspect only relevant Inbox notes and create a proposal that groups notes into keep, merge, archive manually, and expand later.

For Task Harvest, extract tasks, group them by project or area, and save a proposal. Do not mark tasks done or move them.

For Link Opportunities, use conservative suggestions. Mention uncertainty and require user review before links are inserted manually.

For MOC, Study Plan, Project Status, and Dataview Dashboard drafts, create new proposal notes only.
