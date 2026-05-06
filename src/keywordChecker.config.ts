import * as core from '@actions/core';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

export interface KeywordCheckerConfig {
  required?: string[];
  forbidden?: string[];
}

export function isKeywordCheckerConfig(
  value: unknown
): value is KeywordCheckerConfig {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  if (obj.required !== undefined && !Array.isArray(obj.required)) return false;
  if (obj.forbidden !== undefined && !Array.isArray(obj.forbidden)) return false;
  return true;
}

export function parseKeywordConfig(raw: unknown): KeywordCheckerConfig {
  if (!isKeywordCheckerConfig(raw)) {
    throw new Error('Invalid keyword checker configuration');
  }
  return {
    required: (raw.required as string[] | undefined)?.map(String) ?? [],
    forbidden: (raw.forbidden as string[] | undefined)?.map(String) ?? [],
  };
}

export function loadKeywordConfig(
  configPath: string
): KeywordCheckerConfig | null {
  if (!fs.existsSync(configPath)) {
    core.debug(`Keyword config not found at ${configPath}`);
    return null;
  }
  const content = fs.readFileSync(configPath, 'utf8');
  const raw = yaml.load(content);
  return parseKeywordConfig(raw);
}
