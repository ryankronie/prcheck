import {
  extractHeadings,
  getSectionContent,
  checkRequiredSections,
} from "./sectionChecker";

describe("extractHeadings", () => {
  it("extracts all markdown headings", () => {
    const body = "## Summary\nSome text\n### Details\nMore text\n## Testing";
    expect(extractHeadings(body)).toEqual(["summary", "details", "testing"]);
  });

  it("returns empty array when no headings", () => {
    expect(extractHeadings("just some text")).toEqual([]);
  });
});

describe("getSectionContent", () => {
  const body = [
    "## Summary",
    "This is the summary.",
    "",
    "## Testing",
    "Tested manually.",
  ].join("\n");

  it("returns content under a heading", () => {
    expect(getSectionContent(body, "Summary")).toBe("This is the summary.");
  });

  it("returns content only up to the next heading", () => {
    expect(getSectionContent(body, "Testing")).toBe("Tested manually.");
  });

  it("returns empty string for missing heading", () => {
    expect(getSectionContent(body, "Nonexistent")).toBe("");
  });
});

describe("checkRequiredSections", () => {
  const body = [
    "## Summary",
    "Added a new feature.",
    "## Testing",
    "<!-- describe tests here -->",
    "## Empty Section",
    "",
  ].join("\n");

  it("marks present and non-empty section correctly", () => {
    const results = checkRequiredSections(body, ["Summary"]);
    expect(results[0]).toEqual({ section: "Summary", found: true, empty: false });
  });

  it("marks section with only HTML comment as empty", () => {
    const results = checkRequiredSections(body, ["Testing"]);
    expect(results[0].found).toBe(true);
    expect(results[0].empty).toBe(true);
  });

  it("marks missing section as not found", () => {
    const results = checkRequiredSections(body, ["Motivation"]);
    expect(results[0]).toEqual({ section: "Motivation", found: false, empty: true });
  });

  it("handles multiple required sections", () => {
    const results = checkRequiredSections(body, ["Summary", "Motivation"]);
    expect(results).toHaveLength(2);
    expect(results[0].found).toBe(true);
    expect(results[1].found).toBe(false);
  });
});
