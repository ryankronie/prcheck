import { isSizeCheckerConfig, parseSizeConfig } from './sizeChecker.config';

describe('isSizeCheckerConfig', () => {
  it('returns true for valid config', () => {
    expect(isSizeCheckerConfig({ minLines: 5, maxLines: 100 })).toBe(true);
  });

  it('returns true for empty object', () => {
    expect(isSizeCheckerConfig({})).toBe(true);
  });

  it('returns false for null', () => {
    expect(isSizeCheckerConfig(null)).toBe(false);
  });

  it('returns false when minLines is not a number', () => {
    expect(isSizeCheckerConfig({ minLines: 'five' })).toBe(false);
  });

  it('returns false when warnOnly is not a boolean', () => {
    expect(isSizeCheckerConfig({ warnOnly: 'yes' })).toBe(false);
  });

  it('returns true for full valid config', () => {
    const config = { minLines: 3, maxLines: 50, minChars: 20, maxChars: 5000, warnOnly: true };
    expect(isSizeCheckerConfig(config)).toBe(true);
  });
});

describe('parseSizeConfig', () => {
  it('returns config when valid', () => {
    const input = { minLines: 5 };
    expect(parseSizeConfig(input)).toEqual(input);
  });

  it('throws when config is invalid', () => {
    expect(() => parseSizeConfig({ minLines: 'bad' })).toThrow('Invalid size checker configuration');
  });
});
