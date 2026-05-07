import * as fs from "fs";
import * as yaml from "js-yaml";

export interface SpellCheckerConfig {
  enabled: boolean;
  customDictionary: string[];
  failOnError: boolean;
}

export function isSpellCheckerConfig(value: unknown): value is SpellCheckerConfig {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  if (typeof obj["enabled"] !== "boolean") return false;
  if (!Array.isArray(obj["customDictionary"])) return false;
  if (typeof obj["failOnError"] !== "boolean") return false;
  return true;
}

export function parseSpellConfig(raw: unknown): SpellCheckerConfig {
  if (!isSpellCheckerConfig(raw)) {
    return { enabled: true, customDictionary: [], failOnError: false };
  }
  return {
    enabled: raw.enabled,
    customDictionary: raw.customDictionary.filter((w): w is string => typeof w === "string"),
    failOnError: raw.failOnError,
  };
}

export function loadSpellConfig(configPath: string): SpellCheckerConfig {
  if (!fs.existsSync(configPath)) {
    return { enabled: true, customDictionary: [], failOnError: false };
  }
  try {
    const content = fs.readFileSync(configPath, "utf-8");
    const parsed = yaml.load(content);
    if (typeof parsed === "object" && parsed !== null) {
      const obj = parsed as Record<string, unknown>;
      return parseSpellConfig(obj["spellChecker"] ?? obj);
    }
  } catch {
    // fall through to default
  }
  return { enabled: true, customDictionary: [], failOnError: false };
}
