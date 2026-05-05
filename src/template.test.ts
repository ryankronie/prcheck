import { parseTemplate, PRTemplate, TemplateSection } from "./template";

const SAMPLE_TEMPLATE = `
## Description
<!-- required -->
<!-- placeholder: Describe your changes -->

## Type of Change
<!-- required -->

## Testing

## Checklist
`;

const MINIMAL_TEMPLATE = `
## Summary
`;

describe("parseTemplate", () => {
  it("parses section headings from template", () => {
    const result = parseTemplate(SAMPLE_TEMPLATE);
    expect(result.sections).toHaveLength(4);
    expect(result.sections[0].heading).toBe("Description");
    expect(result.sections[1].heading).toBe("Type of Change");
    expect(result.sections[2].heading).toBe("Testing");
    expect(result.sections[3].heading).toBe("Checklist");
  });

  it("marks required sections correctly", () => {
    const result = parseTemplate(SAMPLE_TEMPLATE);
    expect(result.sections[0].required).toBe(true);
    expect(result.sections[1].required).toBe(true);
    expect(result.sections[2].required).toBe(false);
    expect(result.sections[3].required).toBe(false);
  });

  it("extracts placeholder text", () => {
    const result = parseTemplate(SAMPLE_TEMPLATE);
    expect(result.sections[0].placeholder).toBe("Describe your changes");
    expect(result.sections[1].placeholder).toBeUndefined();
  });

  it("preserves raw template content", () => {
    const result = parseTemplate(SAMPLE_TEMPLATE);
    expect(result.raw).toBe(SAMPLE_TEMPLATE);
  });

  it("handles template with no required sections", () => {
    const result = parseTemplate(MINIMAL_TEMPLATE);
    expect(result.sections).toHaveLength(1);
    expect(result.sections[0].required).toBe(false);
  });

  it("returns empty sections for empty template", () => {
    const result = parseTemplate("");
    expect(result.sections).toHaveLength(0);
  });
});
