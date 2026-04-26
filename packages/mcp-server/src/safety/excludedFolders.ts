export const DEFAULT_EXCLUDED_FOLDERS = [
  ".obsidian",
  ".git",
  "node_modules",
  "Vaultwright",
  "Private",
  "Archive"
];

export const VAULTWRIGHT_OUTPUT_FOLDERS = [
  "Vaultwright/Reviews",
  "Vaultwright/Proposals",
  "Vaultwright/Patches",
  "Vaultwright/Logs"
];

export function mergeExcludedFolders(excludedFolders?: string[]): string[] {
  return Array.from(new Set([...DEFAULT_EXCLUDED_FOLDERS, ...(excludedFolders ?? [])].filter(Boolean)));
}
