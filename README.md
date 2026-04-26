# Vaultwright

Vaultwright is a local-first maintenance layer for Obsidian vaults. It is designed to work with Codex through a local MCP server so Codex can inspect, summarize, review, organize, and plan a vault without silently modifying existing notes.

## Local-first architecture

Vaultwright keeps v0.1 deterministic and local. The MCP server reads allowed Markdown files, scans vault metadata, validates paths, extracts links/tags/tasks, and saves new review/proposal files into Vaultwright-owned folders.

The MCP server does not call OpenAI, ChatGPT, Codex, embeddings APIs, or any external LLM API. Codex is the reasoning layer. Vaultwright is the local tool layer.

## What Codex does vs the MCP server

Codex:
- reasons over the metadata and note content the user allows it to read
- writes review drafts, cleanup plans, link suggestions, MOCs, study plans, and project status summaries
- decides what information is relevant to read next

Vaultwright MCP server:
- validates paths and exclusions
- reads Markdown files inside the vault
- extracts frontmatter, headings, tags, links, and tasks
- writes new files only under `Vaultwright/Reviews`, `Vaultwright/Proposals`, or `Vaultwright/Patches`
- never edits existing notes in v0.1

## Installation

```bash
cd vaultwright
pnpm install
pnpm build
pnpm test
```

## Development commands

```bash
pnpm dev
pnpm build
pnpm test
pnpm lint
```

## Run against the test vault

```bash
cd vaultwright
pnpm install
pnpm build
node packages/mcp-server/dist/index.js
```

Use the vault path:

```text
vaultwright/test-vault
```

## Codex MCP config example

```json
{
  "mcpServers": {
    "vaultwright": {
      "command": "node",
      "args": ["C:/absolute/path/to/vaultwright/packages/mcp-server/dist/index.js"]
    }
  }
}
```

## Example Codex prompts

1. "Run a daily vault review."
2. "Clean up my Inbox, but only create a proposal."
3. "Find tasks across the vault."
4. "Find link opportunities for this project."
5. "Create a weekly review."

More complete prompt examples are in [docs/CODEX_PROMPTS.md](docs/CODEX_PROMPTS.md). Example generated outputs are in [examples/outputs](examples/outputs).

## Safety model

Vaultwright v0.1 does not modify existing notes. It does not delete files, move files, insert tags, insert wiki links, mutate frontmatter, apply patches, sync to cloud services, collect telemetry, or call network LLM APIs.

When Vaultwright saves something, it creates a new file only in `Vaultwright/Reviews`, `Vaultwright/Proposals`, or `Vaultwright/Patches`. Patch proposals are documentation only; they are not applied.

Default excluded folders are `.obsidian`, `.git`, `node_modules`, `Vaultwright`, `Private`, and `Archive`.

## Roadmap

- v0.1: local STDIO MCP server, read-only inspection, safe output note creation, Codex plugin skill, docs, templates, recipes, and sample vault.
- Later: richer analysis, optional Obsidian UI plugin, user-approved patch workflows, and broader vault reporting.
