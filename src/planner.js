import path from "node:path";
import { loadCatalog, selectChecks } from "./catalog.js";
import { readJson, writeJson } from "./io.js";
import { getAttackPack } from "./attackPacks.js";
import { getProfile } from "./profiles.js";
import { loadScope, verifyScope } from "./scope.js";

export async function createPlan(cwd, options = {}) {
  const mode = options.mode || "passive";
  const target = options.target;
  const limit = options.limit || 100;
  const manualApproval = Boolean(options.manualApproval);
  await verifyScope(cwd, { scopeFile: options.scopeFile, mode, manualApproval, target });
  const { scope } = await loadScope(cwd, options.scopeFile);
  const profileId = options.profile || scope.training_profile?.id;
  const profile = getProfile(profileId);
  if (profileId && !profile) {
    throw new Error(`Unknown training profile: ${profileId}`);
  }
  const attackPackId = options.attackPack || scope.attack_emulation?.id;
  const attackPack = getAttackPack(attackPackId);
  if (attackPackId && !attackPack) {
    throw new Error(`Unknown attack emulation pack: ${attackPackId}`);
  }
  const catalog = await loadCatalog(cwd, options.catalogFile);
  const checks = selectChecks(catalog, {
    mode,
    target,
    includeManualApproval: manualApproval,
    limit,
    priorityCategories: [...(attackPack?.priority_categories || []), ...(profile?.priority_categories || [])]
  });

  const plan = {
    version: "0.1.0",
    project: scope.project,
    environment: scope.environment,
    mode,
    target: target || "all",
    training_profile: profile
      ? {
          id: profile.id,
          label: profile.label,
          description: profile.description,
          priority_categories: profile.priority_categories,
          evidence_focus: profile.evidence_focus,
          risk_questions: profile.risk_questions
        }
      : scope.training_profile,
    attack_emulation: attackPack
      ? {
          id: attackPack.id,
          label: attackPack.label,
          description: attackPack.description,
          tactics: attackPack.tactics,
          techniques: attackPack.techniques,
          priority_categories: attackPack.priority_categories,
          evidence_focus: attackPack.evidence_focus,
          blocked_actions: attackPack.blocked_actions
        }
      : scope.attack_emulation,
    generated_at: new Date().toISOString(),
    safety: {
      max_rps: scope.safety?.max_rps ?? 2,
      max_concurrency: scope.safety?.max_concurrency ?? 3,
      destructive_tests: false
    },
    discovery: {
      enabled: scope.targets?.frontend?.discovery?.enabled !== false,
      max_depth: scope.targets?.frontend?.discovery?.max_depth ?? 2,
      max_pages: scope.targets?.frontend?.discovery?.max_pages ?? 30,
      same_scope_only: true,
      submits_forms: false
    },
    selected_checks: checks.map((check) => ({
      id: check.id,
      title: check.title,
      category: check.category,
      target_type: check.target_type,
      execution_mode: check.execution_mode,
      tool_adapter: check.tool_adapter,
      risk_if_found: check.risk_if_found,
      evidence_types: check.evidence_types,
      requires_manual_approval: check.requires_manual_approval,
      destructive: false
    }))
  };

  await writeJson(path.resolve(cwd, options.outputFile || "aegis.plan.json"), plan);
  return plan;
}

export async function loadPlan(cwd, planFile = "aegis.plan.json") {
  return readJson(path.resolve(cwd, planFile));
}
