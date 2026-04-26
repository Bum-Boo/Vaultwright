# Vaultwright

Vaultwright is a local-first maintenance layer for Obsidian vaults. It is designed to work with Codex through a local MCP server so Codex can inspect, summarize, review, organize, and plan a vault without silently modifying existing notes.

Do not point Vaultwright at your real vault until `pnpm build`, `pnpm test`, and `pnpm lint` pass locally and you have a current backup of the vault.

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

In v0.1, Codex does the reasoning. The MCP server only performs deterministic local file operations: path validation, Markdown scanning, metadata extraction, safe note reads, and creation of new Vaultwright-owned output files.

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
pnpm format
pnpm format:check
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

Use an absolute path for real local setup. Relative paths can break when Codex runs the MCP config from a plugin folder or another working directory.

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

The bundled `packages/codex-plugin/mcp/vaultwright.mcp.json` is a plugin-layout template and uses a relative path from `packages/codex-plugin`.

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

## Known limitations

- v0.1 is a local MCP server and Codex skill package only.
- There is no Obsidian plugin UI.
- There is no ChatGPT App.
- There are no embeddings or semantic search.
- Patch proposals are never applied automatically.
- Existing notes are read-only; cleanup and link work is saved as new review or proposal notes for manual review.
- Large Markdown files can be skipped during scanning/searching to keep local operations bounded.

## Roadmap

- v0.1: local STDIO MCP server, read-only inspection, safe output note creation, Codex plugin skill, docs, templates, recipes, and sample vault.
- Later: richer analysis, optional Obsidian UI plugin, user-approved patch workflows, and broader vault reporting.

Suggested repository topics: `obsidian`, `mcp`, `model-context-protocol`, `codex`, `local-first`, `typescript`, `markdown`, `pkm`.
