import * as core from "@actions/core";
import * as fs from "fs";
import * as yaml from "js-yaml";

export interface DuplicationCheckerConfig {
  enabled: boolean;
  minLineLength: number;
}

const DEFAULT_CONFIG: DuplicationCheckerConfig = {
  enabled: true,
  minLineLength: 10,
};

export function isDuplicationCheckerConfig(
  obj: unknown
): obj is Partial<DuplicationCheckerConfig> {
  if (typeof obj !== "object" || obj === null) return false;
  const o = obj as Record<string, unknown>;
  if ("enabled" in o && typeof o.enabled !== "boolean") return false;
  if ("minLineLength" in o && typeof o.minLineLength !== "number") return false;
  return true;
}

export function parseDuplicationConfig(
  raw: unknown
): DuplicationCheckerConfig {
  if (!isDuplicationCheckerConfig(raw)) {
    core.warning(
      "Invalid duplication checker config; using defaults."
    );
    return DEFAULT_CONFIG;
  }
  return {
    enabled: raw.enabled ?? DEFAULT_CONFIG.enabled,
    minLineLength: raw.minLineLength ?? DEFAULT_CONFIG.minLineLength,
  };
}

export function loadDuplicationConfig(
  configPath: string
): DuplicationCheckerConfig {
  if (!fs.existsSync(configPath)) {
    return DEFAULT_CONFIG;
  }
  try {
    const raw = yaml.load(fs.readFileSync(configPath, "utf8"));
    return parseDuplicationConfig(raw);
  } catch (err) {
    core.warning(`Failed to load duplication config from ${configPath}: ${err}`);
    return DEFAULT_CONFIG;
  }
}
