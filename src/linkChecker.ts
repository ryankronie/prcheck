import * as core from "@actions/core";

export interface LinkCheckResult {
  url: string;
  valid: boolean;
  reason?: string;
}

export interface LinkCheckSummary {
  total: number;
  valid: number;
  invalid: number;
  results: LinkCheckResult[];
}

const URL_REGEX = /https?:\/\/[^\s\)\]\>"']+/g;

export function extractLinks(body: string): string[] {
  return Array.from(new Set(body.match(URL_REGEX) ?? []));
}

export function validateLinkFormat(url: string): LinkCheckResult {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname || parsed.hostname.length < 3) {
      return { url, valid: false, reason: "Invalid hostname" };
    }
    return { url, valid: true };
  } catch {
    return { url, valid: false, reason: "Malformed URL" };
  }
}

export function checkLinks(body: string): LinkCheckSummary {
  const links = extractLinks(body);
  const results = links.map(validateLinkFormat);
  const valid = results.filter((r) => r.valid).length;
  const invalid = results.filter((r) => !r.valid).length;

  if (invalid > 0) {
    results
      .filter((r) => !r.valid)
      .forEach((r) => core.warning(`Invalid link found: ${r.url} — ${r.reason}`));
  }

  return { total: links.length, valid, invalid, results };
}
