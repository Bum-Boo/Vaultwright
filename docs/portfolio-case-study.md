# Vaultwright Portfolio Case Study

Vaultwright is a local-first Obsidian vault maintenance layer for Codex-assisted workflows. It lets Codex inspect allowed Markdown notes, summarize vault structure, harvest tasks, find link opportunities, and create review/proposal notes without silently changing the user's existing vault.

## Positioning

Vaultwright fits the theme of local-first productivity tools and AI-assisted workflow systems. The project is less about building another note app and more about creating a controlled tool layer between a user's private knowledge base and an AI coding assistant.

The core design choice is separation of responsibility:

- Codex handles reasoning, prioritization, synthesis, and written review output.
- Vaultwright handles deterministic local file operations over MCP.
- The user reviews generated proposals before making any real changes to notes.

## Problem

Obsidian vaults can become large, messy, and hard to review manually. AI assistants are useful for summarizing and reorganizing that kind of information, but giving an assistant broad edit access to a real vault creates obvious risks: accidental rewrites, unsafe deletes, unwanted tagging, private note exposure, and hard-to-audit changes.

Vaultwright addresses that by keeping v0.1 read-only for existing notes. It can create new review, proposal, and patch-proposal files in Vaultwright-owned folders, but it does not mutate the source vault.

## Product Shape

Vaultwright is built around practical maintenance workflows:

- scan a vault and summarize folder structure, note counts, tags, links, and tasks
- run daily or weekly reviews
- group Inbox notes into cleanup proposals
- collect open tasks across notes
- suggest conservative link opportunities
- create project status summaries
- save outputs as Markdown notes for manual review

The included `test-vault` gives safe sample data for demonstrations, tests, and onboarding.

## Architecture

Vaultwright uses a TypeScript MCP server as the local tool layer. The server validates paths, applies excluded-folder rules, parses Markdown and frontmatter, extracts links/tags/tasks, and writes only to controlled output folders.

The MCP server does not call OpenAI, ChatGPT, Codex, embeddings APIs, analytics, telemetry, or external LLM APIs. That boundary keeps the repository explainable: the project is local tooling for a human-AI workflow, not a hidden AI service.

## Safety Boundaries

The most important v0.1 rule is that existing notes are read-only. Vaultwright does not delete files, move notes, rewrite Markdown, alter frontmatter, insert tags, insert wiki links, sync with cloud services, or apply patch proposals.

Generated files go only under:

- `Vaultwright/Reviews`
- `Vaultwright/Proposals`
- `Vaultwright/Patches`

Default excluded folders include `.obsidian`, `.git`, `node_modules`, `Vaultwright`, `Private`, and `Archive`.

## Implementation Notes

The repository is structured as a pnpm workspace with the MCP server in `packages/mcp-server`. Tests cover path safety, safe output writing, vault scanning, Markdown parsing, and static safety expectations.

Key validation commands:

```bash
pnpm build
pnpm test
pnpm lint
```

## Portfolio Value

Vaultwright is a strong portfolio lead because it shows practical AI integration without overclaiming automation. It demonstrates:

- local-first design
- MCP tool architecture
- safety-aware AI workflow design
- Markdown parsing and vault metadata extraction
- testable boundaries around filesystem operations
- documentation for real user workflows

## Next Steps

- Add a short demo GIF or screenshots using the sample vault.
- Expand example outputs for common workflows.
- Add a v0.2 proposal for user-approved patch application.
- Consider an optional Obsidian UI only after the MCP workflow is stable.
- Keep the public README focused on safety, setup, and realistic use cases.
