export function wrapGeneratedNote(title: string, content: string): string {
  return `# ${title}\n\n${content.trim()}\n`;
}

export function patchProposalMarkdown(input: {
  title: string;
  targetNotePath: string;
  patchContent: string;
  rationale?: string;
}): string {
  return `# ${input.title}

> Warning: this is a Vaultwright patch proposal. It has not been applied.

Target note: \`${input.targetNotePath}\`

## Rationale

${input.rationale?.trim() || "No rationale provided."}

## Proposed Patch

\`\`\`diff
${input.patchContent.trim()}
\`\`\`
`;
}
