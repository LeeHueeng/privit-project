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
