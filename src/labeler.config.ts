import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import { LabelConfig, LabelRule } from "./labeler";

const DEFAULT_LABEL_CONFIG_PATH = ".github/pr-labels.yml";

function isLabelRule(obj: unknown): obj is LabelRule {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as LabelRule).label === "string" &&
    typeof (obj as LabelRule).pattern === "string"
  );
}

export function parseLabelConfig(raw: unknown): LabelConfig {
  if (
    typeof raw !== "object" ||
    raw === null ||
    !Array.isArray((raw as LabelConfig).rules)
  ) {
    return { rules: [] };
  }

  const rules = ((raw as LabelConfig).rules as unknown[]).filter(isLabelRule);
  return { rules };
}

export function loadLabelConfig(configPath?: string): LabelConfig {
  const filePath = configPath ?? DEFAULT_LABEL_CONFIG_PATH;
  const resolved = path.resolve(filePath);

  if (!fs.existsSync(resolved)) {
    return { rules: [] };
  }

  try {
    const content = fs.readFileSync(resolved, "utf-8");
    const parsed = yaml.load(content);
    return parseLabelConfig(parsed);
  } catch {
    return { rules: [] };
  }
}
