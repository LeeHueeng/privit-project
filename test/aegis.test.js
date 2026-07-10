import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:http";
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

function runCliAsync(cwd, args) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [binPath, ...args], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      stderr += "\nTimed out waiting for CLI process.";
    }, 10000);
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("close", (status) => {
      clearTimeout(timeout);
      resolve({ status, stdout, stderr });
    });
  });
}

async function withLocalSite(handler, callback) {
  const server = createServer(handler);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;
  try {
    return await callback(baseUrl);
  } finally {
    server.closeAllConnections?.();
    server.closeIdleConnections?.();
    await new Promise((resolve) => server.close(resolve));
  }
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

test("training profiles list and initialize diversified scope", async () => {
  const cwd = await tempWorkspace();
  const list = runCli(cwd, ["profiles", "list"]);
  assert.equal(list.status, 0, list.stderr);
  const profiles = JSON.parse(list.stdout).profiles;
  assert.ok(profiles.some((profile) => profile.id === "fintech_payments"));
  assert.ok(profiles.some((profile) => profile.id === "healthcare_privacy"));
  assert.ok(profiles.some((profile) => profile.id === "ecommerce_marketplace"));

  const init = runCli(cwd, ["init", "--profile", "healthcare_privacy"]);
  assert.equal(init.status, 0, init.stderr);
  const scope = JSON.parse(await readFile(path.join(cwd, "aegis.scope.json"), "utf8"));
  assert.equal(scope.training_profile.id, "healthcare_privacy");
  assert.ok(scope.targets.frontend.denied_paths.includes("/medical-records/export/*"));
  assert.equal(scope.safety.max_rps, 1);

  const plan = runCli(cwd, ["plan", "--mode", "passive", "--target", "frontend"]);
  assert.equal(plan.status, 0, plan.stderr);
  const output = JSON.parse(plan.stdout);
  assert.equal(output.training_profile.id, "healthcare_privacy");
  assert.ok(output.selected_checks.length > 0);
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

test("passive frontend discovery maps login routes and forms in scope", async () => {
  await withLocalSite((req, res) => {
    const url = new URL(req.url, "http://127.0.0.1");
    res.setHeader("connection", "close");
    res.setHeader("content-type", url.pathname.endsWith(".xml") ? "application/xml" : "text/html; charset=utf-8");
    if (url.pathname === "/robots.txt") {
      res.end(`User-agent: *\nSitemap: http://${req.headers.host}/sitemap.xml\n`);
      return;
    }
    if (url.pathname === "/sitemap.xml") {
      res.end(`<?xml version="1.0"?><urlset><url><loc>http://${req.headers.host}/login</loc></url></urlset>`);
      return;
    }
    if (url.pathname === "/login") {
      res.end('<form method="get" action="/sessions"><input name="email"><input type="password" name="password"></form>');
      return;
    }
    if (url.pathname === "/dashboard") {
      res.end('<a href="/admin">Admin</a>');
      return;
    }
    if (url.pathname === "/admin") {
      res.end("<h1>Admin</h1>");
      return;
    }
    res.end('<a href="/login">Login</a><a href="/dashboard">Dashboard</a><a href="https://outside.example/">Outside</a>');
  }, async (baseUrl) => {
    const cwd = await tempWorkspace();
    const scope = createDefaultScope("mapped-project", "local");
    scope.targets.frontend.base_url = baseUrl;
    scope.targets.frontend.allowed_hosts = ["127.0.0.1"];
    scope.targets.frontend.discovery.max_depth = 2;
    scope.targets.frontend.discovery.max_pages = 10;
    await writeFile(path.join(cwd, "aegis.scope.json"), `${JSON.stringify(scope, null, 2)}\n`, "utf8");

    const result = await runCliAsync(cwd, ["run", "--target", "frontend", "--mode", "passive", "--max-depth", "2", "--max-pages", "10"]);
    assert.equal(result.status, 0, result.stderr);
    const output = JSON.parse(result.stdout);
    assert.ok(output.discovery.routes.some((route) => route.path === "/login"));
    assert.ok(output.discovery.routes.some((route) => route.path === "/admin"));
    assert.ok(output.discovery.auth_surfaces.some((surface) => surface.type === "form" && surface.password_field));
    assert.ok(output.discovery.blocked_urls.some((entry) => /outside\.example/.test(entry.to)));
    assert.ok(output.findings.some((finding) => finding.title === "Login-like form uses GET"));

    const artifactPath = output.observations.find((observation) => observation.check === "frontend_site_discovery").artifact_path;
    const artifact = JSON.parse(await readFile(path.join(cwd, artifactPath), "utf8"));
    assert.equal(artifact.auth_surfaces.length >= 1, true);

    const initialFindings = JSON.parse(await readFile(path.join(cwd, ".aegis/findings.json"), "utf8"));
    await writeFile(path.join(cwd, ".aegis/findings.json"), `${JSON.stringify([...initialFindings, initialFindings[0]], null, 2)}\n`, "utf8");

    const second = await runCliAsync(cwd, ["run", "--target", "frontend", "--mode", "passive", "--max-depth", "2", "--max-pages", "10"]);
    assert.equal(second.status, 0, second.stderr);
    const storedFindings = JSON.parse(await readFile(path.join(cwd, ".aegis/findings.json"), "utf8"));
    assert.equal(storedFindings.filter((finding) => finding.title === "Login-like form uses GET").length, 1);

    const latestBeforeDryRun = JSON.parse(await readFile(path.join(cwd, ".aegis/latest-scan.json"), "utf8"));
    const dryRun = await runCliAsync(cwd, ["run", "--target", "frontend", "--mode", "passive", "--dry-run", "--no-save-latest"]);
    assert.equal(dryRun.status, 0, dryRun.stderr);
    const latestAfterDryRun = JSON.parse(await readFile(path.join(cwd, ".aegis/latest-scan.json"), "utf8"));
    assert.equal(latestAfterDryRun.scan_id, latestBeforeDryRun.scan_id);
    assert.ok(latestAfterDryRun.discovery.routes.some((route) => route.path === "/login"));
  });
});
