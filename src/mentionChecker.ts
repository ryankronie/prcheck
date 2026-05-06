import * as core from "@actions/core";

export interface MentionCheckResult {
  mention: string;
  found: boolean;
  required: boolean;
}

export function extractMentions(body: string): string[] {
  const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
  const matches: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = mentionRegex.exec(body)) !== null) {
    matches.push(match[1]);
  }
  return [...new Set(matches)];
}

export function checkRequiredMentions(
  body: string,
  required: string[]
): MentionCheckResult[] {
  const found = extractMentions(body);
  return required.map((mention) => ({
    mention,
    found: found.includes(mention),
    required: true,
  }));
}

export function checkForbiddenMentions(
  body: string,
  forbidden: string[]
): MentionCheckResult[] {
  const found = extractMentions(body);
  return forbidden.map((mention) => ({
    mention,
    found: found.includes(mention),
    required: false,
  }));
}

export function validateMentions(
  body: string,
  required: string[],
  forbidden: string[]
): { passed: boolean; errors: string[] } {
  const errors: string[] = [];

  const requiredResults = checkRequiredMentions(body, required);
  for (const result of requiredResults) {
    if (!result.found) {
      errors.push(`Required mention @${result.mention} is missing from PR description.`);
    }
  }

  const forbiddenResults = checkForbiddenMentions(body, forbidden);
  for (const result of forbiddenResults) {
    if (result.found) {
      errors.push(`Forbidden mention @${result.mention} found in PR description.`);
    }
  }

  return { passed: errors.length === 0, errors };
}
