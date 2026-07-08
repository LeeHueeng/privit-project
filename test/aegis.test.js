import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { generateCatalogEntries } from "../src/catalog.js";
import { createDefaultScope } from "../src/config.js";
import { redact } from "../src/redaction.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const binPath = path.join(repoRoot, "bin/aegis.js");

async function tempWorkspace() {
  return mkdtemp(path.join(tmpdir(), "aegis-test-"));
}

function runCli(cwd, args) {
  return spawnSync(process.execPath, [binPath, ...args], {
    cwd,
    encoding: "utf8"
  });
}

test("run fails when scope file is missing", async () => {
  const cwd = await tempWorkspace();
  const result = runCli(cwd, ["run"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /scope file is required/i);
});

test("scope verify blocks hosts outside allowed_hosts", async () => {
  const cwd = await tempWorkspace();
  const init = runCli(cwd, ["init"]);
  assert.equal(init.status, 0, init.stderr);

  const result = runCli(cwd, ["scope", "verify", "--url", "https://evil.example/"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /outside allowed_hosts/i);
});

test("production environment blocks active modes by default", async () => {
  const cwd = await tempWorkspace();
  const scope = createDefaultScope("prod-project", "production");
  await writeFile(path.join(cwd, "aegis.scope.json"), `${JSON.stringify(scope, null, 2)}\n`, "utf8");

  const result = runCli(cwd, ["plan", "--mode", "safe_active"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Production environment only allows passive mode/i);
});

test("catalog contains at least 2000 non-destructive checks", () => {
  const entries = generateCatalogEntries();
  assert.ok(entries.length >= 2000);
  assert.equal(entries.every((entry) => entry.destructive === false), true);
});

test("redaction masks headers, tokens, and emails", () => {
  const value = redact({
    Authorization: "Bearer secret-token",
    nested: {
      url: "https://example.com?access_token=abc123",
      owner: "security@example.com"
    }
  });

  assert.equal(value.Authorization, "[REDACTED]");
  assert.match(value.nested.url, /access_token=\[REDACTED\]/);
  assert.equal(value.nested.owner, "[REDACTED_EMAIL]");
});

test("help supports Korean, Japanese, Chinese, and English", async () => {
  const cwd = await tempWorkspace();
  const samples = [
    [["help", "--lang", "ko-KR"], /사용법/],
    [["help", "--lang", "ja-JP"], /使い方/],
    [["help", "--lang", "zh-CN"], /用法/],
    [["help", "--lang", "en-US"], /Usage/]
  ];

  for (const [args, expected] of samples) {
    const result = runCli(cwd, args);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, expected);
  }
});

test("version flag prints the CLI version", async () => {
  const cwd = await tempWorkspace();
  const result = runCli(cwd, ["--version"]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), "0.1.0");
});

test("docs generate writes localized guides", async () => {
  const cwd = await tempWorkspace();
  const result = runCli(cwd, ["docs", "generate", "--lang", "all"]);
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.deepEqual(output.supported_locales, ["ko-KR", "ja-JP", "zh-CN", "en-US"]);

  const files = [
    ["docs/ko-KR/HUMAN_SECURITY_GUIDE.md", /사용자 보안 가이드/],
    ["docs/ja-JP/HUMAN_SECURITY_GUIDE.md", /ユーザーセキュリティガイド/],
    ["docs/zh-CN/HUMAN_SECURITY_GUIDE.md", /用户安全指南/],
    ["docs/en-US/HUMAN_SECURITY_GUIDE.md", /Human Security Guide/]
  ];

  for (const [file, expected] of files) {
    assert.match(await readFile(path.join(cwd, file), "utf8"), expected);
  }
});

test("simulated frontend console error stores log and screenshot artifacts", async () => {
  const cwd = await tempWorkspace();
  const init = runCli(cwd, ["init"]);
  assert.equal(init.status, 0, init.stderr);

  const result = runCli(cwd, ["run", "--target", "frontend", "--mode", "passive", "--dry-run", "--simulate-console-error"]);
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.findings.length, 1);
  const logPath = path.join(cwd, output.findings[0].evidence.artifact_paths[0]);
  const pngPath = path.join(cwd, output.findings[0].evidence.artifact_paths[1]);
  assert.match(await readFile(logPath, "utf8"), /Simulated console error/);
  assert.ok((await readFile(pngPath)).length > 0);
});

test("html report renders dashboard sections", async () => {
  const cwd = await tempWorkspace();
  const init = runCli(cwd, ["init"]);
  assert.equal(init.status, 0, init.stderr);

  const run = runCli(cwd, ["run", "--target", "frontend", "--mode", "passive", "--dry-run", "--simulate-console-error"]);
  assert.equal(run.status, 0, run.stderr);

  const report = runCli(cwd, ["report", "--format", "html"]);
  assert.equal(report.status, 0, report.stderr);
  const output = JSON.parse(report.stdout);
  const html = await readFile(output.file, "utf8");
  assert.match(html, /Finding severity summary/);
  assert.match(html, /Scope and Authorization/);
  assert.match(html, /Recommended Fixes/);
});
