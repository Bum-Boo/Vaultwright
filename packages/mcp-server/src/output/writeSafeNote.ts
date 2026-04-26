import { promises as fs } from "node:fs";
import path from "node:path";
import { PathSafetyError, VaultwrightError } from "../safety/errors.js";
import { isInside, resolveVaultPath } from "../vault/pathSafety.js";
import { safeOutputFilename } from "./filenames.js";

export type OutputKind = "Reviews" | "Proposals" | "Patches";

async function ensureOutputDirectory(vaultRoot: string, outputKind: OutputKind): Promise<string> {
  let current = vaultRoot;
  for (const segment of ["Vaultwright", outputKind]) {
    const next = path.join(current, segment);
    if (!isInside(vaultRoot, next)) throw new PathSafetyError("Output folder escaped vaultPath.");

    let stat = await fs.lstat(next).catch((error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") return null;
      throw error;
    });

    if (!stat) {
      await fs.mkdir(next);
      stat = await fs.lstat(next);
    }

    if (stat.isSymbolicLink()) throw new PathSafetyError("Vaultwright output folders may not be symlinks.");
    if (!stat.isDirectory()) throw new PathSafetyError("Vaultwright output path is not a directory.");
    current = next;
  }
  const realDirectory = await fs.realpath(current);
  if (!isInside(vaultRoot, realDirectory)) throw new PathSafetyError("Output folder escaped vaultPath.");
  return realDirectory;
}

export async function writeSafeNote(input: {
  vaultPath: string;
  outputKind: OutputKind;
  title: string;
  content: string;
}): Promise<{ createdPath: string; charCount: number }> {
  if (!input.content.trim()) throw new VaultwrightError("Content must not be empty.");
  const vaultRoot = await resolveVaultPath(input.vaultPath);
  const folderAbsolute = await ensureOutputDirectory(vaultRoot, input.outputKind);

  const fileAbsolute = path.join(folderAbsolute, safeOutputFilename(input.title));
  if (!isInside(vaultRoot, fileAbsolute)) throw new PathSafetyError("Output file escaped vaultPath.");
  await fs.writeFile(fileAbsolute, input.content, { encoding: "utf8", flag: "wx" });
  return {
    createdPath: path.relative(vaultRoot, fileAbsolute).split(path.sep).join("/"),
    charCount: input.content.length
  };
}
