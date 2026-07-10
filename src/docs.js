import { CATEGORY_DISTRIBUTION, EXECUTION_MODES, TOOL_ADAPTERS } from "./config.js";
import { DEFAULT_LOCALE, localesFor, normalizeLocale, SUPPORTED_LOCALES } from "./i18n.js";
import { writeText } from "./io.js";
import { listAttackPacks } from "./attackPacks.js";
import { listProfiles } from "./profiles.js";

const STRINGS = {
  "ko-KR": {
    agentTitle: "에이전트 보안 체크",
    humanTitle: "Aegis CLI 사용자 보안 가이드",
    agentIntro: "이 문서는 Aegis CLI 에이전트와 도구 어댑터를 위한 생성 문서입니다. 승인된 범위 안에서만 비파괴 보안 테스트를 실행하도록 운영 규칙을 정의합니다.",
    humanIntro: "Aegis CLI는 팀이 소유했거나 테스트 승인을 받은 서비스에 대해 승인된 비파괴 보안 체크를 실행하도록 돕습니다.",
    principles: "에이전트 운영 원칙",
    scope: "범위 보호 규칙",
    tools: "허용 도구",
    modes: "실행 모드 매트릭스",
    catalog: "체크 카탈로그 선택",
    trainingProfiles: "다양한 훈련 프로파일",
    trainingProfilesIntro: "Aegis는 하나의 회사나 한 업종에 고정되지 않습니다. 승인된 범위는 그대로 유지하면서 업종별 위험 질문, 우선 검사군, 증거 수집 관점을 바꿔서 사용할 수 있습니다.",
    profileHeader: "| 프로파일 | 설명 | 안전 모드 | 주요 대상 |",
    attackPacks: "안전 공격 에뮬레이션 팩",
    attackPacksIntro: "공격 팩은 실제 공격 실행이 아니라 MITRE ATT&CK 전술을 방어적 검증 항목으로 바꾼 것입니다. exploit, credential theft, persistence, exfiltration, destructive behavior는 계속 차단됩니다.",
    attackPackHeader: "| 팩 | 설명 | 허용 모드 | 전술 |",
    evidence: "증거 수집",
    frontend: "프론트엔드 이상 캡처",
    auth: "인증 테스트 규칙",
    finding: "Finding 정규화",
    report: "보고서 생성",
    quickStart: "빠른 시작",
    authorization: "승인과 범위",
    backend: "백엔드/API 테스트",
    db: "DB 읽기 전용 감사",
    supplyChain: "공급망 검사",
    docker: "Docker 사용",
    npm: "npm 사용",
    cicd: "CI/CD 사용",
    remediation: "보고서와 수정",
    adapterHeader: "| 어댑터 | 도구 | 허용 모드 |",
    modeHeader: "| 모드 | 운영 안전성 | 수동 승인 | 설명 |",
    agentBullets: [
      "`aegis.scope.json`이 없으면 계획과 실행을 시작하지 않습니다.",
      "`catalog/security-checks.jsonl`의 비파괴 체크만 실행합니다.",
      "allowlist에 등록된 도구 어댑터만 사용합니다.",
      "LLM 출력은 계획과 요약에만 사용하고 직접 셸 권한으로 취급하지 않습니다.",
      "LLM 사용 전과 보고서 생성 전 민감정보를 redaction합니다."
    ],
    scopeBullets: [
      "모든 URL은 대상의 `allowed_hosts`와 `allowed_paths`에 일치해야 합니다.",
      "`denied_paths`에 일치하면 요청을 차단합니다.",
      "운영 환경은 기본적으로 `passive` 모드만 허용합니다.",
      "`authenticated`와 `db_audit`는 명시적인 수동 승인이 필요합니다.",
      "파괴적 테스트, 무차별 시도, 탈취, 지속성, 회피 행위는 차단됩니다."
    ],
    selectionSteps: [
      "검증된 scope를 불러옵니다.",
      "대상 유형과 실행 모드로 필터링합니다.",
      "`destructive=true` 체크를 거부합니다.",
      "수동 승인 체크는 승인이 없으면 거부합니다.",
      "알 수 없는 도구 어댑터를 거부합니다.",
      "scope safety 설정의 rate limit과 concurrency를 적용합니다."
    ],
    shared: {
      evidence: "artifact는 `.aegis/artifacts/<target>/<scan-id>/`에 저장하고 정규화된 결과는 `.aegis/scans/<scan-id>/results.json`에 저장합니다. 요청/응답 메타데이터는 저장하되 민감한 값은 저장하지 않습니다.",
      frontend: "console error, page error, failed network request, auth state mismatch, visual regression, browser security policy event를 캡처합니다.",
      auth: "전용 테스트 계정만 사용하고 운영 사용자 자격 증명은 재사용하지 않습니다. 역할 이름과 세션 메타데이터만 저장하고 token/cookie는 redaction합니다.",
      finding: "모든 finding은 id, project, environment, asset, target type, category, title, severity, confidence, status, redacted evidence, impact, safe reproduction, recommendation, mapped standards, timestamps를 포함해야 합니다.",
      report: "보고서는 JSON, Markdown, HTML, SARIF로 생성할 수 있습니다. 보고서에는 secret redaction을 적용하고 페이로드 카탈로그, 우회 절차, 권한 상승 단계, 데이터 추출 절차를 포함하지 않습니다.",
      authorization: "`aegis.scope.json`은 필수입니다. 프로젝트, 환경, 활성 대상, 허용 host/path, 차단 path, 승인 소유자, 증명 방식, 만료일, 안전 제한을 기록합니다. 운영 환경은 기본적으로 passive-only입니다.",
      frontendGuide: "프론트엔드 체크는 헤더, 콘솔 오류, 실패한 네트워크 요약, 스크린샷, DOM 스냅샷 같은 안전한 브라우저/런타임 증거를 수집합니다.",
      backend: "API 체크는 안전 카탈로그에서 선택됩니다. 인증 및 role matrix 체크는 명시적 승인과 전용 테스트 계정이 필요합니다.",
      db: "데이터베이스 감사 모드는 읽기 전용 구성 검토로 제한됩니다. 쓰기 쿼리, 스키마 변경, 데이터 덤프는 정책으로 차단됩니다.",
      supplyChain: "CI 모드는 SAST, SCA, SBOM, 컨테이너, IaC, secret scanning 연동을 위한 모드입니다.",
      npm: "패키지는 `security:init`, `security:plan`, `security:frontend`, `security:api`, `security:ci`, `security:report` 스크립트를 포함합니다.",
      cicd: "`aegis scope verify`, `aegis plan --mode ci`, `aegis run --mode ci`를 실행한 뒤 `aegis report --format sarif`로 SARIF를 생성합니다.",
      remediation: "보고서는 범위, 환경, 스캔 구성, 심각도별 finding, artifact, 인증 matrix 자리표시자, 공급망 준비 상태, DB 감사 준비 상태, 수정 가이드를 포함합니다."
    }
  },
  "ja-JP": {
    agentTitle: "エージェント向けセキュリティチェック",
    humanTitle: "Aegis CLI ユーザーセキュリティガイド",
    agentIntro: "この文書は Aegis CLI のエージェントとツールアダプター向けに生成されます。承認済みスコープ内でのみ非破壊のセキュリティテストを実行するための運用ルールを定義します。",
    humanIntro: "Aegis CLI は、チームが所有またはテスト承認を受けたサービスに対して、承認済みで非破壊のセキュリティチェックを実行するためのツールです。",
    principles: "エージェント運用原則",
    scope: "スコープ保護ルール",
    tools: "許可ツール",
    modes: "実行モードマトリクス",
    catalog: "チェックカタログ選択",
    trainingProfiles: "多様なトレーニングプロファイル",
    trainingProfilesIntro: "Aegis は 1 社または 1 業種に固定されません。承認済みスコープを維持しながら、業種別のリスク質問、優先チェック、証拠収集の観点を切り替えられます。",
    profileHeader: "| プロファイル | 説明 | 安全モード | 主な対象 |",
    attackPacks: "安全な攻撃エミュレーションパック",
    attackPacksIntro: "攻撃パックは実際の攻撃実行ではなく、MITRE ATT&CK の戦術を防御的な検証項目へ変換したものです。exploit、credential theft、persistence、exfiltration、destructive behavior は引き続きブロックされます。",
    attackPackHeader: "| パック | 説明 | 許可モード | 戦術 |",
    evidence: "証拠収集",
    frontend: "フロントエンド異常キャプチャ",
    auth: "認証テストルール",
    finding: "Finding 正規化",
    report: "レポート生成",
    quickStart: "クイックスタート",
    authorization: "承認とスコープ",
    backend: "バックエンド/API テスト",
    db: "DB 読み取り専用監査",
    supplyChain: "サプライチェーン検査",
    docker: "Docker 使用方法",
    npm: "npm 使用方法",
    cicd: "CI/CD 使用方法",
    remediation: "レポートと修正",
    adapterHeader: "| アダプター | ツール | 許可モード |",
    modeHeader: "| モード | 本番安全性 | 手動承認 | 説明 |",
    agentBullets: [
      "`aegis.scope.json` がない場合、計画または実行を開始しません。",
      "`catalog/security-checks.jsonl` の非破壊チェックのみ実行します。",
      "allowlist に登録されたツールアダプターのみ使用します。",
      "LLM 出力は計画と要約に限定し、直接のシェル権限として扱いません。",
      "LLM 利用前とレポート生成前に機密情報を redaction します。"
    ],
    scopeBullets: [
      "すべての URL は対象の `allowed_hosts` と `allowed_paths` に一致する必要があります。",
      "`denied_paths` に一致した場合、リクエストをブロックします。",
      "本番環境では既定で `passive` モードのみ許可します。",
      "`authenticated` と `db_audit` は明示的な手動承認が必要です。",
      "破壊的テスト、総当たり、持ち出し、永続化、回避行為はブロックされます。"
    ],
    selectionSteps: [
      "検証済みの scope を読み込みます。",
      "対象タイプと実行モードでフィルタリングします。",
      "`destructive=true` のチェックを拒否します。",
      "手動承認チェックは承認がない場合拒否します。",
      "不明なツールアダプターを拒否します。",
      "scope safety 設定の rate limit と concurrency を適用します。"
    ],
    shared: {
      evidence: "artifact は `.aegis/artifacts/<target>/<scan-id>/` に保存し、正規化された結果は `.aegis/scans/<scan-id>/results.json` に保存します。リクエスト/レスポンスのメタデータは保存しますが、機密値は保存しません。",
      frontend: "console error、page error、failed network request、auth state mismatch、visual regression、browser security policy event をキャプチャします。",
      auth: "専用テストアカウントのみ使用し、本番ユーザーの認証情報を再利用しません。ロール名とセッションメタデータのみ保存し、token/cookie は redaction します。",
      finding: "すべての finding には id、project、environment、asset、target type、category、title、severity、confidence、status、redacted evidence、impact、safe reproduction、recommendation、mapped standards、timestamps を含めます。",
      report: "レポートは JSON、Markdown、HTML、SARIF で生成できます。secret redaction を適用し、ペイロードカタログ、回避手順、権限昇格手順、データ抽出手順は含めません。",
      authorization: "`aegis.scope.json` は必須です。プロジェクト、環境、有効な対象、許可 host/path、拒否 path、承認所有者、証明方式、有効期限、安全制限を記録します。本番環境は既定で passive-only です。",
      frontendGuide: "フロントエンドチェックは、ヘッダー、コンソールエラー、失敗したネットワーク概要、スクリーンショット、DOM スナップショットなどの安全なブラウザ/ランタイム証拠を収集します。",
      backend: "API チェックは安全カタログから選択されます。認証および role matrix チェックには明示的な承認と専用テストアカウントが必要です。",
      db: "データベース監査モードは読み取り専用の設定レビューに限定されます。書き込みクエリ、スキーマ変更、データダンプはポリシーでブロックされます。",
      supplyChain: "CI モードは SAST、SCA、SBOM、コンテナ、IaC、secret scanning 連携向けです。",
      npm: "パッケージには `security:init`、`security:plan`、`security:frontend`、`security:api`、`security:ci`、`security:report` スクリプトが含まれます。",
      cicd: "`aegis scope verify`、`aegis plan --mode ci`、`aegis run --mode ci` を実行し、`aegis report --format sarif` で SARIF を生成します。",
      remediation: "レポートにはスコープ、環境、スキャン設定、重要度別 finding、artifact、認証 matrix プレースホルダー、サプライチェーン準備状況、DB 監査準備状況、修正ガイドが含まれます。"
    }
  },
  "zh-CN": {
    agentTitle: "代理安全检查",
    humanTitle: "Aegis CLI 用户安全指南",
    agentIntro: "本文档为 Aegis CLI 代理和工具适配器生成，定义仅在授权范围内安全执行非破坏性安全测试的操作规则。",
    humanIntro: "Aegis CLI 帮助团队对其拥有或已获授权测试的服务运行授权、非破坏性的安全检查。",
    principles: "代理操作原则",
    scope: "范围保护规则",
    tools: "允许的工具",
    modes: "执行模式矩阵",
    catalog: "检查目录选择",
    trainingProfiles: "多样化训练配置",
    trainingProfilesIntro: "Aegis 不绑定到单一公司或行业。在保持授权范围不变的前提下，可以切换行业风险问题、优先检查类别和证据收集视角。",
    profileHeader: "| 配置 | 说明 | 安全模式 | 主要目标 |",
    attackPacks: "安全攻击仿真包",
    attackPacksIntro: "攻击包不会执行真实攻击，而是把 MITRE ATT&CK 战术转换为防御性验证项。exploit、credential theft、persistence、exfiltration 和 destructive behavior 仍然被阻止。",
    attackPackHeader: "| 包 | 说明 | 允许模式 | 战术 |",
    evidence: "证据收集",
    frontend: "前端异常捕获",
    auth: "认证测试规则",
    finding: "Finding 标准化",
    report: "报告生成",
    quickStart: "快速开始",
    authorization: "授权和范围",
    backend: "后端/API 测试",
    db: "数据库只读审计",
    supplyChain: "供应链扫描",
    docker: "Docker 用法",
    npm: "npm 用法",
    cicd: "CI/CD 用法",
    remediation: "报告和修复",
    adapterHeader: "| 适配器 | 工具 | 允许模式 |",
    modeHeader: "| 模式 | 生产安全性 | 手动批准 | 描述 |",
    agentBullets: [
      "没有 `aegis.scope.json` 时，不允许规划或执行检查。",
      "只执行 `catalog/security-checks.jsonl` 中的非破坏性检查。",
      "只使用 allowlist 中的工具适配器。",
      "LLM 输出仅用于规划和总结，不作为直接 shell 权限。",
      "在使用 LLM 和生成报告前 redaction 敏感信息。"
    ],
    scopeBullets: [
      "所有 URL 必须匹配目标的 `allowed_hosts` 和 `allowed_paths`。",
      "匹配 `denied_paths` 的请求会被阻止。",
      "生产环境默认只允许 `passive` 模式。",
      "`authenticated` 和 `db_audit` 需要明确的手动批准。",
      "破坏性测试、暴力尝试、数据外传、持久化和规避行为都会被阻止。"
    ],
    selectionSteps: [
      "加载已验证的 scope。",
      "按目标类型和执行模式过滤。",
      "拒绝 `destructive=true` 的检查。",
      "没有批准时拒绝需要手动批准的检查。",
      "拒绝未知工具适配器。",
      "应用 scope safety 中的 rate limit 和 concurrency。"
    ],
    shared: {
      evidence: "artifact 存储在 `.aegis/artifacts/<target>/<scan-id>/`，标准化结果存储在 `.aegis/scans/<scan-id>/results.json`。保存请求/响应元数据，但不保存敏感值。",
      frontend: "捕获 console error、page error、failed network request、auth state mismatch、visual regression 和 browser security policy event。",
      auth: "只使用专用测试账号，不复用生产用户凭据。只保存角色名称和 session 元数据，并 redaction token/cookie。",
      finding: "每个 finding 应包含 id、project、environment、asset、target type、category、title、severity、confidence、status、redacted evidence、impact、safe reproduction、recommendation、mapped standards 和 timestamps。",
      report: "报告可生成为 JSON、Markdown、HTML 或 SARIF。报告必须执行 secret redaction，并避免包含 payload 目录、绕过步骤、权限提升步骤或数据提取步骤。",
      authorization: "`aegis.scope.json` 是必需文件。它记录项目、环境、启用目标、允许的 host/path、拒绝的 path、授权所有者、证明方式、到期时间和安全限制。生产环境默认为 passive-only。",
      frontendGuide: "前端检查会收集安全的浏览器/运行时证据，例如 headers、console errors、失败网络摘要、screenshots 和 DOM snapshots。",
      backend: "API 检查从安全目录中选择。认证和 role matrix 检查需要明确批准和专用测试账号。",
      db: "数据库审计模式仅限只读配置审查。写查询、schema 变更和数据转储会被策略阻止。",
      supplyChain: "CI 模式用于 SAST、SCA、SBOM、容器、IaC 和 secret scanning 集成。",
      npm: "该包包含 `security:init`、`security:plan`、`security:frontend`、`security:api`、`security:ci` 和 `security:report` 脚本。",
      cicd: "运行 `aegis scope verify`、`aegis plan --mode ci`、`aegis run --mode ci`，然后用 `aegis report --format sarif` 生成 SARIF。",
      remediation: "报告包括范围、环境、扫描配置、按严重级别分组的 finding、artifact、认证 matrix 占位、供应链准备状态、DB 审计准备状态和修复建议。"
    }
  },
  "en-US": {
    agentTitle: "Agent Security Checks",
    humanTitle: "Aegis CLI Human Security Guide",
    agentIntro: "This document is generated for Aegis CLI agents and tool adapters. It defines safe operating rules for non-destructive security testing inside approved scope only.",
    humanIntro: "Aegis CLI helps teams run authorized, non-destructive security checks against services they own or are approved to test.",
    principles: "Agent Operating Principles",
    scope: "Scope Guard Rules",
    tools: "Allowed Tools",
    modes: "Execution Mode Matrix",
    catalog: "Check Catalog Selection",
    trainingProfiles: "Diverse Training Profiles",
    trainingProfilesIntro: "Aegis is not tied to one company or one industry. It keeps authorization and scope controls intact while changing industry risk questions, priority checks, and evidence focus.",
    profileHeader: "| Profile | Description | Safe modes | Target focus |",
    attackPacks: "Safe Attack Emulation Packs",
    attackPacksIntro: "Attack packs do not execute attacks. They translate MITRE ATT&CK tactics into defensive validation checks. Exploitation, credential theft, persistence, exfiltration, and destructive behavior remain blocked.",
    attackPackHeader: "| Pack | Description | Allowed modes | Tactics |",
    evidence: "Evidence Collection",
    frontend: "Frontend Anomaly Capture",
    auth: "Authenticated Testing Rules",
    finding: "Finding Normalization",
    report: "Report Generation",
    quickStart: "Quick Start",
    authorization: "Authorization and Scope",
    backend: "Backend/API Testing",
    db: "DB Read-only Audit",
    supplyChain: "Supply Chain Scan",
    docker: "Docker Usage",
    npm: "npm Usage",
    cicd: "CI/CD Usage",
    remediation: "Reports and Remediation",
    adapterHeader: "| Adapter | Tool | Allowed modes |",
    modeHeader: "| Mode | Safe for production | Manual approval | Description |",
    agentBullets: [
      "Require `aegis.scope.json` before planning or running checks.",
      "Execute only non-destructive checks from `catalog/security-checks.jsonl`.",
      "Use allowlisted tool adapters only.",
      "Treat LLM output as planning and summarization, not direct shell authority.",
      "Redact secrets before LLM use and before report generation."
    ],
    scopeBullets: [
      "Every URL must match the target `allowed_hosts` and `allowed_paths`.",
      "Any `denied_paths` match blocks the request.",
      "Production environments default to `passive` mode only.",
      "`authenticated` and `db_audit` require explicit manual approval.",
      "Destructive, brute-force, exfiltration, persistence, and evasion behaviors are blocked."
    ],
    selectionSteps: [
      "Load the verified scope.",
      "Filter by target type and execution mode.",
      "Reject checks with `destructive=true`.",
      "Reject manual-approval checks unless approval is present.",
      "Reject unknown tool adapters.",
      "Apply rate limits and concurrency from scope safety settings."
    ],
    shared: {
      evidence: "Artifacts are stored in `.aegis/artifacts/<target>/<scan-id>/`, and normalized results are stored in `.aegis/scans/<scan-id>/results.json`. Request and response metadata is stored without sensitive values.",
      frontend: "Capture console errors, page errors, failed network requests, auth state mismatches, visual regressions, and browser security policy events.",
      auth: "Use dedicated test accounts only and never reuse production user credentials. Store role names and session metadata while redacting tokens and cookies.",
      finding: "Every finding should include id, project, environment, asset, target type, category, title, severity, confidence, status, redacted evidence, impact, safe reproduction, recommendation, mapped standards, and timestamps.",
      report: "Reports may be generated as JSON, Markdown, HTML, or SARIF. Reports must redact secrets and avoid payload catalogs, bypass procedures, privilege escalation steps, or data extraction procedures.",
      authorization: "`aegis.scope.json` is mandatory. It records project, environment, enabled targets, allowlisted hosts and paths, denied paths, authorization owner, proof type, expiry, and safety limits. Production defaults to passive-only behavior.",
      frontendGuide: "Frontend checks collect safe browser/runtime evidence such as headers, console errors, failed network summaries, screenshots, and DOM snapshots.",
      backend: "API checks are selected from the safe catalog. Authenticated and role-matrix checks require explicit approval and dedicated test accounts.",
      db: "Database audit mode is limited to read-only configuration review. Write queries, schema mutation, and data dumps are blocked by policy.",
      supplyChain: "CI mode is designed for SAST, SCA, SBOM, container, IaC, and secret scanning integrations.",
      npm: "The package includes scripts such as `security:init`, `security:plan`, `security:frontend`, `security:api`, `security:ci`, and `security:report`.",
      cicd: "Run `aegis scope verify`, `aegis plan --mode ci`, `aegis run --mode ci`, then publish SARIF with `aegis report --format sarif`.",
      remediation: "Reports include scope, environment, scan configuration, findings by severity, artifacts, authenticated matrix placeholders, supply-chain readiness, DB audit readiness, and remediation guidance."
    }
  }
};

function text(locale) {
  return STRINGS[normalizeLocale(locale)] || STRINGS[DEFAULT_LOCALE];
}

function bullets(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

function numbered(items) {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

function adapterTable(locale) {
  const rows = Object.entries(TOOL_ADAPTERS)
    .map(([id, adapter]) => `| ${id} | ${adapter.tool} | ${adapter.allowedModes.join(", ")} |`)
    .join("\n");
  return `${text(locale).adapterHeader}\n| --- | --- | --- |\n${rows}`;
}

function modeTable(locale) {
  const rows = Object.entries(EXECUTION_MODES)
    .map(([id, mode]) => `| ${id} | ${mode.safeForProduction} | ${mode.requiresManualApproval} | ${mode.description} |`)
    .join("\n");
  return `${text(locale).modeHeader}\n| --- | --- | --- | --- |\n${rows}`;
}

function categoryBullets() {
  return CATEGORY_DISTRIBUTION.map((category) => `- ${category.category}: ${category.plannedChecks} checks, ${category.executionMode}, ${category.targetType}`).join("\n");
}

function quickStartBlock() {
  return `\`\`\`bash
npm install
npm run catalog:generate
npm run aegis -- profiles list
npm run aegis -- attacks list
npm run aegis -- init --profile baseline_web --attack-pack initial_access_hardening
npm run aegis -- scope verify
npm run aegis -- plan --mode passive --target frontend --profile baseline_web --attack-pack initial_access_hardening
npm run aegis -- run --target frontend --mode passive
npm run aegis -- report --format html
\`\`\``;
}

function profileTable(locale) {
  const rows = listProfiles()
    .map((profile) => `| ${profile.id} | ${profile.description} | ${profile.safe_modes.join(", ")} | ${profile.target_focus.join(", ")} |`)
    .join("\n");
  return `${text(locale).profileHeader}\n| --- | --- | --- | --- |\n${rows}`;
}

function attackPackTable(locale) {
  const rows = listAttackPacks()
    .map((pack) => `| ${pack.id} | ${pack.description} | ${pack.allowed_modes.join(", ")} | ${pack.tactics.join(", ")} |`)
    .join("\n");
  return `${text(locale).attackPackHeader}\n| --- | --- | --- | --- |\n${rows}`;
}

function dockerBlock() {
  return `\`\`\`bash
docker build -t aegis/security-cli .
docker run --rm -v "$PWD:/workspace" aegis/security-cli run --scope aegis.scope.json
\`\`\``;
}

export function renderAgentSecurityChecks(locale = DEFAULT_LOCALE) {
  const s = text(locale);
  return `# ${s.agentTitle}

${s.agentIntro}

## ${s.principles}

${bullets(s.agentBullets)}

## ${s.scope}

${bullets(s.scopeBullets)}

## ${s.tools}

${adapterTable(locale)}

## ${s.modes}

${modeTable(locale)}

## ${s.catalog}

${categoryBullets()}

${numbered(s.selectionSteps)}

## ${s.trainingProfiles}

${s.trainingProfilesIntro}

${profileTable(locale)}

## ${s.attackPacks}

${s.attackPacksIntro}

${attackPackTable(locale)}

## ${s.evidence}

${s.shared.evidence}

## ${s.frontend}

${s.shared.frontend}

## ${s.auth}

${s.shared.auth}

## ${s.finding}

${s.shared.finding}

## ${s.report}

${s.shared.report}
`;
}

export function renderHumanSecurityGuide(locale = DEFAULT_LOCALE) {
  const s = text(locale);
  return `# ${s.humanTitle}

${s.humanIntro}

## ${s.quickStart}

${quickStartBlock()}

## ${s.authorization}

${s.shared.authorization}

## ${s.trainingProfiles}

${s.trainingProfilesIntro}

${profileTable(locale)}

## ${s.attackPacks}

${s.attackPacksIntro}

${attackPackTable(locale)}

## ${s.frontend}

${s.shared.frontendGuide}

## ${s.backend}

${s.shared.backend}

## ${s.db}

${s.shared.db}

## ${s.supplyChain}

${s.shared.supplyChain}

## ${s.docker}

${dockerBlock()}

## ${s.npm}

${s.shared.npm}

## ${s.cicd}

${s.shared.cicd}

## ${s.remediation}

${s.shared.remediation}
`;
}

export async function writeDocs(cwd, options = {}) {
  const requestedDefaultLocale = normalizeLocale(options.defaultLocale || DEFAULT_LOCALE);
  const defaultLocale = requestedDefaultLocale === "all" ? DEFAULT_LOCALE : requestedDefaultLocale;
  const selectedLocales = localesFor(options.locale || "all");
  const files = [];

  await writeText(`${cwd}/docs/AGENT_SECURITY_CHECKS.md`, renderAgentSecurityChecks(defaultLocale));
  await writeText(`${cwd}/docs/HUMAN_SECURITY_GUIDE.md`, renderHumanSecurityGuide(defaultLocale));
  files.push("docs/AGENT_SECURITY_CHECKS.md", "docs/HUMAN_SECURITY_GUIDE.md");

  for (const locale of selectedLocales) {
    await writeText(`${cwd}/docs/${locale}/AGENT_SECURITY_CHECKS.md`, renderAgentSecurityChecks(locale));
    await writeText(`${cwd}/docs/${locale}/HUMAN_SECURITY_GUIDE.md`, renderHumanSecurityGuide(locale));
    files.push(`docs/${locale}/AGENT_SECURITY_CHECKS.md`, `docs/${locale}/HUMAN_SECURITY_GUIDE.md`);
  }

  return {
    default_locale: defaultLocale,
    supported_locales: SUPPORTED_LOCALES,
    files
  };
}
