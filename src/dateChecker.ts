import { PRDateCheckerConfig } from './dateChecker.config';

export interface DateCheckResult {
  valid: boolean;
  field: string;
  message?: string;
}

const DATE_PATTERNS: Record<string, RegExp> = {
  'YYYY-MM-DD': /\b(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/,
  'MM/DD/YYYY': /\b(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/(\d{4})\b/,
  'DD.MM.YYYY': /\b(0[1-9]|[12]\d|3[01])\.(0[1-9]|1[0-2])\.(\d{4})\b/,
};

export function extractDates(text: string, format: string): string[] {
  const pattern = DATE_PATTERNS[format];
  if (!pattern) return [];
  const matches = text.match(new RegExp(pattern.source, 'g'));
  return matches ?? [];
}

export function isDateInRange(
  dateStr: string,
  format: string,
  minDate?: string,
  maxDate?: string
): boolean {
  let normalized = dateStr;
  if (format === 'MM/DD/YYYY') {
    const [m, d, y] = dateStr.split('/');
    normalized = `${y}-${m}-${d}`;
  } else if (format === 'DD.MM.YYYY') {
    const [d, m, y] = dateStr.split('.');
    normalized = `${y}-${m}-${d}`;
  }
  const date = new Date(normalized);
  if (minDate && date < new Date(minDate)) return false;
  if (maxDate && date > new Date(maxDate)) return false;
  return true;
}

export function checkDates(
  body: string,
  config: PRDateCheckerConfig
): DateCheckResult[] {
  const results: DateCheckResult[] = [];
  const format = config.format ?? 'YYYY-MM-DD';

  for (const field of config.fields) {
    const fieldPattern = new RegExp(
      `${field.label}[^\\n]*([\\n\\r]|:)\\s*(.+)`,
      'i'
    );
    const match = body.match(fieldPattern);
    const value = match ? match[2].trim() : '';

    const dates = extractDates(value, format);

    if (field.required && dates.length === 0) {
      results.push({
        valid: false,
        field: field.label,
        message: `Missing required date in field "${field.label}" (expected format: ${format})`,
      });
      continue;
    }

    for (const d of dates) {
      const inRange = isDateInRange(d, format, field.minDate, field.maxDate);
      if (!inRange) {
        results.push({
          valid: false,
          field: field.label,
          message: `Date "${d}" in field "${field.label}" is out of allowed range`,
        });
      } else {
        results.push({ valid: true, field: field.label });
      }
    }
  }

  return results;
}
