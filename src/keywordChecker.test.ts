import {
  extractKeywords,
  checkRequiredKeywords,
  checkForbiddenKeywords,
  validateKeywords,
} from './keywordChecker';

describe('extractKeywords', () => {
  it('extracts lowercase words from body', () => {
    const result = extractKeywords('Hello World foo');
    expect(result).toContain('hello');
    expect(result).toContain('world');
    expect(result).toContain('foo');
  });

  it('returns empty array for empty string', () => {
    expect(extractKeywords('')).toEqual([]);
  });
});

describe('checkRequiredKeywords', () => {
  it('marks found keywords as found', () => {
    const results = checkRequiredKeywords('fixes a bug', ['fixes']);
    expect(results[0].found).toBe(true);
  });

  it('marks missing keywords as not found', () => {
    const results = checkRequiredKeywords('updated readme', ['fixes']);
    expect(results[0].found).toBe(false);
  });
});

describe('checkForbiddenKeywords', () => {
  it('marks present forbidden keywords as found', () => {
    const results = checkForbiddenKeywords('wip: do not merge', ['wip']);
    expect(results[0].found).toBe(true);
  });

  it('marks absent forbidden keywords as not found', () => {
    const results = checkForbiddenKeywords('ready to merge', ['wip']);
    expect(results[0].found).toBe(false);
  });
});

describe('validateKeywords', () => {
  it('passes when all required keywords are present', () => {
    const result = validateKeywords('fixes the bug closes issue', {
      required: ['fixes', 'closes'],
    });
    expect(result.passed).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails when a required keyword is missing', () => {
    const result = validateKeywords('updated readme', { required: ['fixes'] });
    expect(result.passed).toBe(false);
    expect(result.errors[0]).toMatch(/Required keyword missing/);
  });

  it('fails when a forbidden keyword is present', () => {
    const result = validateKeywords('wip: still working', {
      forbidden: ['wip'],
    });
    expect(result.passed).toBe(false);
    expect(result.errors[0]).toMatch(/Forbidden keyword found/);
  });

  it('passes when no forbidden keywords are present', () => {
    const result = validateKeywords('ready to merge', { forbidden: ['wip'] });
    expect(result.passed).toBe(true);
  });
});
