import { PRTemplate } from "./template";

export interface TemplateMismatch {
  section: string;
  reason: "missing" | "placeholder_unchanged";
  message: string;
}

export interface TemplateValidationResult {
  valid: boolean;
  mismatches: TemplateMismatch[];
}

export function validateAgainstTemplate(
  prBody: string,
  template: PRTemplate
): TemplateValidationResult {
  const mismatches: TemplateMismatch[] = [];

  for (const section of template.sections) {
    if (!section.required) continue;

    const sectionRegex = new RegExp(
      `#{1,3}\\s+${escapeRegex(section.heading)}[\\s\\S]*?(?=#{1,3}\\s+|$)`,
      "i"
    );
    const match = prBody.match(sectionRegex);

    if (!match) {
      mismatches.push({
        section: section.heading,
        reason: "missing",
        message: `Required section "${section.heading}" is missing from the PR description.`,
      });
      continue;
    }

    const sectionBody = match[0]
      .replace(/^#{1,3}\s+.+$/m, "")
      .trim();

    if (!sectionBody || sectionBody.length === 0) {
      mismatches.push({
        section: section.heading,
        reason: "missing",
        message: `Required section "${section.heading}" is empty.`,
      });
      continue;
    }

    if (section.placeholder && sectionBody.includes(section.placeholder)) {
      mismatches.push({
        section: section.heading,
        reason: "placeholder_unchanged",
        message: `Section "${section.heading}" still contains the placeholder text.`,
      });
    }
  }

  return {
    valid: mismatches.length === 0,
    mismatches,
  };
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
