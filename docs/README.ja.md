# Vaultwright

> Codex/MCP workflow 向けの local-first Obsidian vault メンテナンスツール。

[English](../README.md) | [한국어](README.ko.md) | [日本語](README.ja.md) | [中文](README.zh-CN.md)

Vaultwright は Obsidian vault のための local-first メンテナンス層です。ローカル MCP server を通じて Codex が vault を調査、要約、レビュー、整理、計画できるようにしますが、既存ノートを密かに変更することはありません。

実際の vault に接続する前に、`pnpm build`、`pnpm test`、`pnpm lint` がローカルで通ることと、現在の vault バックアップがあることを確認してください。

## 対象ユーザー

Vaultwright は、重要な作業を Markdown ノートに保存しつつ AI-assisted review を使いたいが、AI に vault の直接書き込み権限を渡したくない人のためのツールです。個人知識管理、学習ノート、プロジェクトノート、会議ノート、inbox cleanup のように、最終判断を人間が持ちたい workflow に向いています。

代表的なユーザーは Obsidian ユーザー、開発者、学生、研究者、作家、個人運用者です。Codex は構造、task、古いノート、link opportunity、review theme を見つける手助けをしますが、既存ノートは read-only のままです。

## Local-first architecture

Vaultwright v0.1 は deterministic かつ local-first な範囲に集中します。MCP server は許可された Markdown ファイルを読み、vault metadata を scan し、path を検証し、link/tag/task を抽出し、Vaultwright が所有する folder に新しい review/proposal file を保存します。

MCP server は OpenAI、ChatGPT、Codex、embedding API、外部 LLM API を呼びません。Codex が reasoning layer で、Vaultwright は local tool layer です。

## Core workflows

- Daily/weekly vault review.
- ファイルを移動しない inbox cleanup proposal。
- project、study、daily、inbox note をまたぐ task harvesting。
- 手動レビュー向けの保守的な link opportunity report。
- ローカル Markdown context からの project status summary。
- 適用せず提案だけを文書化する patch proposal。

## Codex と MCP server の役割

Codex:

- ユーザーが読み取りを許可した metadata と note content をもとに reasoning します。
- review draft、cleanup plan、link suggestion、MOC、study plan、project status summary を書きます。
- 次に読むべき情報を判断します。

Vaultwright MCP server:

- path と exclusion を検証します。
- vault 内の Markdown ファイルを読みます。
- frontmatter、heading、tag、link、task を抽出します。
- `Vaultwright/Reviews`、`Vaultwright/Proposals`、`Vaultwright/Patches` の下にだけ新規ファイルを書きます。
- v0.1 では既存ノートを編集しません。

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

## Test vault で実行

```bash
cd vaultwright
pnpm install
pnpm build
node packages/mcp-server/dist/index.js
```

使用する vault path:

```text
vaultwright/test-vault
```

## Codex MCP config example

実際のローカル設定では absolute path を使ってください。Codex が plugin folder や別の working directory から MCP config を実行すると、relative path は壊れる可能性があります。

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

`packages/codex-plugin/mcp/vaultwright.mcp.json` は plugin layout 用テンプレートで、`packages/codex-plugin` からの relative path を使います。

## Example Codex prompts

1. "Run a daily vault review."
2. "Clean up my Inbox, but only create a proposal."
3. "Find tasks across the vault."
4. "Find link opportunities for this project."
5. "Create a weekly review."

より詳しい prompt 例は [../CODEX_PROMPTS.md](CODEX_PROMPTS.md)、生成例は [../../examples/outputs](../examples/outputs) にあります。


## Safety model

Vaultwright v0.1 は既存ノートを変更しません。ファイル削除、移動、tag 挿入、wiki link 挿入、frontmatter 変更、patch 適用、cloud sync、telemetry 収集、network LLM API 呼び出しを行いません。

保存する場合は `Vaultwright/Reviews`、`Vaultwright/Proposals`、`Vaultwright/Patches` に新規ファイルだけを作成します。Patch proposal は文書であり、自動適用されません。

既定の除外 folder は `.obsidian`、`.git`、`node_modules`、`Vaultwright`、`Private`、`Archive` です。

## Project status

Vaultwright は deterministic MCP tooling と安全な proposal generation に集中した early public v0.1 です。意図的に範囲を狭く保ち、ローカル Markdown を inspect して review/proposal note を作成し、破壊的または状態を変更する操作は tool boundary の外に置きます。

## Known limitations

- v0.1 は local MCP server と Codex skill package のみです。
- Obsidian plugin UI はありません。
- ChatGPT App はありません。
- embedding や semantic search はありません。
- patch proposal は自動適用されません。
- 既存ノートは read-only で、cleanup/link work は手動レビュー用の新しい review/proposal note として保存されます。
- 大きな Markdown ファイルは local operation を bounded に保つため scan/search で skip されることがあります。

## Roadmap

- v0.1: local STDIO MCP server, read-only inspection, safe output note creation, Codex plugin skill, docs, templates, recipes, sample vault.
- Later: richer analysis, optional Obsidian UI plugin, user-approved patch workflows, broader vault reporting.

## クレジット

フォーク、デモ、記事、派生物を公開する際は、[@Bum-Boo](https://github.com/Bum-Boo) と元のリポジトリへの言及をお願いします。これは礼儀としてのお願いであり、追加のライセンス条件や制限ではありません。
