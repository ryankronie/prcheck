import * as fs from "fs";
import * as yaml from "js-yaml";
import * as core from "@actions/core";

export interface MentionCheckerConfig {
  required?: string[];
  forbidden?: string[];
}

export function isMentionCheckerConfig(value: unknown): value is MentionCheckerConfig {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  if (obj.required !== undefined) {
    if (!Array.isArray(obj.required) || !obj.required.every((r) => typeof r === "string")) {
      return false;
    }
  }
  if (obj.forbidden !== undefined) {
    if (!Array.isArray(obj.forbidden) || !obj.forbidden.every((f) => typeof f === "string")) {
      return false;
    }
  }
  return true;
}

export function parseMentionConfig(raw: unknown): MentionCheckerConfig {
  if (!isMentionCheckerConfig(raw)) {
    throw new Error("Invalid mention checker configuration.");
  }
  return {
    required: raw.required ?? [],
    forbidden: raw.forbidden ?? [],
  };
}

export function loadMentionConfig(configPath: string): MentionCheckerConfig | null {
  if (!fs.existsSync(configPath)) {
    core.debug(`Mention checker config not found at ${configPath}`);
    return null;
  }
  try {
    const raw = yaml.load(fs.readFileSync(configPath, "utf8"));
    return parseMentionConfig(raw);
  } catch (err) {
    core.warning(`Failed to load mention checker config: ${(err as Error).message}`);
    return null;
  }
}
