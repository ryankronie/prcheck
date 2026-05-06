import * as crypto from "crypto";

export interface ChecksumResult {
  valid: boolean;
  errors: string[];
}

export interface ChecksumSection {
  heading: string;
  hash: string;
}

export function computeHash(content: string): string {
  return crypto.createHash("sha256").update(content.trim()).digest("hex");
}

export function extractChecksumSections(
  body: string
): ChecksumSection[] {
  const results: ChecksumSection[] = [];
  const lines = body.split("\n");
  let currentHeading = "";
  let sectionLines: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,6}\s+(.+)/);
    if (headingMatch) {
      if (currentHeading && sectionLines.length > 0) {
        const hash = computeHash(sectionLines.join("\n"));
        results.push({ heading: currentHeading, hash });
      }
      currentHeading = headingMatch[1].trim();
      sectionLines = [];
    } else {
      sectionLines.push(line);
    }
  }

  if (currentHeading && sectionLines.length > 0) {
    const hash = computeHash(sectionLines.join("\n"));
    results.push({ heading: currentHeading, hash });
  }

  return results;
}

export function validateChecksums(
  body: string,
  expectedChecksums: Record<string, string>
): ChecksumResult {
  const errors: string[] = [];

  if (Object.keys(expectedChecksums).length === 0) {
    return { valid: true, errors };
  }

  const sections = extractChecksumSections(body);
  const sectionMap = new Map<string, string>(
    sections.map((s) => [s.heading.toLowerCase(), s.hash])
  );

  for (const [heading, expectedHash] of Object.entries(expectedChecksums)) {
    const actualHash = sectionMap.get(heading.toLowerCase());
    if (!actualHash) {
      errors.push(`Section "${heading}" not found for checksum validation.`);
    } else if (actualHash !== expectedHash) {
      errors.push(
        `Section "${heading}" checksum mismatch. Expected ${expectedHash.slice(0, 8)}..., got ${actualHash.slice(0, 8)}...`
      );
    }
  }

  return { valid: errors.length === 0, errors };
}
