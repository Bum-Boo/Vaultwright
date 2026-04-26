# Codex Prompt Examples

These prompts are written for Vaultwright v0.1. They assume Codex is connected to the Vaultwright MCP server.

Replace `C:/path/to/my-vault` with the absolute path to your Obsidian vault.

## Read-only orientation

```text
Use Vaultwright on this Obsidian vault:
C:/path/to/my-vault

Start read-only. Summarize the top-level folders, number of Markdown files, default excluded folders, active projects, visible tags, and any obvious review workflows. Do not create files yet.
```

## Daily Review

```text
Use Vaultwright to run a Daily Review for:
C:/path/to/my-vault

Start with read-only tools. Look at recent daily notes, Inbox notes, open tasks, and conservative link opportunities. Then create one new review note with a short summary, priority tasks, loose notes to clarify, and suggested manual follow-ups. Do not modify existing notes.
```

## Weekly Review

```text
Use Vaultwright to create a Weekly Review for:
C:/path/to/my-vault

Scan the vault first. Summarize project momentum, study follow-ups, Inbox themes, open tasks, completed tasks if useful, and risks. Save a new weekly review note only. Do not move or edit notes.
```

## Inbox Cleanup Proposal

```text
Use Vaultwright to review my Inbox:
C:/path/to/my-vault

Only create a proposal. Group Inbox notes into keep, merge into existing notes, expand into project/study notes, and manual archive candidates. Include the exact source note paths. Do not rename, move, delete, or rewrite any Inbox notes.
```

## Task Harvest Proposal

```text
Use Vaultwright to harvest tasks across:
C:/path/to/my-vault

Group tasks by project, study, inbox, and general follow-up. Include source paths and line numbers. Detect due dates and priority tokens when present. Save a task harvest proposal. Do not mark tasks complete.
```

## Link Opportunities Proposal

```text
Use Vaultwright to find conservative link opportunities in:
C:/path/to/my-vault

Prefer high-confidence suggestions where an existing note title or alias is mentioned but not linked. Include source path, target path, matched text, confidence, and a short reason. Save a proposal only. Do not insert links.
```

## Project Status

```text
Use Vaultwright to create a project status draft for the project note "Portfolio Site" in:
C:/path/to/my-vault

Search and scan first, then read only relevant notes. Summarize current state, blockers, open tasks, related notes, and next actions. Save as a proposal or project review. Do not edit the project note.
```

## Study Plan

```text
Use Vaultwright to create a study plan from my study notes in:
C:/path/to/my-vault

Focus on concepts, open questions, tasks, and review order. Save a new proposal note. Do not modify existing lecture notes.
```

## Patch Proposal

```text
Use Vaultwright to propose edits for "Projects/Portfolio Site.md" in:
C:/path/to/my-vault

Create a patch proposal only. Include a rationale and fenced diff. Do not apply the patch or claim it was applied.
```
