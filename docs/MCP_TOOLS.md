# MCP Tools

Vaultwright exposes `get_vault_summary`, `scan_vault`, `read_note`, `read_notes_batch`, `search_notes`, `extract_tasks`, `find_link_opportunities`, `create_review_note`, `create_proposal_note`, and `create_patch_proposal`.

Read tools never write. Create tools write only to `Vaultwright/Reviews`, `Vaultwright/Proposals`, or `Vaultwright/Patches`.
