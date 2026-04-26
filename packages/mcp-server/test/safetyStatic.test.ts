import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

async function sourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(fullPath) : [fullPath];
  }));
  return files.flat().filter((file) => file.endsWith(".ts"));
}

describe("static safety guards", () => {
  it("does not log to stdout or use network APIs in server source", async () => {
    const files = await sourceFiles(path.join(process.cwd(), "src"));
    const violations = [];
    for (const file of files) {
      const content = await readFile(file, "utf8");
      if (/console\.log|process\.stdout/.test(content)) violations.push(`${file}: stdout logging`);
      if (/\bfetch\s*\(|\bWebSocket\b|from\s+["']node:https?["']|require\(["']https?["']\)/.test(content)) {
        violations.push(`${file}: network API`);
      }
    }
    expect(violations).toEqual([]);
  });

  it("keeps filesystem mutation APIs inside the safe output writer", async () => {
    const files = await sourceFiles(path.join(process.cwd(), "src"));
    const violations = [];
    for (const file of files) {
      const normalized = file.replace(/\\/g, "/");
      const content = await readFile(file, "utf8");
      const mutates = /\b(?:writeFile|appendFile|rename|unlink|rm|rmdir|copyFile|createWriteStream)\b/.test(content);
      if (mutates && !normalized.endsWith("/src/output/writeSafeNote.ts")) {
        violations.push(file);
      }
    }
    expect(violations).toEqual([]);
  });
});
