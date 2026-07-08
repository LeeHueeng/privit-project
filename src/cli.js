import path from "node:path";
import { VERSION, createDefaultPolicy, createDefaultScope } from "./config.js";
import { boolFlag, numberFlag, parseArgs } from "./args.js";
import { ensureCatalog, writeCatalog } from "./catalog.js";
import { writeDocs } from "./docs.js";
import { resolveLocale, t, usage } from "./i18n.js";
import { fileExists, readJson, writeJson } from "./io.js";
import { createPlan } from "./planner.js";
import { generateReport } from "./reports.js";
import { listFindings, runPlan, showFinding } from "./runner.js";
import { verifyScope } from "./scope.js";

function print(value) {
  if (typeof value === "string") {
    console.log(value);
    return;
  }
  console.log(JSON.stringify(value, null, 2));
}

async function initProject(cwd, flags, locale) {
  const force = boolFlag(flags, "force", false);
  const projectName = flags.project || path.basename(cwd).replace(/\s+/g, "-") || "aegis-project";
  const environment = flags.environment || "local";
  const outputs = [];

  async function writeOnce(relativePath, value) {
    const absolutePath = path.resolve(cwd, relativePath);
    if (fileExists(absolutePath) && !force) {
      outputs.push({ file: relativePath, status: "exists" });
      return;
    }
    await writeJson(absolutePath, value);
    outputs.push({ file: relativePath, status: "written" });
  }

  await writeOnce("aegis.scope.json", createDefaultScope(projectName, environment));
  await writeOnce("aegis.policy.json", createDefaultPolicy());
  await writeOnce("aegis.auth.json", {
    version: "0.1.0",
    auth_profiles: [],
    note: t(locale, "authNote")
  });
  await writeOnce("aegis.plan.json", {
    version: "0.1.0",
    project: projectName,
    environment,
    mode: "passive",
    target: "frontend",
    selected_checks: []
  });
  const docs = await writeDocs(cwd, { locale: flags.lang || "all", defaultLocale: locale });
  const catalog = await ensureCatalog(cwd);
  return { initialized: true, locale, outputs, docs: docs.files, catalog: catalog.file };
}

async function addAuthRole(cwd, flags, locale) {
  const role = flags.role;
  if (!role) {
    throw new Error(t(locale, "authRoleRequired"));
  }
  const authPath = path.resolve(cwd, "aegis.auth.json");
  const auth = fileExists(authPath)
    ? await readJson(authPath)
    : { version: "0.1.0", auth_profiles: [] };
  auth.auth_profiles ||= [];
  auth.auth_profiles.push({
    role,
    created_at: new Date().toISOString(),
    storage: "external_secret_manager_or_manual_session_recording",
    redaction_required: true
  });
  await writeJson(authPath, auth);
  return { added: role, file: "aegis.auth.json" };
}

export async function main(argv = process.argv, cwd = process.cwd()) {
  const { positionals, flags } = parseArgs(argv);
  const [command, subcommand, third] = positionals;
  const locale = resolveLocale(flags);

  if (!command || command === "help" || flags.help) {
    print(usage(locale, VERSION));
    return;
  }

  if (command === "--version" || command === "version") {
    print(VERSION);
    return;
  }

  if (command === "init") {
    print(await initProject(cwd, flags, locale));
    return;
  }

  if (command === "scope" && subcommand === "verify") {
    print(await verifyScope(cwd, {
      scopeFile: flags.scope,
      mode: flags.mode || "passive",
      target: flags.target,
      url: flags.url,
      manualApproval: boolFlag(flags, "manual-approval", false)
    }));
    return;
  }

  if (command === "auth" && subcommand === "add") {
    print(await addAuthRole(cwd, flags, locale));
    return;
  }

  if (command === "catalog" && subcommand === "generate") {
    print(await writeCatalog(cwd, flags.output || "catalog/security-checks.jsonl"));
    return;
  }

  if (command === "docs" && subcommand === "generate") {
    print(await writeDocs(cwd, { locale: flags.lang || "all", defaultLocale: locale }));
    return;
  }

  if (command === "plan") {
    print(await createPlan(cwd, {
      scopeFile: flags.scope,
      catalogFile: flags.catalog,
      outputFile: flags.output,
      mode: flags.mode || "passive",
      target: flags.target,
      limit: numberFlag(flags, "limit", 100),
      manualApproval: boolFlag(flags, "manual-approval", false)
    }));
    return;
  }

  if (command === "run") {
    print(await runPlan(cwd, {
      scopeFile: flags.scope,
      planFile: flags.plan,
      mode: flags.mode || "passive",
      target: flags.target,
      limit: numberFlag(flags, "limit", 100),
      dryRun: boolFlag(flags, "dry-run", false),
      manualApproval: boolFlag(flags, "manual-approval", false),
      simulateConsoleError: boolFlag(flags, "simulate-console-error", false)
    }));
    return;
  }

  if (command === "findings" && subcommand === "list") {
    print(await listFindings(cwd));
    return;
  }

  if (command === "findings" && subcommand === "show") {
    const finding = await showFinding(cwd, third);
    if (!finding) {
      const error = new Error(`${t(locale, "findingNotFound")}: ${third}`);
      error.exitCode = 2;
      throw error;
    }
    print(finding);
    return;
  }

  if (command === "report") {
    print(await generateReport(cwd, {
      scopeFile: flags.scope,
      format: flags.format || "markdown"
    }));
    return;
  }

  throw new Error(t(locale, "unknownCommand"));
}
