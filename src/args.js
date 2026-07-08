export function parseArgs(argv) {
  const tokens = argv.slice(2);
  const flags = {};
  const positionals = [];

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token.startsWith("--")) {
      positionals.push(token);
      continue;
    }

    const withoutPrefix = token.slice(2);
    const equalIndex = withoutPrefix.indexOf("=");
    if (equalIndex !== -1) {
      flags[withoutPrefix.slice(0, equalIndex)] = withoutPrefix.slice(equalIndex + 1);
      continue;
    }

    const next = tokens[index + 1];
    if (!next || next.startsWith("--")) {
      flags[withoutPrefix] = true;
      continue;
    }

    flags[withoutPrefix] = next;
    index += 1;
  }

  return { positionals, flags };
}

export function boolFlag(flags, name, fallback = false) {
  if (!(name in flags)) {
    return fallback;
  }
  const value = flags[name];
  if (value === true) {
    return true;
  }
  return !["0", "false", "no", "off"].includes(String(value).toLowerCase());
}

export function numberFlag(flags, name, fallback) {
  if (!(name in flags)) {
    return fallback;
  }
  const value = Number(flags[name]);
  if (!Number.isFinite(value)) {
    throw new Error(`--${name} must be a number`);
  }
  return value;
}

