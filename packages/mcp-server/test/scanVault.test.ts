import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { scanVault } from "../src/tools/scanVault.js";

describe("scan_vault", () => {
  it("extracts metadata and skips default excluded folders", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "vaultwright-scan-"));
    await mkdir(path.join(dir, "Notes"), { recursive: true });
    await mkdir(path.join(dir, "Private"), { recursive: true });
    await writeFile(path.join(dir, "Notes", "MCP.md"), "---\naliases: [Model Context Protocol]\n---\n# MCP\n#tools\n[[Codex]]\n- [ ] Review");
    await writeFile(path.join(dir, "Private", "Secret.md"), "# Secret");

    const results = await scanVault({ vaultPath: dir });
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      path: "Notes/MCP.md",
      title: "MCP",
      taskCount: 1
    });
    expect(results[0].wikiLinks).toEqual(["Codex"]);
  });

  it("keeps default excluded folders when extra exclusions are provided", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "vaultwright-scan-"));
    await mkdir(path.join(dir, "Notes"), { recursive: true });
    await mkdir(path.join(dir, "Private"), { recursive: true });
    await writeFile(path.join(dir, "Notes", "A.md"), "# A");
    await writeFile(path.join(dir, "Private", "Secret.md"), "# Secret");

    const results = await scanVault({ vaultPath: dir, excludedFolders: ["Other"] });
    expect(results.map((result) => result.path)).toEqual(["Notes/A.md"]);
  });
});
