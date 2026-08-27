# Vaultwright

> Codex/MCP workflow를 위한 local-first Obsidian vault 유지관리 도구.

[English](../README.md) | [한국어](README.ko.md) | [日本語](README.ja.md) | [中文](README.zh-CN.md)

Vaultwright는 Obsidian vault를 위한 local-first 유지관리 계층입니다. 로컬 MCP 서버를 통해 Codex가 vault를 살펴보고, 요약하고, 검토하고, 정리 계획을 만들 수 있게 하지만, 기존 노트를 조용히 수정하지는 않습니다.

실제 vault에 연결하기 전에 `pnpm build`, `pnpm test`, `pnpm lint`가 로컬에서 통과하고 현재 vault 백업이 있는지 확인하세요.

## 누구를 위한 도구인가

Vaultwright는 중요한 작업을 Markdown 노트에 보관하면서도 AI-assisted review를 쓰고 싶지만, AI에게 vault 쓰기 권한을 바로 넘기고 싶지 않은 사람을 위한 도구입니다. 개인 지식관리, 학습 노트, 프로젝트 노트, 회의 노트, inbox cleanup처럼 최종 판단을 사람이 유지해야 하는 흐름에 맞춰져 있습니다.

대표 사용자는 Obsidian 사용자, 개발자, 학생, 연구자, 작가, 1인 운영자입니다. Codex가 구조, task, 오래된 노트, link opportunity, review theme을 찾도록 돕되 기존 노트는 read-only로 둡니다.

## Local-first architecture

Vaultwright v0.1은 deterministic하고 local-first인 범위에 집중합니다. MCP 서버는 허용된 Markdown 파일을 읽고, vault metadata를 스캔하고, path를 검증하고, link/tag/task를 추출한 뒤 Vaultwright가 소유한 폴더에 새 review/proposal 파일을 저장합니다.

MCP 서버는 OpenAI, ChatGPT, Codex, embedding API, 외부 LLM API를 호출하지 않습니다. Codex가 reasoning layer이고, Vaultwright는 local tool layer입니다.

## Core workflows

- Daily/weekly vault review.
- 파일을 옮기지 않고 messy note를 묶어 주는 inbox cleanup proposal.
- project, study, daily, inbox note 전체의 task harvesting.
- 사람이 검토할 수 있는 보수적인 link opportunity report.
- 로컬 Markdown context 기반 project status summary.
- 실제 적용 없이 제안 내용을 문서화하는 patch proposal.

## Codex와 MCP 서버의 역할

Codex:

- 사용자가 읽도록 허용한 metadata와 note content를 바탕으로 reasoning합니다.
- review draft, cleanup plan, link suggestion, MOC, study plan, project status summary를 작성합니다.
- 다음에 읽을 정보가 무엇인지 판단합니다.

Vaultwright MCP server:

- path와 exclusion을 검증합니다.
- vault 내부 Markdown 파일을 읽습니다.
- frontmatter, heading, tag, link, task를 추출합니다.
- `Vaultwright/Reviews`, `Vaultwright/Proposals`, `Vaultwright/Patches` 아래에만 새 파일을 씁니다.
- v0.1에서는 기존 노트를 수정하지 않습니다.

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

## Test vault로 실행

```bash
cd vaultwright
pnpm install
pnpm build
node packages/mcp-server/dist/index.js
```

사용할 vault path:

```text
vaultwright/test-vault
```

## Codex MCP config 예시

실제 로컬 설정에서는 absolute path를 사용하세요. Codex가 plugin folder나 다른 working directory에서 MCP config를 실행하면 relative path가 깨질 수 있습니다.

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

`packages/codex-plugin/mcp/vaultwright.mcp.json`은 plugin layout용 template이며 `packages/codex-plugin` 기준 relative path를 사용합니다.

## Example Codex prompts

1. "Run a daily vault review."
2. "Clean up my Inbox, but only create a proposal."
3. "Find tasks across the vault."
4. "Find link opportunities for this project."
5. "Create a weekly review."

더 자세한 prompt 예시는 [../CODEX_PROMPTS.md](CODEX_PROMPTS.md)에 있고, 생성 예시는 [../../examples/outputs](../examples/outputs)에 있습니다.


## Safety model

Vaultwright v0.1은 기존 노트를 수정하지 않습니다. 파일 삭제, 이동, tag 삽입, wiki link 삽입, frontmatter 변경, patch 적용, cloud sync, telemetry 수집, network LLM API 호출을 하지 않습니다.

무언가를 저장할 때는 `Vaultwright/Reviews`, `Vaultwright/Proposals`, `Vaultwright/Patches` 아래에 새 파일만 만듭니다. Patch proposal은 문서일 뿐 자동 적용되지 않습니다.

기본 제외 폴더는 `.obsidian`, `.git`, `node_modules`, `Vaultwright`, `Private`, `Archive`입니다.

## Project status

Vaultwright는 deterministic MCP tooling과 안전한 proposal generation에 집중한 early public v0.1입니다. 유용한 표면적을 의도적으로 좁게 유지합니다: 로컬 Markdown을 inspect하고 review/proposal note를 만들며, 파괴적이거나 mutating action은 도구 경계 밖에 둡니다.

## Known limitations

- v0.1은 local MCP server와 Codex skill package입니다.
- Obsidian plugin UI는 없습니다.
- ChatGPT App은 없습니다.
- embedding이나 semantic search는 없습니다.
- patch proposal은 자동 적용되지 않습니다.
- 기존 노트는 read-only이며 cleanup/link work는 사람이 검토할 새 review/proposal note로 저장됩니다.
- 큰 Markdown 파일은 로컬 작업 범위를 제한하기 위해 scan/search에서 건너뛸 수 있습니다.

## Roadmap

- v0.1: local STDIO MCP server, read-only inspection, safe output note creation, Codex plugin skill, docs, templates, recipes, sample vault.
- 이후: 더 풍부한 analysis, optional Obsidian UI plugin, user-approved patch workflow, broader vault reporting.

## 출처 표기

포크, 데모, 글 또는 파생 작업을 공개할 때 [@Bum-Boo](https://github.com/Bum-Boo)와 원본 저장소를 함께 언급해 주시면 감사하겠습니다. 이는 예의상 부탁드리는 크레딧 요청이며, 추가 라이선스 조건이나 제한이 아닙니다.
