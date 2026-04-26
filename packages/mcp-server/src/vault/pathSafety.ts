import { promises as fs } from "node:fs";
import path from "node:path";
import { PathSafetyError } from "../safety/errors.js";
import { mergeExcludedFolders } from "../safety/excludedFolders.js";

export async function resolveVaultPath(vaultPath: string): Promise<string> {
  if (!vaultPath.trim()) throw new PathSafetyError("vaultPath is required.");
  if (vaultPath.includes("\0")) throw new PathSafetyError("Path contains an invalid null byte.");
  const resolved = path.resolve(vaultPath);
  const stat = await fs.stat(resolved).catch(() => null);
  if (!stat?.isDirectory()) throw new PathSafetyError(`vaultPath is not a directory: ${vaultPath}`);
  return await fs.realpath(resolved);
}

export function rejectAbsoluteNotePath(notePath: string): void {
  // Node's path.isAbsolute is platform-sensitive, so also catch Windows drive and UNC paths.
  if (path.isAbsolute(notePath) || /^[A-Za-z]:[\\/]/.test(notePath) || /^\\\\/.test(notePath)) {
    throw new PathSafetyError("notePath must be relative, not absolute.");
  }
}

export function rejectTraversal(relativePath: string): void {
  if (relativePath.includes("\0")) throw new PathSafetyError("Path contains an invalid null byte.");
  if (relativePath.split(/[\\/]+/).includes("..")) {
    throw new PathSafetyError("Path traversal is not allowed.");
  }
  const normalized = path.normalize(relativePath);
  if (
    normalized === ".." ||
    normalized.startsWith(`..${path.sep}`) ||
    normalized.includes(`${path.sep}..${path.sep}`)
  ) {
    throw new PathSafetyError("Path traversal is not allowed.");
  }
}

export function isMarkdownPath(filePath: string): boolean {
  return path.extname(filePath).toLowerCase() === ".md";
}

export function isInside(parent: string, child: string): boolean {
  const relative = path.relative(parent, child);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

export function firstPathSegment(relativePath: string): string {
  return path.normalize(relativePath).split(path.sep).filter(Boolean)[0] ?? "";
}

function normalizePolicyPath(relativePath: string): string {
  // Exclusion matching should behave the same for Windows and POSIX-style vault paths.
  return path.normalize(relativePath).replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase();
}

export function isExcluded(relativePath: string, excludedFolders?: string[]): boolean {
  const folders = mergeExcludedFolders(excludedFolders).map(normalizePolicyPath);
  const normalized = normalizePolicyPath(relativePath);
  return folders.some((folder) => normalized === folder || normalized.startsWith(`${folder}/`));
}

export async function resolveSafeNotePath(
  vaultPath: string,
  notePath: string,
  excludedFolders?: string[]
): Promise<{ vaultRoot: string; absolutePath: string; relativePath: string }> {
  rejectAbsoluteNotePath(notePath);
  rejectTraversal(notePath);
  if (!isMarkdownPath(notePath)) throw new PathSafetyError("Only Markdown .md files are allowed.");

  const vaultRoot = await resolveVaultPath(vaultPath);
  const absolutePath = path.resolve(vaultRoot, notePath);
  const relativePath = path.relative(vaultRoot, absolutePath);
  if (!isInside(vaultRoot, absolutePath))
    throw new PathSafetyError("Resolved file is outside vaultPath.");
  if (isExcluded(relativePath, excludedFolders))
    throw new PathSafetyError(`Path is inside an excluded folder: ${relativePath}`);

  // Check the final real path, not just the lexical path, to block symlink escapes.
  const realPath = await fs.realpath(absolutePath).catch(() => null);
  if (!realPath) throw new PathSafetyError(`Markdown file does not exist: ${notePath}`);
  if (!isInside(vaultRoot, realPath))
    throw new PathSafetyError("Symlink escapes outside vaultPath are not allowed.");
  if (!isMarkdownPath(realPath))
    throw new PathSafetyError("Resolved file must be a Markdown .md file.");

  const stat = await fs.stat(realPath);
  if (!stat.isFile()) throw new PathSafetyError("Resolved note path is not a file.");
  const realRelativePath = path.relative(vaultRoot, realPath);
  // A symlink can start in an allowed folder and resolve into an excluded folder.
  if (isExcluded(realRelativePath, excludedFolders)) {
    throw new PathSafetyError(`Resolved file is inside an excluded folder: ${realRelativePath}`);
  }

  return {
    vaultRoot,
    absolutePath: realPath,
    relativePath: realRelativePath.split(path.sep).join("/")
  };
}

export async function ensureSafeVaultChild(
  vaultPath: string,
  relativePath: string
): Promise<string> {
  rejectAbsoluteNotePath(relativePath);
  rejectTraversal(relativePath);
  const vaultRoot = await resolveVaultPath(vaultPath);
  const absolutePath = path.resolve(vaultRoot, relativePath);
  if (!isInside(vaultRoot, absolutePath))
    throw new PathSafetyError("Resolved path is outside vaultPath.");
  return absolutePath;
}
