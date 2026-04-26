# Vaultwright v0.2 Technical Plan

This plan describes proposed v0.2 features. It is not an implementation spec for v0.1, and no existing-note mutation is allowed unless a later version explicitly adds a user-approved apply step.

## v0.2 Principles

- The MCP server remains deterministic and local.
- The MCP server must not call OpenAI, ChatGPT, Codex, embeddings APIs, or external LLM APIs.
- Codex remains the reasoning layer.
- Existing user notes remain read-only by default.
- New outputs are still created only in Vaultwright-owned folders.
- Any optional Obsidian UI must show proposals and status; it must not silently apply edits.

## Shared Data Model Additions

```ts
type NoteRef = {
  path: string;
  title: string;
  basename: string;
  tags: string[];
};

type SourceLineRef = {
  sourcePath: string;
  lineNumber?: number;
  raw?: string;
};

type ProposalArtifact = {
  createdPath: string;
  proposalType: string;
  charCount: number;
  sourcePaths: string[];
  generatedAt: string;
};

type ReviewConfidence = "high" | "medium" | "low";
```

These types should be implemented in small shared modules only when v0.2 work begins.

## 1. Dataview Dashboard Draft Generation

### User Story

As an Obsidian user, I want Codex to draft a Dataview dashboard from my vault metadata so I can manually review useful dashboards before adding them to my vault.

### MCP Tool Changes

Add a new proposal-oriented tool:

```ts
create_dataview_dashboard_proposal({
  vaultPath: string;
  dashboardType: "projects" | "tasks" | "study" | "inbox" | "weekly" | "custom";
  title: string;
  scopePaths?: string[];
  includeTasks?: boolean;
  includeLinks?: boolean;
  content: string;
})
```

The server should validate paths and save the dashboard draft to `Vaultwright/Proposals/`. Codex generates the dashboard content; the MCP server only validates and writes the new proposal note.

Optional read-only helper:

```ts
get_dashboard_context({
  vaultPath: string;
  dashboardType: "projects" | "tasks" | "study" | "inbox" | "weekly" | "custom";
  excludedFolders?: string[];
})
```

This returns deterministic metadata: matching notes, tags, tasks, folders, and candidate Dataview fields.

### Data Model Changes

```ts
type DashboardContext = {
  dashboardType: string;
  candidateNotes: NoteRef[];
  candidateTags: string[];
  candidateFolders: string[];
  taskSummary: {
    open: number;
    done: number;
    dueDateCandidates: string[];
  };
};
```

### Safety Risks

- Dataview code blocks can look executable to users. Label them as drafts.
- Do not create dashboards outside `Vaultwright/Proposals/`.
- Do not infer or expose notes from excluded folders.
- Do not require the Dataview plugin or assume it is installed.

### Tests Needed

- Dashboard context excludes default excluded folders.
- Dashboard proposal writes only to `Vaultwright/Proposals/`.
- Proposal never overwrites an existing file.
- Scope paths reject absolute paths and traversal.
- Generated content with Dataview code fences is saved as plain Markdown only.

### Expected Output Example

````md
# Projects Dashboard Draft

> Proposal only. Review before copying into a real dashboard note.

```dataview
TABLE status, priority, file.mtime AS "Updated"
FROM "Projects"
WHERE contains(tags, "project")
SORT file.mtime DESC
```

## Notes

- This draft assumes project notes use `#project`.
- No existing notes were modified.
````

## 2. Tasks Plugin Compatible Task Output

### User Story

As an Obsidian Tasks plugin user, I want Vaultwright task harvests to preserve common Tasks-style tokens so I can manually copy or review tasks without losing due dates, recurrence, priority, or completion metadata.

### MCP Tool Changes

Extend `extract_tasks` with an optional output format:

```ts
extract_tasks({
  vaultPath: string;
  excludedFolders?: string[];
  includeDone?: boolean;
  limit?: number;
  tasksPluginCompatible?: boolean;
})
```

When enabled, return additional parsed fields while preserving `raw`.

Optional proposal helper:

```ts
create_task_harvest_proposal({
  vaultPath: string;
  title: string;
  content: string;
  sourcePaths: string[];
})
```

This remains a Vaultwright proposal writer, not a task editor.

### Data Model Changes

```ts
type TasksPluginFields = {
  statusChar: " " | "x" | "X" | "/" | "-";
  due?: string;
  scheduled?: string;
  start?: string;
  doneDate?: string;
  createdDate?: string;
  cancelledDate?: string;
  priority?: "highest" | "high" | "medium" | "low" | "lowest";
  recurrence?: string;
  tags: string[];
};

type TaskRecord = SourceLineRef & {
  text: string;
  done: boolean;
  tasksPlugin?: TasksPluginFields;
};
```

### Safety Risks

- Formatting output as Tasks-compatible Markdown might be mistaken for an applied edit.
- Preserve source path and line number so users can manually verify.
- Do not mark tasks done or rewrite task lines.

### Tests Needed

- Parse common emoji tokens: `📅`, `⏳`, `🛫`, `✅`, `➕`, `❌`, `🔁`, `⏫`, `🔼`, `🔽`.
- Preserve raw task text exactly.
- Include source path and line number.
- Exclude done tasks unless `includeDone` is true.
- Reject excluded folders.

### Expected Output Example

```md
# Task Harvest Proposal

> Proposal only. No tasks were changed.

- [ ] Draft safety constraints 📅 2026-04-28 ⏫
  - Source: `Projects/Obsidian AI Plugin.md:14`
- [ ] Compare hash indexes and B-tree indexes 📅 2026-04-30
  - Source: `Study/Database Indexing.md:14`
```

## 3. Project Status Review

### User Story

As a user with project notes, I want Codex to create a project status review from related notes, tasks, and recent updates so I can decide what to do next.

### MCP Tool Changes

Add a read-only helper:

```ts
get_project_status_context({
  vaultPath: string;
  projectPath?: string;
  projectTag?: string;
  excludedFolders?: string[];
  limit?: number;
})
```

Return project candidates, open tasks, related links, recent daily mentions, and inbox mentions.

Use existing `create_review_note` with `reviewType: "project"` or add a clearer wrapper:

```ts
create_project_status_review({
  vaultPath: string;
  title: string;
  content: string;
  sourcePaths: string[];
})
```

### Data Model Changes

```ts
type ProjectStatusContext = {
  project: NoteRef;
  relatedNotes: NoteRef[];
  openTasks: TaskRecord[];
  doneTasks: TaskRecord[];
  recentMentions: SourceLineRef[];
  linkOpportunities: {
    sourcePath: string;
    targetPath: string;
    matchedText: string;
    confidence: number;
  }[];
};
```

### Safety Risks

- Project status may imply edits or task state changes; label output as review.
- Avoid reading unrelated notes beyond configured limits.
- Respect excluded folders for daily notes, inbox notes, and backlinks.

### Tests Needed

- Project context identifies notes by path and tag.
- Related notes are limited and exclude private/archive folders.
- Review note writes only to `Vaultwright/Reviews/`.
- Missing project path returns a clear error or empty candidates.
- No existing project note is modified.

### Expected Output Example

```md
# Project Status Review - Portfolio Site

## Current State

Portfolio Site is in case-study planning. The main open loop is turning Vaultwright notes into a clear public story.

## Open Tasks

- Add Vaultwright case study section
- Write project status due 2026-04-26

## Next Actions

1. Draft the case study outline.
2. Review links to Writing and Local-first Software.
3. Decide which screenshots are needed.
```

## 4. Study Plan Generator

### User Story

As a student, I want Codex to turn study notes, open questions, and tasks into a study plan proposal without rewriting my lecture notes.

### MCP Tool Changes

Add a read-only context tool:

```ts
get_study_plan_context({
  vaultPath: string;
  studyPaths?: string[];
  studyTags?: string[];
  excludedFolders?: string[];
  includeCompletedTasks?: boolean;
  limit?: number;
})
```

Use `create_proposal_note` with `proposalType: "other"` initially, or add `proposalType: "study-plan"` in v0.2.

### Data Model Changes

```ts
type StudyPlanContext = {
  studyNotes: NoteRef[];
  headings: {
    sourcePath: string;
    heading: string;
    level: number;
  }[];
  openTasks: TaskRecord[];
  openQuestions: SourceLineRef[];
  relatedConcepts: string[];
};
```

### Safety Risks

- Study plans can overstate certainty. Include "review manually" wording.
- Do not move lecture notes into topic notes.
- Do not infer content from excluded folders.

### Tests Needed

- Collect study notes by folder and tag.
- Extract headings and question-like lines.
- Preserve task source references.
- Limit output size.
- Proposal writes only to `Vaultwright/Proposals/`.

### Expected Output Example

```md
# Study Plan - Database Indexing and OS Basics

## Review Order

1. Operating systems page cache
2. B-tree insertion
3. Hash indexes vs B-tree indexes

## Practice Questions

- When does a hash index outperform a B-tree?
- How does the OS page cache affect query behavior?

## Source Notes

- `Study/Database Indexing.md`
- `Study/Operating Systems Lecture 01.md`
```

## 5. MOC Draft Generator

### User Story

As a knowledge worker, I want Codex to draft a Map of Content from existing notes and links so I can review a topic structure before creating a real MOC note.

### MCP Tool Changes

Add read-only context:

```ts
get_moc_context({
  vaultPath: string;
  topic: string;
  seedPaths?: string[];
  excludedFolders?: string[];
  limit?: number;
})
```

Add proposal writer:

```ts
create_moc_proposal({
  vaultPath: string;
  title: string;
  content: string;
  sourcePaths: string[];
})
```

This may map internally to `create_proposal_note` with `proposalType: "moc"`.

### Data Model Changes

```ts
type MocContext = {
  topic: string;
  seedNotes: NoteRef[];
  relatedNotes: NoteRef[];
  existingLinks: {
    sourcePath: string;
    target: string;
  }[];
  candidateSections: string[];
};
```

### Safety Risks

- MOC drafts can look like final organization. Label as proposal.
- Do not create or move actual MOC notes outside Vaultwright folders.
- Avoid duplicate suggestions and low-confidence broad matches.

### Tests Needed

- Topic search returns ranked candidate notes.
- Seed paths reject traversal and excluded folders.
- Existing wiki links are extracted correctly.
- MOC proposal writes only to `Vaultwright/Proposals/`.
- Limit prevents reading too many notes.

### Expected Output Example

```md
# MOC Draft - Local-first Vault Maintenance

> Proposal only. Review before creating a permanent MOC.

## Core Notes

- [[Vaultwright]]
- [[MCP]]
- [[Codex]]
- [[Local-first Software]]

## Workflows

- Daily Review
- Inbox Cleanup
- Task Harvest
- Link Opportunities

## Open Questions

- Should an Obsidian UI exist in v0.2?
- Which proposal formats are most useful?
```

## 6. Graph Health Report

### User Story

As an Obsidian user, I want a local report that highlights vault graph issues such as orphan notes, broken links, heavy hubs, duplicate titles, and unlinked mentions.

### MCP Tool Changes

Add read-only analysis:

```ts
get_graph_health_report({
  vaultPath: string;
  excludedFolders?: string[];
  includeUnlinkedMentions?: boolean;
  limit?: number;
})
```

Optional writer:

```ts
create_graph_health_proposal({
  vaultPath: string;
  title: string;
  content: string;
})
```

This should write to `Vaultwright/Proposals/`.

### Data Model Changes

```ts
type GraphHealthReport = {
  totalNotes: number;
  orphanNotes: NoteRef[];
  brokenWikiLinks: {
    sourcePath: string;
    linkText: string;
  }[];
  duplicateTitles: {
    title: string;
    paths: string[];
  }[];
  hubNotes: {
    path: string;
    inboundCount: number;
    outboundCount: number;
  }[];
  unlinkedMentionCount?: number;
};
```

### Safety Risks

- Graph health can expose private structure if exclusions fail.
- Broken link reports should not auto-fix links.
- Hub/orphan labels should be descriptive, not judgmental.

### Tests Needed

- Detect orphan notes.
- Detect broken wiki links.
- Detect duplicate titles.
- Count inbound and outbound links.
- Exclude `Private`, `Archive`, `Vaultwright`, and custom exclusions.
- Do not read code blocks as link suggestions.

### Expected Output Example

```md
# Graph Health Report

## Summary

- Notes scanned: 17
- Orphan candidates: 2
- Broken wiki links: 1
- Duplicate titles: 0

## Orphan Candidates

- `Areas/Writing.md`
- `Meetings/2026-04-24 Vaultwright planning.md`

## Broken Links

- `Projects/Portfolio Site.md` links or refers to `Writing` without a confirmed wiki link.

## Suggested Manual Review

Run Link Opportunities next and manually add only links that make sense.
```

## 7. Optional Obsidian Plugin UI For Viewing Proposals

### User Story

As an Obsidian user, I want a lightweight UI panel that lists Vaultwright-generated reviews and proposals so I can inspect them without searching the `Vaultwright/` folder manually.

### MCP Tool Changes

No MCP server dependency is required for the first UI version. The plugin can read files from:

- `Vaultwright/Reviews/`
- `Vaultwright/Proposals/`
- `Vaultwright/Patches/`

Optional future MCP helper:

```ts
list_vaultwright_outputs({
  vaultPath: string;
  outputTypes?: ("reviews" | "proposals" | "patches")[];
  limit?: number;
})
```

This helper would be read-only and deterministic.

### Data Model Changes

```ts
type VaultwrightOutputIndexItem = {
  path: string;
  outputType: "review" | "proposal" | "patch";
  title: string;
  createdTime: string;
  modifiedTime: string;
  charCount: number;
};
```

For the Obsidian plugin package:

```ts
type ProposalViewState = {
  selectedOutputPath?: string;
  filter: "all" | "reviews" | "proposals" | "patches";
  sort: "newest" | "oldest" | "title";
};
```

### Safety Risks

- UI must not imply that patch proposals were applied.
- UI should not offer "apply patch" in v0.2 unless a separate approved workflow is designed.
- UI should never write into existing user notes.
- If the UI can delete Vaultwright output files, that must be explicitly out of scope for v0.2 or gated behind a separate safety review.

### Tests Needed

- Lists only files inside Vaultwright output folders.
- Ignores symlinked output paths.
- Opens proposals read-only.
- Clearly labels patch proposals as not applied.
- Handles missing Vaultwright folders gracefully.
- Does not modify notes when viewing or filtering.

### Expected Output Example

```text
Vaultwright Panel

[Reviews] [Proposals] [Patches]

2026-04-25 Daily Review
Inbox Cleanup Proposal
Task Harvest Proposal
Link Opportunities Proposal

Selected: Inbox Cleanup Proposal
Status: Proposal only. No notes were modified.
```

## Suggested v0.2 Implementation Order

1. Add shared v0.2 context types and parser improvements for Tasks tokens.
2. Extend task extraction with Tasks-compatible fields.
3. Add read-only context tools for project, study, MOC, dashboard, and graph health workflows.
4. Add proposal writer wrappers only where they improve clarity over `create_proposal_note`.
5. Add example outputs and recipe docs for each workflow.
6. Consider the Obsidian UI only after MCP workflows are stable and well tested.

## Non-goals For v0.2

- No automatic patch application.
- No automatic file moving or deletion.
- No automatic tag insertion.
- No automatic wiki-link insertion.
- No cloud sync.
- No telemetry.
- No authentication or billing.
- No external LLM or embedding calls from the MCP server.
