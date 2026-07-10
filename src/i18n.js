export const SUPPORTED_LOCALES = ["ko-KR", "ja-JP", "zh-CN", "en-US"];
export const DEFAULT_LOCALE = "ko-KR";

const LOCALE_ALIASES = {
  ko: "ko-KR",
  kr: "ko-KR",
  "ko-kr": "ko-KR",
  korean: "ko-KR",
  korea: "ko-KR",
  "한국": "ko-KR",
  "한국어": "ko-KR",
  "한글": "ko-KR",
  ja: "ja-JP",
  jp: "ja-JP",
  "ja-jp": "ja-JP",
  japanese: "ja-JP",
  japan: "ja-JP",
  "일본": "ja-JP",
  "일본어": "ja-JP",
  zh: "zh-CN",
  cn: "zh-CN",
  "zh-cn": "zh-CN",
  chinese: "zh-CN",
  china: "zh-CN",
  "중국": "zh-CN",
  "중국어": "zh-CN",
  en: "en-US",
  us: "en-US",
  "en-us": "en-US",
  english: "en-US",
  "영어": "en-US"
};

const DICTIONARY = {
  "ko-KR": {
    usageTitle: "사용법",
    helpLines: [
      "aegis init [--project 이름] [--environment local] [--force] [--lang ko-KR]",
      "aegis profiles list",
      "aegis profiles show fintech_payments",
      "aegis attacks list",
      "aegis attacks show credential_access_defense",
      "aegis scope verify [--mode passive] [--target frontend] [--url https://example.com]",
      "aegis catalog generate",
      "aegis docs generate [--lang all|ko-KR|ja-JP|zh-CN|en-US]",
      "aegis plan [--mode passive] [--target frontend] [--profile saas_b2b] [--attack-pack credential_access_defense] [--limit 100] [--manual-approval]",
      "aegis run [--mode passive] [--target frontend] [--crawl true] [--max-depth 2] [--max-pages 30] [--dry-run] [--no-save-latest]",
      "aegis findings list",
      "aegis findings show FIND-2026-000001",
      "aegis report --format markdown|html|json|sarif|junit"
    ],
    authNote: "테스트 계정 메타데이터만 저장하세요. 운영 자격 증명은 저장하지 마세요.",
    authRoleRequired: "auth add에는 --role이 필요합니다.",
    findingNotFound: "Finding을 찾을 수 없습니다",
    unknownCommand: "알 수 없는 명령입니다. \"aegis help\"를 실행해 사용법을 확인하세요."
  },
  "ja-JP": {
    usageTitle: "使い方",
    helpLines: [
      "aegis init [--project 名称] [--environment local] [--force] [--lang ja-JP]",
      "aegis profiles list",
      "aegis profiles show fintech_payments",
      "aegis attacks list",
      "aegis attacks show credential_access_defense",
      "aegis scope verify [--mode passive] [--target frontend] [--url https://example.com]",
      "aegis catalog generate",
      "aegis docs generate [--lang all|ko-KR|ja-JP|zh-CN|en-US]",
      "aegis plan [--mode passive] [--target frontend] [--profile saas_b2b] [--attack-pack credential_access_defense] [--limit 100] [--manual-approval]",
      "aegis run [--mode passive] [--target frontend] [--crawl true] [--max-depth 2] [--max-pages 30] [--dry-run] [--no-save-latest]",
      "aegis findings list",
      "aegis findings show FIND-2026-000001",
      "aegis report --format markdown|html|json|sarif|junit"
    ],
    authNote: "テストアカウントのメタデータのみ保存してください。本番の認証情報は保存しないでください。",
    authRoleRequired: "auth add には --role が必要です。",
    findingNotFound: "Finding が見つかりません",
    unknownCommand: "不明なコマンドです。\"aegis help\" で使い方を確認してください。"
  },
  "zh-CN": {
    usageTitle: "用法",
    helpLines: [
      "aegis init [--project 名称] [--environment local] [--force] [--lang zh-CN]",
      "aegis profiles list",
      "aegis profiles show fintech_payments",
      "aegis attacks list",
      "aegis attacks show credential_access_defense",
      "aegis scope verify [--mode passive] [--target frontend] [--url https://example.com]",
      "aegis catalog generate",
      "aegis docs generate [--lang all|ko-KR|ja-JP|zh-CN|en-US]",
      "aegis plan [--mode passive] [--target frontend] [--profile saas_b2b] [--attack-pack credential_access_defense] [--limit 100] [--manual-approval]",
      "aegis run [--mode passive] [--target frontend] [--crawl true] [--max-depth 2] [--max-pages 30] [--dry-run] [--no-save-latest]",
      "aegis findings list",
      "aegis findings show FIND-2026-000001",
      "aegis report --format markdown|html|json|sarif|junit"
    ],
    authNote: "仅保存测试账号元数据。不要保存生产环境凭据。",
    authRoleRequired: "auth add 需要 --role。",
    findingNotFound: "未找到 Finding",
    unknownCommand: "未知命令。请运行 \"aegis help\" 查看用法。"
  },
  "en-US": {
    usageTitle: "Usage",
    helpLines: [
      "aegis init [--project name] [--environment local] [--force] [--lang en-US]",
      "aegis profiles list",
      "aegis profiles show fintech_payments",
      "aegis attacks list",
      "aegis attacks show credential_access_defense",
      "aegis scope verify [--mode passive] [--target frontend] [--url https://example.com]",
      "aegis catalog generate",
      "aegis docs generate [--lang all|ko-KR|ja-JP|zh-CN|en-US]",
      "aegis plan [--mode passive] [--target frontend] [--profile saas_b2b] [--attack-pack credential_access_defense] [--limit 100] [--manual-approval]",
      "aegis run [--mode passive] [--target frontend] [--crawl true] [--max-depth 2] [--max-pages 30] [--dry-run] [--no-save-latest]",
      "aegis findings list",
      "aegis findings show FIND-2026-000001",
      "aegis report --format markdown|html|json|sarif|junit"
    ],
    authNote: "Store test-account metadata only. Do not store production credentials.",
    authRoleRequired: "auth add requires --role",
    findingNotFound: "Finding not found",
    unknownCommand: "Unknown command. Run \"aegis help\" for usage."
  }
};

export function normalizeLocale(value, fallback = DEFAULT_LOCALE) {
  if (!value) {
    return fallback;
  }
  const key = String(value).trim();
  if (key.toLowerCase() === "all") {
    return "all";
  }
  if (SUPPORTED_LOCALES.includes(key)) {
    return key;
  }
  const normalizedKey = key.toLowerCase().replace("_", "-").split(".")[0];
  return LOCALE_ALIASES[normalizedKey] || fallback;
}

export function resolveLocale(flags = {}, env = process.env) {
  return normalizeLocale(flags.lang || flags.locale || env.AEGIS_LANG || env.LANG, DEFAULT_LOCALE);
}

export function localesFor(value) {
  const locale = normalizeLocale(value, "all");
  return locale === "all" ? SUPPORTED_LOCALES : [locale];
}

export function t(locale, key) {
  const normalized = normalizeLocale(locale);
  return DICTIONARY[normalized]?.[key] ?? DICTIONARY["en-US"][key] ?? key;
}

export function usage(locale = DEFAULT_LOCALE, version = "0.1.0") {
  const normalized = normalizeLocale(locale);
  const strings = DICTIONARY[normalized] || DICTIONARY[DEFAULT_LOCALE];
  return `Aegis CLI ${version}

${strings.usageTitle}:
  ${strings.helpLines.join("\n  ")}
`;
}
