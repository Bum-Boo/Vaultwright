import matter from "gray-matter";

export type FrontmatterResult = {
  data: Record<string, unknown>;
  content: string;
  error?: string;
};

export function parseFrontmatter(markdown: string): FrontmatterResult {
  try {
    const parsed = matter(markdown);
    return { data: parsed.data as Record<string, unknown>, content: parsed.content };
  } catch (error) {
    return {
      data: {},
      content: markdown.replace(/^---[\s\S]*?(?:---|\.\.\.)\s*/, ""),
      error: error instanceof Error ? error.message : "Invalid frontmatter"
    };
  }
}
