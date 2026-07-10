# Aegis Security CLI

[English](./README.md) · [한국어](./README.ko.md) · [日本語](./README.ja.md) · [中文](./README.zh-CN.md)

Aegis Security CLI는 Privit Aegis의 재사용 가능한 CLI 엔진입니다. 승인된
범위 안에서만 동작하고, 실행 전에 scope를 확인하며, 안전한 catalog에서
검사를 고른 뒤 민감 정보를 마스킹하여 JSON, Markdown, HTML, SARIF 보고서를
생성합니다.

웹 콘솔, GitHub Pages, AI 설정, Privit 전용 보고서 흐름은 별도 워크스페이스
레포에서 관리합니다:
<https://github.com/LeeHueeng/privit-aegis-workspace>

## 레포 역할

| 레포 | 역할 |
| --- | --- |
| `privit-project` | 재사용 가능한 Aegis CLI 엔진 |
| `privit-aegis-workspace` | 웹 콘솔, 보고서, Pages, AIGate CI 쇼케이스 |

## 빠른 시작

```bash
npm install
npm run catalog:generate
npm run aegis -- init
npm run aegis -- scope verify
npm run aegis -- plan --mode passive --target frontend
npm run aegis -- run --target frontend --mode passive --dry-run
npm run aegis -- report --format html
```

공개 후 GitHub에서 바로 설치:

```bash
npm install -g github:LeeHueeng/privit-project
aegis help --lang ko-KR
```

npm 패키지명은 `aegis-security-cli`로 준비되어 있지만 아직 npm registry에는
등록하지 않았습니다.

## 특징

- 기본값은 passive와 scope guard
- 2,430개 안전 검증 catalog
- 한국어, 영어, 일본어, 중국어 문서와 도움말
- 마스킹된 evidence와 보고서 생성
- SARIF 출력 지원
- Privit Aegis Workspace에서 commit SHA로 고정해 사용하는 CLI 엔진

## 자주 쓰는 명령

```bash
aegis init
aegis scope verify
aegis catalog generate
aegis docs generate --lang all
aegis plan --mode passive --target frontend
aegis run --mode passive --target frontend --dry-run
aegis report --format html
aegis report --format sarif
```

자세한 연동 방식은 [`docs/WORKSPACE_INTEGRATION.md`](./docs/WORKSPACE_INTEGRATION.md)를 참고하세요.
