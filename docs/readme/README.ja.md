# Vaultwright

> Codex/MCP ワークフロー向けの local-first Obsidian vault メンテナンス層です。

[Overview](../../README.md) | [English](README.en.md) | [한국어](README.ko.md) | [中文](README.zh-CN.md) | [日本語](README.ja.md)

Vaultwright は、Codex が Obsidian vault を検査、要約、レビュー、整理、計画できるようにするローカル MCP server です。既存ノートを黙って変更せず、新しい review/proposal/patch ファイルだけを作成することを v0.1 の安全境界にしています。

## 対象ユーザー

- 重要な作業を Markdown ノートに保存している Obsidian ユーザー
- Codex に構造、タスク、古いノート、リンク機会を見つけてほしいユーザー
- 既存ノートは read-only のままにし、最終判断は人間が行いたいユーザー

## 安全モデル

- 既存ノートを変更しない
- ファイル削除、移動、タグ挿入、wiki link 挿入、frontmatter 変更をしない
- network LLM API を呼び出さない
- 新規ファイルは `Vaultwright/Reviews`、`Vaultwright/Proposals`、`Vaultwright/Patches` の下にのみ作成
- 実際の vault に接続する前に `pnpm build`、`pnpm test`、`pnpm lint` の成功とバックアップを推奨

## 実行

```bash
cd vaultwright
pnpm install
pnpm build
pnpm test
```

## 主なワークフロー

- daily/weekly vault review
- Inbox cleanup proposal の作成
- project、study、daily、inbox ノートからの task 収集
- 手動レビュー用 link opportunity report
- ローカル Markdown からの project status summary
- 自動適用されない patch proposal の記録
