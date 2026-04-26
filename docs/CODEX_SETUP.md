# Codex Setup

Build the server, then configure Codex with an MCP server entry that runs the built STDIO server.

For real local setup, use an absolute path. This avoids ambiguity about whether the current working directory is the repository root, the plugin folder, or another Codex runtime folder.

```json
{
  "mcpServers": {
    "vaultwright": {
      "command": "node",
      "args": ["C:/absolute/path/to/Vaultwright/packages/mcp-server/dist/index.js"]
    }
  }
}
```

The bundled plugin config at `packages/codex-plugin/mcp/vaultwright.mcp.json` uses a relative path intended for the plugin package layout. Treat it as a starting template; prefer the absolute-path config above for day-to-day local use.

Use the Vaultwright skill for Obsidian maintenance requests. Start with read-only tools and save only Vaultwright-owned output notes.
