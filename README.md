# Vaultwright

> Local-first Obsidian vault maintenance layer for Codex/MCP workflows.

[Overview](README.md) | [English](docs/readme/README.en.md) | [Korean](docs/readme/README.ko.md) | [Chinese](docs/readme/README.zh-CN.md) | [Japanese](docs/readme/README.ja.md)

| Area            | Detail                                                                   |
| --------------- | ------------------------------------------------------------------------ |
| Platform        | Local MCP server for Markdown/Obsidian vaults                            |
| User            | Obsidian users who want AI-assisted review without direct vault mutation |
| Safety stance   | Read existing notes, write only new review/proposal/patch files          |
| Reasoning layer | Codex                                                                    |
| Tool layer      | Deterministic local file inspection and report creation                  |

## What It Does

Vaultwright lets Codex inspect, summarize, review, organize, and plan an Obsidian vault without silently modifying existing notes. It is a local tool layer: Codex reasons over allowed context, while Vaultwright validates paths, reads Markdown, extracts metadata, and creates new review/proposal files.

## Safety Summary

- Do not point Vaultwright at a real vault until `pnpm build`, `pnpm test`, and `pnpm lint` pass locally.
- Keep a current backup of the vault.
- v0.1 never edits, moves, deletes, tags, links, or patches existing notes.
- New output is written only under `Vaultwright/Reviews`, `Vaultwright/Proposals`, or `Vaultwright/Patches`.
- The MCP server does not call OpenAI, ChatGPT, Codex, embeddings APIs, telemetry, or external LLM APIs.

## Core Workflows

- Daily and weekly vault reviews.
- Inbox cleanup proposals.
- Task harvesting across notes.
- Conservative link opportunity reports.
- Project status summaries.
- Patch proposals for manual review.

## Quick Start

```bash
pnpm install
pnpm build
pnpm test
```

Try the included `test-vault` before using a real vault.

## Documentation

- [Codex prompt examples](docs/CODEX_PROMPTS.md)
- [Quickstart](docs/QUICKSTART.md)
- [Safety](docs/SAFETY.md)
- [Privacy](docs/PRIVACY.md)
- [Portfolio case study](docs/portfolio-case-study.md)
- [GitHub metadata note](docs/github-metadata.md)

## Status

Vaultwright is an early public v0.1 focused on deterministic MCP tooling and safe proposal generation. It is intentionally narrow: inspect local Markdown, produce review/proposal notes, and leave destructive or mutating actions outside the tool boundary.
