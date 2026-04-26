import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { SERVER_NAME, SERVER_VERSION } from "./config.js";
import { createPatchProposal, createPatchProposalInput } from "./tools/createPatchProposal.js";
import { createProposalNote, createProposalNoteInput } from "./tools/createProposalNote.js";
import { createReviewNote, createReviewNoteInput } from "./tools/createReviewNote.js";
import { extractTasks, extractTasksInput } from "./tools/extractTasks.js";
import {
  findLinkOpportunities,
  findLinkOpportunitiesInput
} from "./tools/findLinkOpportunities.js";
import { getVaultSummary, getVaultSummaryInput } from "./tools/getVaultSummary.js";
import { readNote, readNoteInput } from "./tools/readNote.js";
import { readNotesBatch, readNotesBatchInput } from "./tools/readNotesBatch.js";
import { scanVault, scanVaultInput } from "./tools/scanVault.js";
import { searchNotes, searchNotesInput } from "./tools/searchNotes.js";

type ToolDefinition = {
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (input: unknown) => Promise<unknown>;
};

const stringSchema = { type: "string" };
const stringArraySchema = { type: "array", items: { type: "string" } };

const tools: Record<string, ToolDefinition> = {
  get_vault_summary: {
    description: "Read-only summary of an Obsidian vault without reading excluded folders.",
    inputSchema: {
      type: "object",
      properties: { vaultPath: stringSchema, excludedFolders: stringArraySchema },
      required: ["vaultPath"]
    },
    handler: (input) => getVaultSummary(getVaultSummaryInput.parse(input))
  },
  scan_vault: {
    description: "Read-only scan of Markdown metadata across the vault.",
    inputSchema: {
      type: "object",
      properties: {
        vaultPath: stringSchema,
        excludedFolders: stringArraySchema,
        maxFiles: { type: "number" },
        maxFileBytesForScan: { type: "number" }
      },
      required: ["vaultPath"]
    },
    handler: (input) => scanVault(scanVaultInput.parse(input))
  },
  read_note: {
    description: "Read one safe relative Markdown note path.",
    inputSchema: {
      type: "object",
      properties: { vaultPath: stringSchema, notePath: stringSchema, maxChars: { type: "number" } },
      required: ["vaultPath", "notePath"]
    },
    handler: (input) => readNote(readNoteInput.parse(input))
  },
  read_notes_batch: {
    description: "Read several safe relative Markdown note paths with per-file errors.",
    inputSchema: {
      type: "object",
      properties: {
        vaultPath: stringSchema,
        notePaths: stringArraySchema,
        maxFiles: { type: "number" },
        maxCharsPerFile: { type: "number" },
        totalMaxChars: { type: "number" }
      },
      required: ["vaultPath", "notePaths"]
    },
    handler: (input) => readNotesBatch(readNotesBatchInput.parse(input))
  },
  search_notes: {
    description: "Read-only lexical search over note titles, tags, headings, links, and body text.",
    inputSchema: {
      type: "object",
      properties: {
        vaultPath: stringSchema,
        query: stringSchema,
        excludedFolders: stringArraySchema,
        maxFileBytesForScan: { type: "number" },
        limit: { type: "number" }
      },
      required: ["vaultPath", "query"]
    },
    handler: (input) => searchNotes(searchNotesInput.parse(input))
  },
  extract_tasks: {
    description: "Read-only extraction of Markdown checkbox tasks.",
    inputSchema: {
      type: "object",
      properties: {
        vaultPath: stringSchema,
        excludedFolders: stringArraySchema,
        includeDone: { type: "boolean" },
        limit: { type: "number" }
      },
      required: ["vaultPath"]
    },
    handler: (input) => extractTasks(extractTasksInput.parse(input))
  },
  find_link_opportunities: {
    description: "Read-only conservative suggestions for unlinked mentions of existing notes.",
    inputSchema: {
      type: "object",
      properties: {
        vaultPath: stringSchema,
        notePath: stringSchema,
        excludedFolders: stringArraySchema,
        limit: { type: "number" }
      },
      required: ["vaultPath"]
    },
    handler: (input) => findLinkOpportunities(findLinkOpportunitiesInput.parse(input))
  },
  create_review_note: {
    description: "Create a new note only in Vaultwright/Reviews. Never overwrites.",
    inputSchema: {
      type: "object",
      properties: {
        vaultPath: stringSchema,
        reviewType: { type: "string", enum: ["daily", "weekly", "project", "study"] },
        title: stringSchema,
        content: stringSchema
      },
      required: ["vaultPath", "reviewType", "title", "content"]
    },
    handler: (input) => createReviewNote(createReviewNoteInput.parse(input))
  },
  create_proposal_note: {
    description: "Create a new note only in Vaultwright/Proposals. Never overwrites.",
    inputSchema: {
      type: "object",
      properties: {
        vaultPath: stringSchema,
        proposalType: {
          type: "string",
          enum: ["inbox-cleanup", "task-harvest", "link-opportunities", "moc", "dashboard", "other"]
        },
        title: stringSchema,
        content: stringSchema
      },
      required: ["vaultPath", "proposalType", "title", "content"]
    },
    handler: (input) => createProposalNote(createProposalNoteInput.parse(input))
  },
  create_patch_proposal: {
    description: "Create a patch proposal in Vaultwright/Patches. It never applies the patch.",
    inputSchema: {
      type: "object",
      properties: {
        vaultPath: stringSchema,
        targetNotePath: stringSchema,
        title: stringSchema,
        patchContent: stringSchema,
        rationale: stringSchema,
        excludedFolders: stringArraySchema
      },
      required: ["vaultPath", "targetNotePath", "title", "patchContent"]
    },
    handler: (input) => createPatchProposal(createPatchProposalInput.parse(input))
  }
};

export function createVaultwrightServer(): Server {
  const server = new Server(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: Object.entries(tools).map(([name, tool]) => ({
      name,
      description: tool.description,
      inputSchema: tool.inputSchema
    }))
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const tool = tools[request.params.name];
    if (!tool) throw new Error(`Unknown tool: ${request.params.name}`);
    try {
      const result = await tool.handler(request.params.arguments ?? {});
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown Vaultwright error";
      return { isError: true, content: [{ type: "text", text: message }] };
    }
  });

  return server;
}
