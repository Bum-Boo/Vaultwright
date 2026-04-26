# Quickstart

This guide is for an Obsidian user who wants Codex to review a vault without changing existing notes.

Vaultwright v0.1 is local-first. It scans Markdown files on your computer and creates new review or proposal notes only inside Vaultwright-owned folders. It never edits, moves, deletes, tags, relinks, or rewrites your existing notes.

## What you need

- An Obsidian vault on your computer
- Node.js 20 or newer
- pnpm
- Codex with MCP server support

If `pnpm` is not installed, try:

```bash
corepack pnpm --version
```

If that works, you can use `corepack pnpm` anywhere this guide says `pnpm`.

## 1. Install Vaultwright

```bash
git clone https://github.com/Bum-Boo/Vaultwright.git
cd Vaultwright
pnpm install
pnpm build
pnpm test
```

The tests confirm the safety rules around path traversal, excluded folders, overwrite protection, and Vaultwright-only output folders.

## 2. Try the sample vault first

Vaultwright includes a small Obsidian-style vault at:

```text
test-vault
```

Use this vault before pointing Vaultwright at your real notes. It includes daily notes, inbox notes, project notes, study notes, tasks, tags, wiki links, and one excluded private note.

## 3. Configure Codex

Add an MCP server entry like this, replacing the path with your real checkout path:

```json
{
  "mcpServers": {
    "vaultwright": {
      "command": "node",
      "args": [
        "C:/absolute/path/to/Vaultwright/packages/mcp-server/dist/index.js"
      ]
    }
  }
}
```

On macOS or Linux the path will look more like:

```json
{
  "mcpServers": {
    "vaultwright": {
      "command": "node",
      "args": [
        "/absolute/path/to/Vaultwright/packages/mcp-server/dist/index.js"
      ]
    }
  }
}
```

## 4. Use an absolute vault path

When asking Codex to use Vaultwright, give it the absolute path to your vault.

For the included sample vault on Windows, that may look like:

```text
C:/Users/you/Documents/Vaultwright/test-vault
```

For your real Obsidian vault, use the folder that contains your Markdown notes and `.obsidian` folder.

## 5. Start with a read-only scan

Prompt Codex:

```text
Use Vaultwright on this vault:
C:/absolute/path/to/Vaultwright/test-vault

Start read-only. Summarize the vault structure, excluded folders, top-level folders, task count, and obvious review areas. Do not create any files yet.
```

Codex should begin with read-only MCP tools such as `get_vault_summary`, `scan_vault`, `extract_tasks`, `search_notes`, and `find_link_opportunities`.

## 6. Create your first review note

After the read-only scan, ask:

```text
Create a Daily Review for this vault. Save it with Vaultwright. Do not modify existing notes.
```

Vaultwright should create a new file under:

```text
Vaultwright/Reviews/
```

It should not edit any existing daily, inbox, project, study, or private notes.

## Useful prompts

Daily review:

```text
Use Vaultwright to run a Daily Review for my vault. Start read-only, focus on recent daily notes, open tasks, Inbox notes, and link opportunities. Save the result as a review note. Do not modify existing notes.
```

Weekly review:

```text
Use Vaultwright to create a Weekly Review. Summarize active projects, open loops, study follow-ups, Inbox themes, and top priorities. Save a new weekly review note only.
```

Inbox cleanup:

```text
Use Vaultwright to clean up my Inbox, but only create a proposal. Group notes into keep, merge, expand, and manual archive candidates. Do not move, rename, or edit any notes.
```

Task harvest:

```text
Use Vaultwright to find tasks across my vault. Group them by project, study, inbox, and general follow-up. Save a task harvest proposal. Do not mark anything done.
```

Link opportunities:

```text
Use Vaultwright to find conservative link opportunities for my vault. Show the source note, target note, matched text, and confidence. Save a proposal, but do not insert links.
```

## Where outputs go

Vaultwright v0.1 can create only these output types:

- `Vaultwright/Reviews/` for daily, weekly, project, and study reviews
- `Vaultwright/Proposals/` for cleanup plans, task harvests, link opportunities, MOCs, dashboards, and other drafts
- `Vaultwright/Patches/` for patch proposals that are not applied

If a prompt asks Codex to change existing notes, Codex should instead create a proposal or patch proposal.

## Example outputs

See `examples/outputs/` for realistic examples:

- `daily-review-example.md`
- `weekly-review-example.md`
- `inbox-cleanup-example.md`
- `task-harvest-example.md`
- `link-opportunities-example.md`

These are examples only. Real generated files are created in your vault's `Vaultwright/` folder.

## Troubleshooting

If Codex cannot start the server, run:

```bash
pnpm build
node packages/mcp-server/dist/index.js
```

The command waits for MCP messages over STDIO, so it may appear idle. That is expected.

If `pnpm` is not found, try:

```bash
corepack pnpm build
corepack pnpm test
```

If the vault scan finds fewer notes than expected, check the default excluded folders:

```text
.obsidian, .git, node_modules, Vaultwright, Private, Archive
```
