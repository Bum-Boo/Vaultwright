# Vaultwright Portfolio Case Study

## Problem

Obsidian vaults can become large, messy, and hard to review manually. AI assistants can help summarize and reorganize that information, but broad write access to a real vault creates risks: accidental rewrites, unsafe deletes, unwanted tagging, private note exposure, and hard-to-audit changes.

## Target Users

- Obsidian users with large Markdown vaults.
- Developers, students, researchers, writers, and solo operators.
- People who want AI-assisted review while keeping final decisions manual.

## Design Goal

Create a controlled local tool layer between Codex and a user's private knowledge base. Codex can reason over allowed context, while Vaultwright performs deterministic local file operations and writes only new review/proposal notes.

## Core Workflow

1. Point Vaultwright at a safe sample vault or backed-up real vault.
2. Ask Codex for a read-only scan.
3. Review vault structure, tasks, tags, links, and obvious cleanup areas.
4. Generate a daily review, weekly review, inbox cleanup proposal, task harvest, or link opportunity report.
5. Review the new Markdown output manually before changing source notes.

## Architecture Summary

Vaultwright uses a TypeScript MCP server as the local tool layer. The server validates paths, applies excluded-folder rules, parses Markdown and frontmatter, extracts links/tags/tasks, and writes only to controlled output folders.

## Safety / Privacy Decisions

- Existing notes are read-only in v0.1.
- No deletes, moves, rewrites, frontmatter changes, tag insertion, or link insertion.
- Generated files go only under `Vaultwright/Reviews`, `Vaultwright/Proposals`, or `Vaultwright/Patches`.
- Default excluded folders include `.obsidian`, `.git`, `node_modules`, `Vaultwright`, `Private`, and `Archive`.
- The MCP server does not call OpenAI, ChatGPT, Codex, embeddings APIs, telemetry, or external LLM APIs.

## Technical Highlights

- MCP server architecture.
- Local Markdown/frontmatter parsing.
- Path validation and excluded-folder rules.
- Task, tag, heading, and link extraction.
- Safe output note creation.
- Tests around path safety, scanning, parsing, and write boundaries.

## Current Limitations

- v0.1 is a local MCP server and Codex skill package only.
- No Obsidian plugin UI.
- No ChatGPT App.
- No embeddings or semantic search.
- Patch proposals are documentation only and are not applied automatically.

## Next Steps

- Add a short demo GIF or screenshots using the sample vault.
- Expand example outputs for common workflows.
- Add a v0.2 proposal for user-approved patch application.
- Consider an optional Obsidian UI only after the MCP workflow is stable.

## Portfolio Value

Vaultwright is a strong portfolio lead because it shows practical AI integration without overclaiming automation. It demonstrates local-first design, MCP tooling, safety-aware AI workflow boundaries, Markdown metadata extraction, and testable filesystem constraints.
