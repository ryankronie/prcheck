import {
  computeHash,
  extractChecksumSections,
  validateChecksums,
} from "./checksumChecker";

const sampleBody = `## Summary
This PR adds a new feature.

## Testing
All tests pass.

## Notes
No breaking changes.
`;

describe("computeHash", () => {
  it("returns a sha256 hex string", () => {
    const hash = computeHash("hello world");
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]+$/);
  });

  it("is deterministic", () => {
    expect(computeHash("same content")).toBe(computeHash("same content"));
  });

  it("differs for different content", () => {
    expect(computeHash("foo")).not.toBe(computeHash("bar"));
  });

  it("trims whitespace before hashing", () => {
    expect(computeHash("  hello  ")).toBe(computeHash("hello"));
  });

  it("returns consistent hash for empty string", () => {
    const hash = computeHash("");
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]+$/);
  });
});

describe("extractChecksumSections", () => {
  it("extracts all heading sections", () => {
    const sections = extractChecksumSections(sampleBody);
    expect(sections).toHaveLength(3);
    expect(sections.map((s) => s.heading)).toEqual(["Summary", "Testing", "Notes"]);
  });

  it("returns empty array for body with no headings", () => {
    const sections = extractChecksumSections("just plain text");
    expect(sections).toHaveLength(0);
  });

  it("each section has a non-empty hash", () => {
    const sections = extractChecksumSections(sampleBody);
    for (const s of sections) {
      expect(s.hash).toHaveLength(64);
    }
  });

  it("returns empty array for empty string", () => {
    const sections = extractChecksumSections("");
    expect(sections).toHaveLength(0);
  });
});

describe("validateChecksums", () => {
  it("returns valid when no expected checksums provided", () => {
    const result = validateChecksums(sampleBody, {});
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("passes when checksum matches", () => {
    const sections = extractChecksumSections(sampleBody);
    const expected: Record<string, string> = {};
    for (const s of sections) {
      expected[s.heading] = s.hash;
    }
    const result = validateChecksums(sampleBody, expected);
    expect(result.valid).toBe(true);
  });

  it("fails when checksum does not match", () => {
    const result = validateChecksums(sampleBody, { Summary: "wronghash" });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/checksum mismatch/);
  });

  it("fails when section is missing", () => {
    const result = validateChecksums(sampleBody, { "Missing Section": "abc123" });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/not found/);
  });

  it("is case-insensitive for heading matching", () => {
    const sections = extractChecksumSections(sampleBody);
    const summaryHash = sections.find((s) => s.heading === "Summary")!.hash;
    const result = validateChecksums(sampleBody, { summary: summaryHash });
    expect(result.valid).toBe(true);
  });

  it("accumulates multiple errors when several sections are missing", () => {
    const result = validateChecksums(sampleBody, {
      "Missing One": "abc123",
      "Missing Two": "def456",
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(2);
  });
});
