import * as core from '@actions/core';

export interface SizeResult {
  passed: boolean;
  message: string;
  details?: string;
}

export interface SizeCheckerConfig {
  minLines?: number;
  maxLines?: number;
  minChars?: number;
  maxChars?: number;
  warnOnly?: boolean;
}

export function countLines(body: string): number {
  if (!body || body.trim() === '') return 0;
  return body.split('\n').length;
}

export function countChars(body: string): number {
  return body ? body.length : 0;
}

export function checkSize(body: string, config: SizeCheckerConfig): SizeResult[] {
  const results: SizeResult[] = [];
  const lines = countLines(body);
  const chars = countChars(body);

  if (config.minLines !== undefined && lines < config.minLines) {
    results.push({
      passed: false,
      message: `PR description too short`,
      details: `Expected at least ${config.minLines} lines, got ${lines}`,
    });
  }

  if (config.maxLines !== undefined && lines > config.maxLines) {
    results.push({
      passed: false,
      message: `PR description too long`,
      details: `Expected at most ${config.maxLines} lines, got ${lines}`,
    });
  }

  if (config.minChars !== undefined && chars < config.minChars) {
    results.push({
      passed: false,
      message: `PR description too short`,
      details: `Expected at least ${config.minChars} characters, got ${chars}`,
    });
  }

  if (config.maxChars !== undefined && chars > config.maxChars) {
    results.push({
      passed: false,
      message: `PR description too long`,
      details: `Expected at most ${config.maxChars} characters, got ${chars}`,
    });
  }

  return results;
}
