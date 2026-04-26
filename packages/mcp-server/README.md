# @vaultwright/mcp-server

Vaultwright's MCP server is a deterministic local tool layer for Obsidian vault maintenance. It reads allowed Markdown files, extracts metadata, and writes only new Vaultwright-owned review/proposal files.

It does not call OpenAI, ChatGPT, Codex, embeddings APIs, or any external LLM. Codex is the reasoning layer; this package is local file tooling over MCP STDIO.

## Commands

```bash
pnpm install
pnpm --filter @vaultwright/mcp-server build
pnpm --filter @vaultwright/mcp-server test
pnpm --filter @vaultwright/mcp-server dev
```

## STDIO

After building:

```bash
node packages/mcp-server/dist/index.js
```

All MCP protocol output goes through STDIO transport. Diagnostic logs must use stderr.
