import * as fs from "fs";
import * as yaml from "js-yaml";
import * as core from "@actions/core";

export interface LinkCheckerConfig {
  enabled: boolean;
  allowedDomains?: string[];
  blockedDomains?: string[];
  requireLinks?: boolean;
  minLinks?: number;
}

export function isLinkCheckerConfig(value: unknown): value is LinkCheckerConfig {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  if (typeof obj["enabled"] !== "boolean") return false;
  if (obj["allowedDomains"] !== undefined && !Array.isArray(obj["allowedDomains"])) return false;
  if (obj["blockedDomains"] !== undefined && !Array.isArray(obj["blockedDomains"])) return false;
  if (obj["minLinks"] !== undefined && typeof obj["minLinks"] !== "number") return false;
  return true;
}

export function parseLinkConfig(raw: unknown): LinkCheckerConfig {
  if (!isLinkCheckerConfig(raw)) {
    core.warning("Invalid link checker config, using defaults.");
    return { enabled: false };
  }
  return raw;
}

export function loadLinkConfig(configPath: string): LinkCheckerConfig {
  if (!fs.existsSync(configPath)) {
    return { enabled: false };
  }
  try {
    const content = fs.readFileSync(configPath, "utf8");
    const parsed = yaml.load(content);
    if (typeof parsed === "object" && parsed !== null && "linkChecker" in parsed) {
      return parseLinkConfig((parsed as Record<string, unknown>)["linkChecker"]);
    }
    return { enabled: false };
  } catch (err) {
    core.warning(`Failed to load link checker config: ${err}`);
    return { enabled: false };
  }
}
