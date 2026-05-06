import * as core from "@actions/core";

export interface DuplicationResult {
  duplicates: string[];
  passed: boolean;
}

/**
 * Normalize a line for comparison: lowercase, collapse whitespace.
 */
export function normalizeLine(line: string): string {
  return line.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Extract non-empty lines from the PR body.
 */
export function extractLines(body: string): string[] {
  return body
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

/**
 * Find duplicate lines (case-insensitive, whitespace-normalized).
 * Returns the original (first occurrence) text of each duplicated line.
 */
export function findDuplicateLines(lines: string[]): string[] {
  const seen = new Map<string, string>();
  const duplicates = new Set<string>();

  for (const line of lines) {
    const key = normalizeLine(line);
    if (seen.has(key)) {
      duplicates.add(seen.get(key)!);
    } else {
      seen.set(key, line);
    }
  }

  return Array.from(duplicates);
}

/**
 * Check the PR body for duplicated lines.
 * Returns a DuplicationResult indicating whether the check passed.
 */
export function checkDuplication(
  body: string,
  minLength = 10
): DuplicationResult {
  const lines = extractLines(body).filter((l) => l.length >= minLength);
  const duplicates = findDuplicateLines(lines);
  const passed = duplicates.length === 0;

  if (!passed) {
    core.warning(
      `Duplication checker found ${duplicates.length} duplicated line(s).`
    );
  }

  return { duplicates, passed };
}
