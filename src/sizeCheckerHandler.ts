import * as core from '@actions/core';
import { checkSize, SizeCheckerConfig } from './sizeChecker';

export interface SizeCheckSummary {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

export function runSizeCheck(
  body: string,
  config: SizeCheckerConfig | null
): SizeCheckSummary {
  if (!config) {
    return { passed: true, errors: [], warnings: [] };
  }

  const results = checkSize(body, config);
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const result of results) {
    const msg = result.details ? `${result.message}: ${result.details}` : result.message;
    if (config.warnOnly) {
      warnings.push(msg);
      core.warning(msg);
    } else {
      errors.push(msg);
      core.error(msg);
    }
  }

  const passed = errors.length === 0;

  if (passed && results.length === 0) {
    core.info('Size check passed');
  }

  return { passed, errors, warnings };
}
