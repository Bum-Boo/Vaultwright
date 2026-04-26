import { mkdtemp, mkdir, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createPatchProposal } from "../src/tools/createPatchProposal.js";
import { readNote } from "../src/tools/readNote.js";

async function vault() {
  const dir = await mkdtemp(path.join(os.tmpdir(), "vaultwright-"));
  await mkdir(path.join(dir, "Notes"), { recursive: true });
  await mkdir(path.join(dir, "Private"), { recursive: true });
  await writeFile(path.join(dir, "Notes", "A.md"), "# A");
  await writeFile(path.join(dir, "Private", "Secret.md"), "# Secret");
  return dir;
}

async function trySymlink(
  target: string,
  link: string,
  type: "file" | "dir" | "junction"
): Promise<boolean> {
  try {
    await symlink(target, link, type);
    return true;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "EPERM" || code === "EACCES") return false;
    throw error;
  }
}

describe("path safety", () => {
  it("rejects path traversal", async () => {
    const dir = await vault();
    await expect(readNote({ vaultPath: dir, notePath: "../outside.md" })).rejects.toThrow(
      /traversal/i
    );
  });

  it("rejects normalized traversal segments", async () => {
    const dir = await vault();
    await expect(readNote({ vaultPath: dir, notePath: "Notes/../Notes/A.md" })).rejects.toThrow(
      /traversal/i
    );
  });

  it("rejects absolute notePath", async () => {
    const dir = await vault();
    await expect(
      readNote({ vaultPath: dir, notePath: path.join(dir, "Notes", "A.md") })
    ).rejects.toThrow(/relative/i);
  });

  it("rejects excluded folders", async () => {
    const dir = await vault();
    await expect(readNote({ vaultPath: dir, notePath: "Private/Secret.md" })).rejects.toThrow(
      /excluded/i
    );
  });

  it("rejects symlink escapes through a linked directory", async () => {
    const dir = await vault();
    const outside = await mkdtemp(path.join(os.tmpdir(), "vaultwright-outside-"));
    await writeFile(path.join(outside, "Outside.md"), "# Outside");
    const linked = path.join(dir, "Linked");
    const created = await trySymlink(
      outside,
      linked,
      process.platform === "win32" ? "junction" : "dir"
    );
    if (!created) return;

    await expect(readNote({ vaultPath: dir, notePath: "Linked/Outside.md" })).rejects.toThrow(
      /symlink|outside/i
    );
  });

  it("rejects symlink targets that resolve into excluded folders", async () => {
    const dir = await vault();
    const linked = path.join(dir, "LinkedPrivate");
    const created = await trySymlink(
      path.join(dir, "Private"),
      linked,
      process.platform === "win32" ? "junction" : "dir"
    );
    if (!created) return;

    await expect(readNote({ vaultPath: dir, notePath: "LinkedPrivate/Secret.md" })).rejects.toThrow(
      /excluded/i
    );
  });

  it("rejects patch proposals targeting excluded folders", async () => {
    const dir = await vault();
    await expect(
      createPatchProposal({
        vaultPath: dir,
        targetNotePath: "Private/Secret.md",
        title: "Do not patch private",
        patchContent: "- old\n+ new"
      })
    ).rejects.toThrow(/excluded/i);
  });

  it("rejects patch proposal targets inside user-specified excluded folders", async () => {
    const dir = await vault();
    await mkdir(path.join(dir, "Clients"), { recursive: true });
    await writeFile(path.join(dir, "Clients", "Acme.md"), "# Acme");

    await expect(
      createPatchProposal({
        vaultPath: dir,
        targetNotePath: "Clients/Acme.md",
        title: "Do not patch client note",
        patchContent: "- old\n+ new",
        excludedFolders: ["Clients"]
      })
    ).rejects.toThrow(/excluded/i);
  });
});
