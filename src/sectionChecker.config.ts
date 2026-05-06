/**
 * sectionChecker.config.ts
 * Loads and validates the required-sections configuration.
 */

import * as fs from "fs";
import * as yaml from "js-yaml";

export interface SectionCheckerConfig {
  requiredSections: string[];
  allowEmptySections: boolean;
}

interface RawSectionConfig {
  required_sections?: unknown;
  allow_empty_sections?: unknown;
}

export function isSectionCheckerConfig(
  raw: unknown
): raw is RawSectionConfig {
  if (typeof raw !== "object" || raw === null) return false;
  const obj = raw as Record<string, unknown>;
  if (obj["required_sections"] !== undefined) {
    if (
      !Array.isArray(obj["required_sections"]) ||
      !obj["required_sections"].every((s) => typeof s === "string")
    ) {
      return false;
    }
  }
  return true;
}

export function parseSectionConfig(raw: unknown): SectionCheckerConfig {
  if (!isSectionCheckerConfig(raw)) {
    throw new Error("Invalid section checker configuration.");
  }

  return {
    requiredSections: Array.isArray(raw.required_sections)
      ? (raw.required_sections as string[])
      : [],
    allowEmptySections:
      typeof raw.allow_empty_sections === "boolean"
        ? raw.allow_empty_sections
        : false,
  };
}

export function loadSectionConfig(filePath: string): SectionCheckerConfig {
  if (!fs.existsSync(filePath)) {
    return { requiredSections: [], allowEmptySections: false };
  }
  const raw = yaml.load(fs.readFileSync(filePath, "utf8"));
  return parseSectionConfig(raw);
}
