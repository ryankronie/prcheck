/**
 * sectionChecker.ts
 * Checks that required sections (headings) are present in a PR body.
 */

export interface SectionResult {
  section: string;
  found: boolean;
  empty: boolean;
}

/**
 * Parses markdown headings from a PR body.
 */
export function extractHeadings(body: string): string[] {
  const lines = body.split(/\r?\n/);
  return lines
    .filter((line) => /^#{1,6}\s+/.test(line))
    .map((line) => line.replace(/^#{1,6}\s+/, "").trim().toLowerCase());
}

/**
 * Returns the content beneath a given heading, up to the next heading.
 */
export function getSectionContent(body: string, heading: string): string {
  const lines = body.split(/\r?\n/);
  let capturing = false;
  const content: string[] = [];

  for (const line of lines) {
    if (/^#{1,6}\s+/.test(line)) {
      const current = line.replace(/^#{1,6}\s+/, "").trim().toLowerCase();
      if (current === heading.toLowerCase()) {
        capturing = true;
        continue;
      } else if (capturing) {
        break;
      }
    } else if (capturing) {
      content.push(line);
    }
  }

  return content.join("\n").trim();
}

/**
 * Checks whether each required section exists and has non-empty content.
 */
export function checkRequiredSections(
  body: string,
  requiredSections: string[]
): SectionResult[] {
  const headings = extractHeadings(body);

  return requiredSections.map((section) => {
    const found = headings.includes(section.toLowerCase());
    const content = found ? getSectionContent(body, section) : "";
    const empty = content.replace(/<!--.*?-->/gs, "").trim() === "";
    return { section, found, empty };
  });
}
