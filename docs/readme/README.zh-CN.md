# Vaultwright

> 面向 Codex/MCP 工作流的 local-first Obsidian vault 维护层。

[Overview](../../README.md) | [English](README.en.md) | [한국어](README.ko.md) | [中文](README.zh-CN.md) | [日本語](README.ja.md)

Vaultwright 是一个本地 MCP server，让 Codex 可以检查、总结、审查、组织并规划 Obsidian vault，同时不会悄悄修改已有笔记。v0.1 的安全边界是：读取已有笔记，只创建新的 review/proposal/patch 文件。

## 适合谁

- 将重要工作保存在 Markdown 笔记中的 Obsidian 用户
- 希望 Codex 帮忙发现结构、任务、旧笔记和链接机会的用户
- 希望已有笔记保持 read-only，并由人做最终决策的用户

## 安全模型

- 不修改已有笔记
- 不删除、移动、插入标签、插入 wiki link 或修改 frontmatter
- 不调用 network LLM API
- 新文件只写入 `Vaultwright/Reviews`、`Vaultwright/Proposals` 或 `Vaultwright/Patches`
- 连接真实 vault 前，应先通过 `pnpm build`、`pnpm test`、`pnpm lint` 并准备备份

## 运行

```bash
cd vaultwright
pnpm install
pnpm build
pnpm test
```

## 核心流程

- daily/weekly vault review
- 生成 Inbox cleanup proposal
- 从 project、study、daily、inbox 笔记中收集任务
- 生成供人工审核的 link opportunity report
- 基于本地 Markdown 生成 project status summary
- 记录不会自动应用的 patch proposal
