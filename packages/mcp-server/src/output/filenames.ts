import { promises as fs } from "node:fs";
import path from "node:path";

export function slugifyTitle(title: string): string {
  const slug = title
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
  return slug || "untitled";
}

export function timestampForFilename(date = new Date()): string {
  return date.toISOString().replace(/[:.]/g, "-");
}

export function safeOutputFilename(title: string, date = new Date()): string {
  return `${timestampForFilename(date)}-${slugifyTitle(title)}.md`;
}

export function filenameWithNumericSuffix(filename: string, suffix: number): string {
  const extension = path.extname(filename);
  const basename = path.basename(filename, extension);
  return `${basename}-${suffix}${extension}`;
}

export async function findUniqueFilename(
  directory: string,
  desiredFilename: string
): Promise<string> {
  for (let suffix = 1; suffix <= 10_000; suffix += 1) {
    const candidate =
      suffix === 1 ? desiredFilename : filenameWithNumericSuffix(desiredFilename, suffix);
    const candidatePath = path.join(directory, candidate);
    const exists = await fs.access(candidatePath).then(
      () => true,
      () => false
    );
    if (!exists) return candidate;
  }
  throw new Error("Could not find a unique Vaultwright output filename.");
}
