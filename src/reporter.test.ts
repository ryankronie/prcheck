import { buildReport, printReport, summarizeReport, ValidationResult } from './reporter';

jest.mock('@actions/core', () => ({
  error: jest.fn(),
  warning: jest.fn(),
  info: jest.fn(),
  setFailed: jest.fn(),
}));

import * as core from '@actions/core';

const pass: ValidationResult = { rule: 'has-description', status: 'pass', message: 'Description found' };
const fail: ValidationResult = { rule: 'min-length', status: 'fail', message: 'Too short' };
const warn: ValidationResult = { rule: 'checklist', status: 'warn', message: 'Checklist incomplete' };

describe('buildReport', () => {
  it('marks report as passed when all results are pass or warn', () => {
    const report = buildReport([pass, warn]);
    expect(report.passed).toBe(true);
  });

  it('marks report as failed when any result is fail', () => {
    const report = buildReport([pass, fail]);
    expect(report.passed).toBe(false);
  });

  it('returns all results in the report', () => {
    const report = buildReport([pass, fail, warn]);
    expect(report.results).toHaveLength(3);
  });
});

describe('summarizeReport', () => {
  it('returns correct summary string', () => {
    const report = buildReport([pass, fail, warn]);
    const summary = summarizeReport(report);
    expect(summary).toBe('Validation summary: 1/3 passed, 1 failed, 1 warnings.');
  });
});

describe('printReport', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls core.error for failed results', () => {
    printReport(buildReport([fail]));
    expect(core.error).toHaveBeenCalledWith(expect.stringContaining('Too short'));
  });

  it('calls core.warning for warn results', () => {
    printReport(buildReport([warn]));
    expect(core.warning).toHaveBeenCalledWith(expect.stringContaining('Checklist incomplete'));
  });

  it('calls core.setFailed when report has failures', () => {
    printReport(buildReport([fail]));
    expect(core.setFailed).toHaveBeenCalled();
  });

  it('does not call core.setFailed when report passes', () => {
    printReport(buildReport([pass]));
    expect(core.setFailed).not.toHaveBeenCalled();
  });
});
