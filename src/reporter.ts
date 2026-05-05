import * as core from '@actions/core';

export type ValidationStatus = 'pass' | 'fail' | 'warn';

export interface ValidationResult {
  rule: string;
  status: ValidationStatus;
  message: string;
}

export interface Report {
  passed: boolean;
  results: ValidationResult[];
}

export function buildReport(results: ValidationResult[]): Report {
  const passed = results.every((r) => r.status !== 'fail');
  return { passed, results };
}

export function printReport(report: Report): void {
  for (const result of report.results) {
    const prefix = `[${result.rule}]`;
    if (result.status === 'fail') {
      core.error(`${prefix} ${result.message}`);
    } else if (result.status === 'warn') {
      core.warning(`${prefix} ${result.message}`);
    } else {
      core.info(`${prefix} ✓ ${result.message}`);
    }
  }

  if (report.passed) {
    core.info('PR description validation passed.');
  } else {
    core.setFailed('PR description validation failed. See errors above.');
  }
}

export function summarizeReport(report: Report): string {
  const total = report.results.length;
  const failed = report.results.filter((r) => r.status === 'fail').length;
  const warned = report.results.filter((r) => r.status === 'warn').length;
  const passed = report.results.filter((r) => r.status === 'pass').length;
  return `Validation summary: ${passed}/${total} passed, ${failed} failed, ${warned} warnings.`;
}
