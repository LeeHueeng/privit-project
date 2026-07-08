import path from "node:path";
import { writeJson } from "./io.js";
import { redact } from "./redaction.js";
import { assertUrlInScope, targetBaseUrl } from "./scope.js";

const DEFAULT_DISCOVERY = {
  enabled: true,
  max_depth: 2,
  max_pages: 30,
  request_timeout_ms: 5000,
  max_response_bytes: 524288,
  include_forms: true,
  follow_redirects: true,
  sitemap_paths: ["/robots.txt", "/sitemap.xml"],
  login_indicators: ["login", "signin", "sign-in", "auth", "session", "admin", "account"]
};

function boundedNumber(value, fallback, min, max) {
  const number = Number(value ?? fallback);
  if (!Number.isFinite(number)) {
    return fallback;
  }
  return Math.min(Math.max(Math.trunc(number), min), max);
}

function discoveryConfig(scope, target, options = {}) {
  const targetConfig = scope.targets?.[target] || {};
  const configured = { ...DEFAULT_DISCOVERY, ...(targetConfig.discovery || {}) };
  return {
    ...configured,
    enabled: options.crawl !== false && configured.enabled !== false,
    max_depth: boundedNumber(options.maxDepth, configured.max_depth, 0, 5),
    max_pages: boundedNumber(options.maxPages, configured.max_pages, 1, 200),
    request_timeout_ms: boundedNumber(configured.request_timeout_ms, DEFAULT_DISCOVERY.request_timeout_ms, 1000, 30000),
    max_response_bytes: boundedNumber(configured.max_response_bytes, DEFAULT_DISCOVERY.max_response_bytes, 65536, 2097152),
    include_forms: configured.include_forms !== false,
    follow_redirects: configured.follow_redirects !== false,
    sitemap_paths: Array.isArray(configured.sitemap_paths) && configured.sitemap_paths.length ? configured.sitemap_paths : DEFAULT_DISCOVERY.sitemap_paths,
    login_indicators:
      Array.isArray(configured.login_indicators) && configured.login_indicators.length
        ? configured.login_indicators.map((item) => String(item).toLowerCase())
        : DEFAULT_DISCOVERY.login_indicators
  };
}

function decodeAttribute(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function parseAttributes(fragment) {
  const attrs = {};
  const attrPattern = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;
  while ((match = attrPattern.exec(fragment))) {
    attrs[match[1].toLowerCase()] = decodeAttribute(match[2] ?? match[3] ?? match[4] ?? "");
  }
  return attrs;
}

function resolveCandidate(baseUrl, value) {
  if (!value || String(value).startsWith("#")) {
    return null;
  }
  const trimmed = decodeAttribute(value).trim();
  if (/^(mailto|tel|javascript|data):/i.test(trimmed)) {
    return null;
  }
  try {
    const resolved = new URL(trimmed, baseUrl);
    resolved.hash = "";
    return resolved.toString();
  } catch {
    return null;
  }
}

function pathFor(urlValue) {
  try {
    const parsed = new URL(urlValue);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return urlValue;
  }
}

function looksAuthLike(urlValue, indicators) {
  const value = pathFor(urlValue).toLowerCase();
  return indicators.some((indicator) => value.includes(indicator));
}

function compactUrl(urlValue) {
  const parsed = new URL(urlValue);
  parsed.hash = "";
  return parsed.toString();
}

async function readLimitedBody(response, maxBytes) {
  if (!response.body?.getReader) {
    const text = await response.text();
    return text.slice(0, maxBytes);
  }

  const reader = response.body.getReader();
  const chunks = [];
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    received += value.byteLength;
    if (received > maxBytes) {
      await reader.cancel();
      break;
    }
    chunks.push(Buffer.from(value));
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function fetchInScope(scope, target, urlValue, config) {
  const parsed = assertUrlInScope(scope, target, urlValue);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.request_timeout_ms);
  try {
    const response = await fetch(parsed.toString(), {
      method: "GET",
      redirect: "manual",
      signal: controller.signal,
      headers: {
        "User-Agent": "AegisCLI/0.1 passive-site-discovery",
        Accept: "text/html,application/xhtml+xml,application/xml,text/xml,text/plain;q=0.8,*/*;q=0.5"
      }
    });
    const headers = Object.fromEntries(response.headers.entries());
    const contentType = response.headers.get("content-type") || "";
    const text = await readLimitedBody(response, config.max_response_bytes);
    return {
      url: parsed.toString(),
      status: response.status,
      headers,
      contentType,
      text,
      location: response.headers.get("location")
    };
  } finally {
    clearTimeout(timeout);
  }
}

function extractLinks(html, pageUrl) {
  const links = [];
  const elementPattern = /<(a|area|link|iframe)\b[^>]*\s(?:href|src)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'<>]+))[^>]*>/gi;
  let match;
  while ((match = elementPattern.exec(html))) {
    const url = resolveCandidate(pageUrl, match[3] ?? match[4] ?? match[5]);
    if (url) {
      links.push(url);
    }
  }
  return [...new Set(links)];
}

function extractSitemapUrls(xml) {
  const urls = [];
  const locPattern = /<loc>\s*([^<]+?)\s*<\/loc>/gi;
  let match;
  while ((match = locPattern.exec(xml))) {
    urls.push(decodeAttribute(match[1]));
  }
  return [...new Set(urls)];
}

function extractRobotsSitemaps(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^sitemap:/i.test(line))
    .map((line) => line.slice(line.indexOf(":") + 1).trim())
    .filter(Boolean);
}

function extractForms(html, pageUrl, indicators) {
  const forms = [];
  const formPattern = /<form\b([^>]*)>([\s\S]*?)<\/form>/gi;
  let match;
  while ((match = formPattern.exec(html))) {
    const attrs = parseAttributes(match[1]);
    const body = match[2] || "";
    const action = resolveCandidate(pageUrl, attrs.action || pageUrl);
    const method = String(attrs.method || "get").toLowerCase();
    const controls = [];
    const controlPattern = /<(input|button|textarea|select)\b([^>]*)>/gi;
    let controlMatch;
    while ((controlMatch = controlPattern.exec(body))) {
      const controlAttrs = parseAttributes(controlMatch[2]);
      controls.push({
        tag: controlMatch[1].toLowerCase(),
        type: String(controlAttrs.type || controlMatch[1]).toLowerCase(),
        name: controlAttrs.name || "",
        autocomplete: controlAttrs.autocomplete || ""
      });
    }
    const controlText = controls.map((control) => `${control.type} ${control.name} ${control.autocomplete}`).join(" ").toLowerCase();
    const hasPassword = controls.some((control) => control.type === "password");
    const authLike = hasPassword || looksAuthLike(action || pageUrl, indicators) || /(user|email|login|password|otp|mfa|token)/i.test(controlText);
    forms.push({
      page_url: pageUrl,
      action_url: action || pageUrl,
      method,
      auth_like: authLike,
      password_field: hasPassword,
      control_count: controls.length,
      controls
    });
  }
  return forms;
}

function findingForAdminRoute(route, artifactPath) {
  return {
    target_type: "frontend",
    asset: route.url,
    category: "asset_inventory_passive_discovery",
    title: "Admin-like route discovered during passive site mapping",
    severity: "info",
    confidence: "medium",
    evidence: {
      summary: `${pathFor(route.url)} matched an admin/auth discovery indicator.`,
      artifact_paths: [artifactPath],
      redacted: true
    },
    impact: "Administrative surfaces should require authentication and role checks.",
    safe_reproduction: "Run passive site discovery and inspect the generated route map.",
    recommendation: ["Confirm this route is intentional, authenticated, and covered by authorization tests."],
    mapped_standards: ["OWASP_WSTG", "OWASP_ASVS"]
  };
}

function findingForGetLoginForm(form, artifactPath) {
  return {
    target_type: "frontend",
    asset: form.page_url,
    category: "session_cookie_token",
    title: "Login-like form uses GET",
    severity: "medium",
    confidence: "medium",
    evidence: {
      summary: "A password or authentication-like form appears to submit with GET, which can expose credentials in URLs and logs.",
      artifact_paths: [artifactPath],
      redacted: true
    },
    impact: "Credentials or tokens can leak into browser history, proxies, analytics, and server logs.",
    safe_reproduction: "Inspect the passive form inventory artifact without submitting credentials.",
    recommendation: ["Submit authentication forms with POST and avoid placing credentials or tokens in URLs."],
    mapped_standards: ["OWASP_ASVS", "CWE"]
  };
}

function findingForExternalFormAction(form, artifactPath) {
  return {
    target_type: "frontend",
    asset: form.page_url,
    category: "frontend_browser_runtime",
    title: "Form action leaves the authorized scope",
    severity: "low",
    confidence: "medium",
    evidence: {
      summary: "A discovered form posts or navigates to a URL outside the configured Aegis scope.",
      artifact_paths: [artifactPath],
      redacted: true
    },
    impact: "Unexpected cross-origin form actions can create data leakage, phishing, or broken authentication flows.",
    safe_reproduction: "Inspect the passive form inventory artifact without submitting the form.",
    recommendation: ["Verify the external action is intentional and add it to scope only when explicitly authorized."],
    mapped_standards: ["OWASP_WSTG", "OWASP_ASVS"]
  };
}

export async function discoverFrontendSite(cwd, scope, scanDir, options = {}) {
  const target = "frontend";
  const config = discoveryConfig(scope, target, options);
  if (!config.enabled) {
    return {
      discovery: null,
      findings: [],
      observation: {
        check: "frontend_site_discovery",
        status: "skipped",
        detail: "Site discovery is disabled in scope."
      }
    };
  }

  const baseUrl = compactUrl(targetBaseUrl(scope, target));
  const queue = [{ url: baseUrl, depth: 0, source: "base_url" }];
  const queued = new Set([baseUrl]);
  const visited = [];
  const links = [];
  const forms = [];
  const authSurfaces = [];
  const blockedUrls = [];
  const errors = [];
  const supporting = [];

  function enqueue(url, depth, source) {
    if (visited.length + queue.length >= config.max_pages || depth > config.max_depth) {
      return;
    }
    try {
      const normalized = compactUrl(url);
      assertUrlInScope(scope, target, normalized);
      if (!queued.has(normalized) && !visited.some((entry) => entry.url === normalized)) {
        queued.add(normalized);
        queue.push({ url: normalized, depth, source });
      }
    } catch (error) {
      blockedUrls.push({ url, source, reason: error.message });
    }
  }

  for (const sitemapPath of config.sitemap_paths) {
    const supportUrl = resolveCandidate(baseUrl, sitemapPath);
    if (!supportUrl) {
      continue;
    }
    try {
      const response = await fetchInScope(scope, target, supportUrl, config);
      supporting.push({ url: response.url, status: response.status, content_type: response.contentType });
      if (response.status >= 200 && response.status < 300) {
        const discovered = response.url.endsWith("/robots.txt") ? extractRobotsSitemaps(response.text) : extractSitemapUrls(response.text);
        for (const url of discovered) {
          enqueue(resolveCandidate(baseUrl, url) || url, 0, response.url);
        }
      }
    } catch (error) {
      supporting.push({ url: supportUrl, status: "not_available", detail: error.message });
    }
  }

  while (queue.length > 0 && visited.length < config.max_pages) {
    const next = queue.shift();
    try {
      const response = await fetchInScope(scope, target, next.url, config);
      const route = {
        url: response.url,
        path: pathFor(response.url),
        depth: next.depth,
        source: next.source,
        status: response.status,
        content_type: response.contentType
      };
      visited.push(route);

      if (response.status >= 300 && response.status < 400 && response.location && config.follow_redirects) {
        enqueue(resolveCandidate(response.url, response.location), next.depth + 1, response.url);
      }

      const isHtml = /text\/html|application\/xhtml\+xml/i.test(response.contentType) || /<html[\s>]/i.test(response.text);
      if (!isHtml || response.status < 200 || response.status >= 400) {
        continue;
      }

      const pageLinks = extractLinks(response.text, response.url);
      for (const link of pageLinks) {
        const entry = { from: response.url, to: link, path: pathFor(link) };
        try {
          assertUrlInScope(scope, target, link);
          links.push(entry);
          enqueue(link, next.depth + 1, response.url);
        } catch (error) {
          blockedUrls.push({ ...entry, reason: error.message });
        }
      }

      if (config.include_forms) {
        for (const form of extractForms(response.text, response.url, config.login_indicators)) {
          try {
            assertUrlInScope(scope, target, form.action_url);
            forms.push(form);
          } catch (error) {
            forms.push({ ...form, outside_scope: true, outside_scope_reason: error.message });
          }
        }
      }
    } catch (error) {
      errors.push({ url: next.url, source: next.source, detail: error.message });
    }
  }

  for (const route of visited) {
    if (looksAuthLike(route.url, config.login_indicators)) {
      authSurfaces.push({ type: "route", url: route.url, path: route.path, status: route.status });
    }
  }
  for (const form of forms) {
    if (form.auth_like) {
      authSurfaces.push({ type: "form", url: form.page_url, action_url: form.action_url, method: form.method, password_field: form.password_field });
    }
  }

  const discovery = redact({
    base_url: baseUrl,
    config: {
      max_depth: config.max_depth,
      max_pages: config.max_pages,
      include_forms: config.include_forms,
      follow_redirects: config.follow_redirects
    },
    supporting,
    routes: visited,
    links,
    forms,
    auth_surfaces: authSurfaces,
    blocked_urls: blockedUrls,
    errors
  });
  const artifact = path.join(scanDir, "frontend-site-map.json");
  await writeJson(artifact, discovery);
  const artifactPath = path.relative(cwd, artifact);

  const findings = [];
  const adminRoute = visited.find((route) => /(^|\/)(admin|manage|console)(\/|$)/i.test(new URL(route.url).pathname));
  if (adminRoute) {
    findings.push(findingForAdminRoute(adminRoute, artifactPath));
  }
  const getLoginForm = forms.find((form) => form.auth_like && form.method === "get");
  if (getLoginForm) {
    findings.push(findingForGetLoginForm(getLoginForm, artifactPath));
  }
  const externalForm = forms.find((form) => form.outside_scope);
  if (externalForm) {
    findings.push(findingForExternalFormAction(externalForm, artifactPath));
  }

  return {
    discovery,
    findings,
    observation: {
      check: "frontend_site_discovery",
      status: errors.length && visited.length === 0 ? "not_completed" : "completed",
      routes: visited.length,
      links: links.length,
      forms: forms.length,
      auth_surfaces: authSurfaces.length,
      blocked_urls: blockedUrls.length,
      artifact_path: artifactPath
    }
  };
}
