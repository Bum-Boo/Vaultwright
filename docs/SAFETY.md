# Safety

Vaultwright v0.1 never edits, moves, deletes, overwrites, tags, relinks, or mutates existing notes. Path inputs are normalized and checked to remain inside the vault. Absolute note paths and traversal are rejected.

Do not point Vaultwright at your real vault until the test suite passes locally and you have a current backup. The server is designed to be read-mostly, but a backup is still the right baseline before connecting any automation to personal notes.

Codex is the reasoning layer. The MCP server only performs deterministic local file operations such as reading allowed Markdown files, extracting metadata, and creating new Vaultwright-owned output notes.
