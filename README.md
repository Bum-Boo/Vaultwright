# Vaultwright

> Local-first Obsidian vault maintenance for Codex/MCP workflows.

[Overview](README.md) | [English](docs/readme/README.en.md) | [한국어](docs/readme/README.ko.md) | [中文](docs/readme/README.zh-CN.md) | [日本語](docs/readme/README.ja.md)

| Area | Detail |
|---|---|
| Platform | Local MCP server for Markdown/Obsidian vaults |
| Safety stance | Read existing notes, write only new review/proposal/patch files |
| Reasoning layer | Codex |
| Tool layer | Deterministic local file inspection and report creation |

## Overview

Vaultwright helps Codex inspect, summarize, review, organize, and plan an Obsidian vault without silently modifying existing notes.

<details>
<summary>Quick safety summary</summary>

- Do not point Vaultwright at a real vault until `pnpm build`, `pnpm test`, and `pnpm lint` pass locally.
- Keep a current backup of the vault.
- v0.1 never edits, moves, deletes, tags, links, or patches existing notes.
- New output is written only under `Vaultwright/Reviews`, `Vaultwright/Proposals`, or `Vaultwright/Patches`.

</details>

## Quick Start

```bash
cd vaultwright
pnpm install
pnpm build
pnpm test
```

## Documentation

- [English README](docs/readme/README.en.md)
- [한국어 README](docs/readme/README.ko.md)
- [中文 README](docs/readme/README.zh-CN.md)
- [日本語 README](docs/readme/README.ja.md)
- [Codex prompt examples](docs/CODEX_PROMPTS.md)
- [Portfolio case study](docs/portfolio-case-study.md)

## Notes

This overview is intentionally short. Detailed setup, safety model, MCP configuration, examples, limitations, and localized explanations live in the linked README files.
