import * as fs from "fs";
import * as path from "path";
import * as core from "@actions/core";

export interface PRTemplate {
  sections: TemplateSection[];
  raw: string;
}

export interface TemplateSection {
  heading: string;
  required: boolean;
  placeholder?: string;
}

const SECTION_REGEX = /^#{1,3}\s+(.+)$/gm;
const REQUIRED_MARKER = "<!-- required -->";
const PLACEHOLDER_REGEX = /<!--\s*placeholder:\s*(.+?)\s*-->/;

export function parseTemplate(templateContent: string): PRTemplate {
  const sections: TemplateSection[] = [];
  const lines = templateContent.split("\n");

  let currentHeading: string | null = null;
  let currentRequired = false;
  let currentPlaceholder: string | undefined;

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,3}\s+(.+)$/);
    if (headingMatch) {
      if (currentHeading !== null) {
        sections.push({
          heading: currentHeading,
          required: currentRequired,
          placeholder: currentPlaceholder,
        });
      }
      currentHeading = headingMatch[1].trim();
      currentRequired = false;
      currentPlaceholder = undefined;
    } else if (line.includes(REQUIRED_MARKER)) {
      currentRequired = true;
    } else {
      const placeholderMatch = line.match(PLACEHOLDER_REGEX);
      if (placeholderMatch) {
        currentPlaceholder = placeholderMatch[1];
      }
    }
  }

  if (currentHeading !== null) {
    sections.push({
      heading: currentHeading,
      required: currentRequired,
      placeholder: currentPlaceholder,
    });
  }

  return { sections, raw: templateContent };
}

export function loadTemplate(templatePath: string): PRTemplate | null {
  const resolved = path.resolve(templatePath);
  if (!fs.existsSync(resolved)) {
    core.warning(`Template file not found: ${resolved}`);
    return null;
  }
  const content = fs.readFileSync(resolved, "utf-8");
  return parseTemplate(content);
}
