import { checkTitleRule, validatePRTitle } from "./titleChecker";
import { parseTitleConfig } from "./titleChecker.config";

describe("checkTitleRule", () => {
  it("returns passed=true when title matches pattern", () => {
    const result = checkTitleRule("feat: add login page", {
      pattern: "^(feat|fix|chore|docs):",
    });
    expect(result.passed).toBe(true);
  });

  it("returns passed=false when title does not match pattern", () => {
    const result = checkTitleRule("add login page", {
      pattern: "^(feat|fix|chore|docs):",
      message: "Must follow conventional commits",
    });
    expect(result.passed).toBe(false);
    expect(result.message).toBe("Must follow conventional commits");
  });

  it("uses default message when none provided", () => {
    const result = checkTitleRule("bad title", { pattern: "^feat:" });
    expect(result.message).toContain("^feat:");
  });

  it("respects custom regex flags", () => {
    const result = checkTitleRule("FEAT: something", {
      pattern: "^feat:",
      flags: "i",
    });
    expect(result.passed).toBe(true);
  });
});

describe("validatePRTitle", () => {
  it("returns failure for empty title", () => {
    const results = validatePRTitle("", [{ pattern: "^feat:" }]);
    expect(results).toHaveLength(1);
    expect(results[0].passed).toBe(false);
    expect(results[0].message).toMatch(/empty/);
  });

  it("validates all rules and returns results", () => {
    const results = validatePRTitle("feat: great change", [
      { pattern: "^feat:" },
      { pattern: "\\w{4,}" },
    ]);
    expect(results).toHaveLength(2);
    expect(results.every((r) => r.passed)).toBe(true);
  });
});

describe("parseTitleConfig", () => {
  it("parses valid config", () => {
    const config = parseTitleConfig({
      rules: [{ pattern: "^feat:", message: "Use conventional commits" }],
    });
    expect(config.rules).toHaveLength(1);
    expect(config.rules[0].pattern).toBe("^feat:");
  });

  it("throws if rules is missing", () => {
    expect(() => parseTitleConfig({ notRules: [] })).toThrow();
  });

  it("throws if a rule has no pattern", () => {
    expect(() =>
      parseTitleConfig({ rules: [{ message: "oops" }] })
    ).toThrow();
  });
});
