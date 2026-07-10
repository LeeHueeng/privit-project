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
npm run aegis -- profiles list
npm run aegis -- attacks list
npm run aegis -- init --profile baseline_web --attack-pack initial_access_hardening
npm run aegis -- scope verify
npm run aegis -- plan --mode passive --target frontend --profile baseline_web --attack-pack initial_access_hardening
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
- 2,970개 안전 검증 catalog
- 한국어, 영어, 일본어, 중국어 문서와 도움말
- 마스킹된 evidence와 보고서 생성
- SARIF 출력 지원
- 다양한 산업별 훈련 profile과 안전 공격 에뮬레이션 pack
- Privit Aegis Workspace에서 commit SHA로 고정해 사용하는 CLI 엔진

## 안전 공격 에뮬레이션 팩

[`mukul975/Anthropic-Cybersecurity-Skills`](https://github.com/mukul975/Anthropic-Cybersecurity-Skills)의
ATT&CK 기반 구조를 참고하되, Aegis는 실제 공격을 실행하지 않습니다. 공격
전술을 방어 검증 항목, 증적 요구사항, 금지 행동 목록, 안전한 계획 메타데이터로
바꿔서 사용합니다.

```bash
npm run aegis -- attacks list
npm run aegis -- attacks show credential_access_defense
npm run aegis -- plan --mode passive --target frontend --attack-pack recon_exposure_review
```

현재 제공되는 pack은 정찰 노출 검토, 초기 침투 표면 하드닝, 자격 증명 접근
방어, 실행/LOLBin 탐지, 지속성 헌팅 준비도, 권한 상승 통제, 방어 회피
텔레메트리, 수평 이동 준비도, 수집/유출 모니터링, C2 탐지, 랜섬웨어 복원력,
사기/남용 모니터링입니다.

설계상 차단되는 항목: exploit payload, phishing delivery, password guessing,
credential dumping, persistence 생성, C2 traffic, data exfiltration,
destructive write activity.

## 자주 쓰는 명령

```bash
aegis init
aegis profiles list
aegis profiles show saas_b2b
aegis attacks list
aegis attacks show credential_access_defense
aegis scope verify
aegis catalog generate
aegis docs generate --lang all
aegis plan --mode passive --target frontend --profile saas_b2b --attack-pack initial_access_hardening
aegis run --mode passive --target frontend --dry-run
aegis report --format html
aegis report --format sarif
```

자세한 연동 방식은 [`docs/WORKSPACE_INTEGRATION.md`](./docs/WORKSPACE_INTEGRATION.md)를 참고하세요.
