import { isKeywordCheckerConfig, parseKeywordConfig } from './keywordChecker.config';

describe('isKeywordCheckerConfig', () => {
  it('returns true for valid config with required and forbidden', () => {
    expect(
      isKeywordCheckerConfig({ required: ['fixes'], forbidden: ['wip'] })
    ).toBe(true);
  });

  it('returns true for empty config object', () => {
    expect(isKeywordCheckerConfig({})).toBe(true);
  });

  it('returns false for non-object values', () => {
    expect(isKeywordCheckerConfig(null)).toBe(false);
    expect(isKeywordCheckerConfig('string')).toBe(false);
    expect(isKeywordCheckerConfig(42)).toBe(false);
  });

  it('returns false when required is not an array', () => {
    expect(isKeywordCheckerConfig({ required: 'fixes' })).toBe(false);
  });

  it('returns false when forbidden is not an array', () => {
    expect(isKeywordCheckerConfig({ forbidden: 'wip' })).toBe(false);
  });
});

describe('parseKeywordConfig', () => {
  it('parses valid config correctly', () => {
    const config = parseKeywordConfig({
      required: ['fixes'],
      forbidden: ['wip'],
    });
    expect(config.required).toEqual(['fixes']);
    expect(config.forbidden).toEqual(['wip']);
  });

  it('defaults to empty arrays when fields are absent', () => {
    const config = parseKeywordConfig({});
    expect(config.required).toEqual([]);
    expect(config.forbidden).toEqual([]);
  });

  it('throws on invalid config', () => {
    expect(() => parseKeywordConfig(null)).toThrow(
      'Invalid keyword checker configuration'
    );
  });
});
