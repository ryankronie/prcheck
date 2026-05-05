import { validatePRBody } from './validator';
import { PRCheckConfig } from './config';

const baseConfig: PRCheckConfig = {
  rules: [],
  minLength: 20,
  failOnMissingTemplate: true,
};

describe('validatePRBody', () => {
  it('fails on null body', () => {
    const result = validatePRBody(null, baseConfig);
    expect(result.passed).toBe(false);
    expect(result.errors).toContain('PR description is empty.');
  });

  it('fails on empty string', () => {
    const result = validatePRBody('   ', baseConfig);
    expect(result.passed).toBe(false);
    expect(result.errors).toContain('PR description is empty.');
  });

  it('fails when body is shorter than minLength', () => {
    const result = validatePRBody('Too short.', baseConfig);
    expect(result.passed).toBe(false);
    expect(result.errors[0]).toMatch(/too short/i);
  });

  it('passes with a valid description', () => {
    const body = 'This PR fixes the login bug by updating the auth middleware.';
    const result = validatePRBody(body, baseConfig);
    expect(result.passed).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails when a required rule pattern is missing', () => {
    const config: PRCheckConfig = {
      ...baseConfig,
      rules: [
        {
          name: 'has-checklist',
          pattern: '^- \\[[ x]\\]',
          message: 'PR must include a checklist.',
          required: true,
        },
      ],
    };
    const body = 'This PR does something important but has no checklist.';
    const result = validatePRBody(body, config);
    expect(result.passed).toBe(false);
    expect(result.errors).toContain('PR must include a checklist.');
  });

  it('adds warning for optional rule failure', () => {
    const config: PRCheckConfig = {
      ...baseConfig,
      rules: [
        {
          name: 'has-ticket',
          pattern: 'JIRA-\\d+',
          message: 'Consider linking a JIRA ticket.',
          required: false,
        },
      ],
    };
    const body = 'This PR improves performance of the data pipeline significantly.';
    const result = validatePRBody(body, config);
    expect(result.passed).toBe(true);
    expect(result.warnings).toContain('Consider linking a JIRA ticket.');
  });
});
