# MCP Tools

Vaultwright exposes `get_vault_summary`, `scan_vault`, `read_note`, `read_notes_batch`, `search_notes`, `extract_tasks`, `find_link_opportunities`, `create_review_note`, `create_proposal_note`, and `create_patch_proposal`.

Read tools never write. Create tools write only to `Vaultwright/Reviews`, `Vaultwright/Proposals`, or `Vaultwright/Patches`.

`scan_vault` and `search_notes` apply a Markdown file size limit before reading note bodies. Oversized Markdown files are returned with `skipped: true`, `skipReason: "file-too-large"`, `sizeBytes`, and a warning instead of being read into memory.

`create_patch_proposal` accepts `excludedFolders` so callers can apply stricter target-note exclusions. It still only writes a new proposal under `Vaultwright/Patches/`; it never applies a patch.
