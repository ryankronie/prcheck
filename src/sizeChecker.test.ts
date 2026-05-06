import { countLines, countChars, checkSize, SizeCheckerConfig } from './sizeChecker';

describe('countLines', () => {
  it('returns 0 for empty string', () => {
    expect(countLines('')).toBe(0);
  });

  it('returns 1 for single line', () => {
    expect(countLines('hello')).toBe(1);
  });

  it('counts multiple lines', () => {
    expect(countLines('line1\nline2\nline3')).toBe(3);
  });
});

describe('countChars', () => {
  it('returns 0 for empty string', () => {
    expect(countChars('')).toBe(0);
  });

  it('counts characters correctly', () => {
    expect(countChars('hello')).toBe(5);
  });
});

describe('checkSize', () => {
  const body = 'line1\nline2\nline3\nline4\nline5';

  it('passes when within bounds', () => {
    const config: SizeCheckerConfig = { minLines: 3, maxLines: 10, minChars: 5, maxChars: 200 };
    expect(checkSize(body, config)).toHaveLength(0);
  });

  it('fails when below minLines', () => {
    const config: SizeCheckerConfig = { minLines: 10 };
    const results = checkSize(body, config);
    expect(results).toHaveLength(1);
    expect(results[0].passed).toBe(false);
    expect(results[0].message).toMatch(/too short/);
  });

  it('fails when above maxLines', () => {
    const config: SizeCheckerConfig = { maxLines: 2 };
    const results = checkSize(body, config);
    expect(results).toHaveLength(1);
    expect(results[0].passed).toBe(false);
    expect(results[0].message).toMatch(/too long/);
  });

  it('fails when below minChars', () => {
    const config: SizeCheckerConfig = { minChars: 1000 };
    const results = checkSize(body, config);
    expect(results).toHaveLength(1);
    expect(results[0].details).toMatch(/characters/);
  });

  it('fails when above maxChars', () => {
    const config: SizeCheckerConfig = { maxChars: 5 };
    const results = checkSize(body, config);
    expect(results).toHaveLength(1);
    expect(results[0].details).toMatch(/characters/);
  });

  it('returns multiple failures when multiple rules violated', () => {
    const config: SizeCheckerConfig = { minLines: 100, minChars: 10000 };
    const results = checkSize(body, config);
    expect(results).toHaveLength(2);
  });
});
