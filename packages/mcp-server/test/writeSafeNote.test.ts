import { mkdir, mkdtemp, readdir, readFile, symlink } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { filenameWithNumericSuffix } from "../src/output/filenames.js";
import { writeSafeNote } from "../src/output/writeSafeNote.js";

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

describe("writeSafeNote", () => {
  it("writes only inside Vaultwright output folders", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "vaultwright-write-"));
    const result = await writeSafeNote({
      vaultPath: dir,
      outputKind: "Reviews",
      title: "Daily",
      content: "# Daily"
    });
    expect(result.createdPath.startsWith("Vaultwright/Reviews/")).toBe(true);
    await expect(readFile(path.join(dir, result.createdPath), "utf8")).resolves.toContain(
      "# Daily"
    );
  });

  it("adds numeric suffixes instead of overwriting existing files", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "vaultwright-write-"));
    const date = new Date("2026-04-25T00:00:00.000Z");
    const originalNow = Date;
    class FixedDate extends Date {
      constructor(...args: ConstructorParameters<typeof Date>) {
        super(args.length ? args[0] : date);
      }
      static now() {
        return date.getTime();
      }
    }
    // Avoid global Date patching in app code; this only checks flag wx by forcing same explicit helper in unit scope.
    globalThis.Date = FixedDate as DateConstructor;
    try {
      const first = await writeSafeNote({
        vaultPath: dir,
        outputKind: "Proposals",
        title: "Same",
        content: "one"
      });
      const second = await writeSafeNote({
        vaultPath: dir,
        outputKind: "Proposals",
        title: "Same",
        content: "two"
      });
      const third = await writeSafeNote({
        vaultPath: dir,
        outputKind: "Proposals",
        title: "Same",
        content: "three"
      });
      expect(first.createdPath).toMatch(/same\.md$/);
      expect(second.createdPath).toMatch(/same-2\.md$/);
      expect(third.createdPath).toMatch(/same-3\.md$/);
      await expect(readFile(path.join(dir, first.createdPath), "utf8")).resolves.toBe("one");
      await expect(readFile(path.join(dir, second.createdPath), "utf8")).resolves.toBe("two");
      await expect(readFile(path.join(dir, third.createdPath), "utf8")).resolves.toBe("three");
    } finally {
      globalThis.Date = originalNow;
    }
  });

  it("formats numeric filename suffixes predictably", () => {
    expect(filenameWithNumericSuffix("example.md", 2)).toBe("example-2.md");
    expect(filenameWithNumericSuffix("2026-04-25T00-00-00-000Z-same.md", 3)).toBe(
      "2026-04-25T00-00-00-000Z-same-3.md"
    );
  });

  it("rejects symlinked Vaultwright output folders before writing", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "vaultwright-write-"));
    const outside = await mkdtemp(path.join(os.tmpdir(), "vaultwright-outside-"));
    await mkdir(outside, { recursive: true });
    const created = await trySymlink(
      outside,
      path.join(dir, "Vaultwright"),
      process.platform === "win32" ? "junction" : "dir"
    );
    if (!created) return;

    await expect(
      writeSafeNote({
        vaultPath: dir,
        outputKind: "Reviews",
        title: "Escape",
        content: "should not write"
      })
    ).rejects.toThrow(/symlink/i);
    await expect(readdir(outside)).resolves.toEqual([]);
  });
});
