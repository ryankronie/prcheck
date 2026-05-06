import * as fs from 'fs';
import * as core from '@actions/core';
import * as yaml from 'js-yaml';
import { SizeCheckerConfig } from './sizeChecker';

export function isSizeCheckerConfig(obj: unknown): obj is SizeCheckerConfig {
  if (typeof obj !== 'object' || obj === null) return false;
  const config = obj as Record<string, unknown>;
  if (config.minLines !== undefined && typeof config.minLines !== 'number') return false;
  if (config.maxLines !== undefined && typeof config.maxLines !== 'number') return false;
  if (config.minChars !== undefined && typeof config.minChars !== 'number') return false;
  if (config.maxChars !== undefined && typeof config.maxChars !== 'number') return false;
  if (config.warnOnly !== undefined && typeof config.warnOnly !== 'boolean') return false;
  return true;
}

export function parseSizeConfig(raw: unknown): SizeCheckerConfig {
  if (!isSizeCheckerConfig(raw)) {
    throw new Error('Invalid size checker configuration');
  }
  return raw;
}

export function loadSizeConfig(configPath: string): SizeCheckerConfig | null {
  if (!fs.existsSync(configPath)) {
    core.debug(`Size checker config not found at ${configPath}`);
    return null;
  }
  try {
    const raw = yaml.load(fs.readFileSync(configPath, 'utf8'));
    if (typeof raw !== 'object' || raw === null) return null;
    const data = raw as Record<string, unknown>;
    if (!data.size) return null;
    return parseSizeConfig(data.size);
  } catch (err) {
    core.warning(`Failed to load size checker config: ${(err as Error).message}`);
    return null;
  }
}
