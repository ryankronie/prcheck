import * as fs from "fs";
import * as yaml from "js-yaml";
import { TitleRule } from "./titleChecker";

export interface TitleCheckerConfig {
  rules: TitleRule[];
}

export function isTitleRule(value: unknown): value is TitleRule {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj["pattern"] === "string" &&
    (obj["message"] === undefined || typeof obj["message"] === "string") &&
    (obj["flags"] === undefined || typeof obj["flags"] === "string")
  );
}

export function parseTitleConfig(raw: unknown): TitleCheckerConfig {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Title checker config must be an object");
  }

  const obj = raw as Record<string, unknown>;
  const rulesRaw = obj["rules"];

  if (!Array.isArray(rulesRaw)) {
    throw new Error("Title checker config must have a 'rules' array");
  }

  const rules: TitleRule[] = rulesRaw.map((item, index) => {
    if (!isTitleRule(item)) {
      throw new Error(
        `Invalid title rule at index ${index}: must have a 'pattern' string`
      );
    }
    return item as TitleRule;
  });

  return { rules };
}

export function loadTitleConfig(configPath: string): TitleCheckerConfig {
  if (!fs.existsSync(configPath)) {
    return { rules: [] };
  }

  const raw = yaml.load(fs.readFileSync(configPath, "utf8"));
  return parseTitleConfig(raw);
}
