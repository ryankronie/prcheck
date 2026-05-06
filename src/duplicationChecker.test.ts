import {
  normalizeLine,
  extractLines,
  findDuplicateLines,
  checkDuplication,
} from "./duplicationChecker";

jest.mock("@actions/core", () => ({
  warning: jest.fn(),
}));

describe("normalizeLine", () => {
  it("lowercases and collapses whitespace", () => {
    expect(normalizeLine("  Hello   World  ")).toBe("hello world");
  });

  it("handles already normalized input", () => {
    expect(normalizeLine("hello world")).toBe("hello world");
  });
});

describe("extractLines", () => {
  it("splits on newlines and trims", () => {
    const body = "line one\n  line two  \n\nline three";
    expect(extractLines(body)).toEqual(["line one", "line two", "line three"]);
  });

  it("returns empty array for blank body", () => {
    expect(extractLines("")).toEqual([]);
  });
});

describe("findDuplicateLines", () => {
  it("returns empty array when no duplicates", () => {
    const lines = ["alpha", "beta", "gamma"];
    expect(findDuplicateLines(lines)).toEqual([]);
  });

  it("detects exact duplicate lines", () => {
    const lines = ["fix the bug", "update docs", "fix the bug"];
    const result = findDuplicateLines(lines);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe("fix the bug");
  });

  it("detects duplicates case-insensitively", () => {
    const lines = ["Fix The Bug", "update docs", "fix the bug"];
    const result = findDuplicateLines(lines);
    expect(result).toHaveLength(1);
  });

  it("detects duplicates with extra whitespace", () => {
    const lines = ["fix  the bug", "fix the  bug"];
    const result = findDuplicateLines(lines);
    expect(result).toHaveLength(1);
  });
});

describe("checkDuplication", () => {
  it("passes when no duplicates exist", () => {
    const body = "Added feature A\nFixed bug B\nUpdated docs";
    const result = checkDuplication(body);
    expect(result.passed).toBe(true);
    expect(result.duplicates).toHaveLength(0);
  });

  it("fails when duplicates are found", () => {
    const body = "Added feature A\nAdded feature A\nFixed bug B";
    const result = checkDuplication(body);
    expect(result.passed).toBe(false);
    expect(result.duplicates).toHaveLength(1);
  });

  it("ignores short lines below minLength", () => {
    const body = "ok\nok\nThis is a longer duplicated line\nThis is a longer duplicated line";
    const result = checkDuplication(body, 10);
    expect(result.passed).toBe(false);
    expect(result.duplicates).toHaveLength(1);
  });
});
