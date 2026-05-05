import { matchLabels, LabelRule } from "./labeler";

describe("matchLabels", () => {
  const rules: LabelRule[] = [
    { label: "bug", pattern: "## Type.*bug" },
    { label: "feature", pattern: "## Type.*feature" },
    { label: "breaking-change", pattern: "breaking change" },
    { label: "docs", pattern: "## Type.*docs" },
  ];

  it("returns matching label when pattern is found", () => {
    const body = "## Type\nbug\n\nSome description";
    const result = matchLabels(body, rules);
    expect(result).toContain("bug");
  });

  it("returns multiple labels when multiple patterns match", () => {
    const body = "## Type\nfeature\n\nThis is a breaking change";
    const result = matchLabels(body, rules);
    expect(result).toContain("feature");
    expect(result).toContain("breaking-change");
  });

  it("returns empty array when no patterns match", () => {
    const body = "Just a plain description with no keywords";
    const result = matchLabels(body, rules);
    expect(result).toHaveLength(0);
  });

  it("is case-insensitive", () => {
    const body = "## Type\nBUG\n";
    const result = matchLabels(body, rules);
    expect(result).toContain("bug");
  });

  it("returns empty array for empty rules", () => {
    const body = "## Type\nbug";
    const result = matchLabels(body, []);
    expect(result).toHaveLength(0);
  });

  it("returns empty array for empty body", () => {
    const result = matchLabels("", rules);
    expect(result).toHaveLength(0);
  });
});
