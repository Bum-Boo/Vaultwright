# Vaultwright

> Codex/MCP workflow를 위한 local-first Obsidian vault 유지관리 계층입니다.

[Overview](../../README.md) | [English](README.en.md) | [한국어](README.ko.md) | [中文](README.zh-CN.md) | [日本語](README.ja.md)

Vaultwright는 Codex가 Obsidian vault를 읽고, 요약하고, 검토하고, 정리 계획을 세울 수 있도록 돕는 로컬 MCP 서버입니다. 기존 노트를 조용히 수정하지 않고, 새 review/proposal/patch 파일만 생성하는 구조를 v0.1의 핵심 안전 경계로 둡니다.

## 누구를 위한 도구인가

- Markdown 노트에 중요한 작업을 보관하는 Obsidian 사용자
- Codex에게 vault 구조, 할 일, 오래된 노트, 링크 기회를 찾게 하고 싶은 사용자
- 기존 노트는 read-only로 유지하고 최종 판단은 사람이 하고 싶은 사용자

## 안전 모델

- 기존 노트 수정 없음
- 파일 삭제, 이동, 태그 삽입, wiki link 삽입, frontmatter 변경 없음
- network LLM API 호출 없음
- 새 파일은 `Vaultwright/Reviews`, `Vaultwright/Proposals`, `Vaultwright/Patches` 아래에만 생성
- 실제 vault에 연결하기 전 `pnpm build`, `pnpm test`, `pnpm lint` 통과와 백업을 권장

## 실행

```bash
cd vaultwright
pnpm install
pnpm build
pnpm test
```

## 주요 흐름

- daily/weekly vault review
- Inbox cleanup proposal 생성
- project/study/daily/inbox 노트의 task 수집
- 수동 검토용 link opportunity report
- 로컬 Markdown 기반 project status summary
- 적용되지 않는 patch proposal 문서화
