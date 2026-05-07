import { checkSpelling, extractWords, SpellCheckResult } from "./spellChecker";
import { parseSpellConfig, isSpellCheckerConfig } from "./spellChecker.config";

describe("extractWords", () => {
  it("extracts words with line and column positions", () => {
    const words = extractWords("hello world\nfoo bar");
    expect(words).toContainEqual({ word: "hello", line: 1, column: 1 });
    expect(words).toContainEqual({ word: "world", line: 1, column: 7 });
    expect(words).toContainEqual({ word: "foo", line: 2, column: 1 });
    expect(words).toContainEqual({ word: "bar", line: 2, column: 5 });
  });

  it("ignores non-alphabetic tokens", () => {
    const words = extractWords("123 !@# test");
    expect(words.map((w) => w.word)).toEqual(["test"]);
  });
});

describe("checkSpelling", () => {
  it("detects common misspellings", () => {
    const results = checkSpelling("This is teh recieve pattern");
    expect(results.find((r) => r.word === "teh")).toBeDefined();
    expect(results.find((r) => r.word === "recieve")).toBeDefined();
  });

  it("returns suggestion for misspelled word", () => {
    const results = checkSpelling("seperate concerns");
    const hit = results.find((r) => r.word === "seperate");
    expect(hit?.suggestion).toBe("separate");
  });

  it("skips words in custom dictionary", () => {
    const results = checkSpelling("teh custom word", ["teh"]);
    expect(results.find((r) => r.word === "teh")).toBeUndefined();
  });

  it("returns empty array for correct text", () => {
    const results = checkSpelling("Everything looks correct here");
    expect(results).toHaveLength(0);
  });
});

describe("parseSpellConfig", () => {
  it("returns defaults for invalid config", () => {
    const config = parseSpellConfig(null);
    expect(config.enabled).toBe(true);
    expect(config.customDictionary).toEqual([]);
    expect(config.failOnError).toBe(false);
  });

  it("parses valid config", () => {
    const raw = { enabled: false, customDictionary: ["prcheck"], failOnError: true };
    const config = parseSpellConfig(raw);
    expect(config.enabled).toBe(false);
    expect(config.customDictionary).toEqual(["prcheck"]);
    expect(config.failOnError).toBe(true);
  });
});

describe("isSpellCheckerConfig", () => {
  it("returns true for valid config shape", () => {
    expect(isSpellCheckerConfig({ enabled: true, customDictionary: [], failOnError: false })).toBe(true);
  });

  it("returns false for missing fields", () => {
    expect(isSpellCheckerConfig({ enabled: true })).toBe(false);
  });
});
