# Vaultwright

> 面向 Codex/MCP 工作流的 local-first Obsidian vault 维护工具。

[English](../README.md) | [한국어](README.ko.md) | [日本語](README.ja.md) | [中文](README.zh-CN.md)

Vaultwright 是 Obsidian vault 的 local-first 维护层。它通过本地 MCP server 与 Codex 配合，让 Codex 可以检查、总结、审核、整理并规划 vault，但不会悄悄修改现有笔记。

在连接真实 vault 之前，请先确认 `pnpm build`、`pnpm test`、`pnpm lint` 在本地通过，并且你有当前 vault 的备份。

## 适用对象

Vaultwright 适合把重要工作保存在 Markdown 笔记中，并希望使用 AI-assisted review，但不想把 vault 写入权限直接交给 AI 的用户。它适用于个人知识管理、学习笔记、项目笔记、会议笔记和 inbox cleanup 等仍需要人工最终判断的工作流。

典型用户包括 Obsidian 用户、开发者、学生、研究者、写作者和个人运营者。Codex 可以帮助寻找结构、任务、陈旧笔记、链接机会和 review theme，同时现有笔记保持 read-only。

## Local-first architecture

Vaultwright v0.1 保持 deterministic 和 local-first。MCP server 读取允许范围内的 Markdown 文件，扫描 vault metadata，验证 path，提取 link/tag/task，并把新的 review/proposal 文件保存到 Vaultwright 自己的文件夹中。

MCP server 不会调用 OpenAI、ChatGPT、Codex、embedding API 或任何外部 LLM API。Codex 是 reasoning layer，Vaultwright 是 local tool layer。

## Core workflows

- Daily/weekly vault review.
- 不移动文件的 inbox cleanup proposal。
- 跨 project、study、daily、inbox note 的 task harvesting。
- 供人工审查的保守 link opportunity report。
- 基于本地 Markdown context 的 project status summary。
- 只记录建议、不自动应用的 patch proposal。

## Codex 与 MCP server 的分工

Codex:

- 基于用户允许读取的 metadata 和 note content 进行推理。
- 编写 review draft、cleanup plan、link suggestion、MOC、study plan 和 project status summary。
- 判断下一步需要读取哪些信息。

Vaultwright MCP server:

- 验证 path 和 exclusion。
- 读取 vault 内的 Markdown 文件。
- 提取 frontmatter、heading、tag、link 和 task。
- 只在 `Vaultwright/Reviews`、`Vaultwright/Proposals`、`Vaultwright/Patches` 下写入新文件。
- v0.1 不编辑现有笔记。

## Installation

```bash
cd vaultwright
pnpm install
pnpm build
pnpm test
```

## Development commands

```bash
pnpm dev
pnpm build
pnpm test
pnpm lint
pnpm format
pnpm format:check
```

## 使用 test vault 运行

```bash
cd vaultwright
pnpm install
pnpm build
node packages/mcp-server/dist/index.js
```

使用的 vault path:

```text
vaultwright/test-vault
```

## Codex MCP config 示例

真实本地配置应使用 absolute path。Codex 可能从 plugin folder 或其他 working directory 运行 MCP config，relative path 可能失效。

```json
{
  "mcpServers": {
    "vaultwright": {
      "command": "node",
      "args": ["C:/absolute/path/to/vaultwright/packages/mcp-server/dist/index.js"]
    }
  }
}
```

`packages/codex-plugin/mcp/vaultwright.mcp.json` 是 plugin layout 模板，使用相对于 `packages/codex-plugin` 的路径。

## Example Codex prompts

1. "Run a daily vault review."
2. "Clean up my Inbox, but only create a proposal."
3. "Find tasks across the vault."
4. "Find link opportunities for this project."
5. "Create a weekly review."

更完整的 prompt 示例在 [../CODEX_PROMPTS.md](CODEX_PROMPTS.md)，示例输出在 [../../examples/outputs](../examples/outputs)。


## Safety model

Vaultwright v0.1 不修改现有笔记。它不会删除文件、移动文件、插入 tag、插入 wiki link、修改 frontmatter、应用 patch、同步到云服务、收集 telemetry，或调用网络 LLM API。

保存内容时，只会在 `Vaultwright/Reviews`、`Vaultwright/Proposals` 或 `Vaultwright/Patches` 中创建新文件。Patch proposal 只是文档，不会被自动应用。

默认排除文件夹包括 `.obsidian`、`.git`、`node_modules`、`Vaultwright`、`Private` 和 `Archive`。

## Project status

Vaultwright 是 early public v0.1，专注 deterministic MCP tooling 和安全的 proposal generation。它故意保持较窄的功能面：检查本地 Markdown，生成 review/proposal note，把破坏性或会修改状态的操作留在工具边界之外。

## Known limitations

- v0.1 只是 local MCP server 和 Codex skill package。
- 没有 Obsidian plugin UI。
- 没有 ChatGPT App。
- 没有 embedding 或 semantic search。
- patch proposal 永远不会自动应用。
- 现有笔记保持 read-only；cleanup/link work 会保存为新的 review/proposal note，供人工检查。
- 为了限制本地操作范围，较大的 Markdown 文件可能会在 scan/search 中被跳过。

## Roadmap

- v0.1: local STDIO MCP server, read-only inspection, safe output note creation, Codex plugin skill, docs, templates, recipes, sample vault.
- Later: richer analysis, optional Obsidian UI plugin, user-approved patch workflows, broader vault reporting.

## 致谢与署名

如果您公开分支、演示、文章或衍生作品，烦请提及 [@Bum-Boo](https://github.com/Bum-Boo) 和原始仓库。此项仅为礼貌性的署名请求，不构成额外的许可条件或限制。
