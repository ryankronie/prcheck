import * as fs from 'fs';
import * as yaml from 'js-yaml';

export interface DateFieldRule {
  label: string;
  required: boolean;
  minDate?: string;
  maxDate?: string;
}

export interface PRDateCheckerConfig {
  format?: 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD.MM.YYYY';
  fields: DateFieldRule[];
}

export function isDateFieldRule(obj: unknown): obj is DateFieldRule {
  if (typeof obj !== 'object' || obj === null) return false;
  const r = obj as Record<string, unknown>;
  return (
    typeof r['label'] === 'string' &&
    typeof r['required'] === 'boolean'
  );
}

export function isDateCheckerConfig(obj: unknown): obj is PRDateCheckerConfig {
  if (typeof obj !== 'object' || obj === null) return false;
  const c = obj as Record<string, unknown>;
  return Array.isArray(c['fields']) && c['fields'].every(isDateFieldRule);
}

export function parseDateConfig(raw: unknown): PRDateCheckerConfig {
  if (!isDateCheckerConfig(raw)) {
    throw new Error('Invalid date checker configuration');
  }
  return raw;
}

export function loadDateConfig(configPath: string): PRDateCheckerConfig | null {
  if (!fs.existsSync(configPath)) return null;
  const content = fs.readFileSync(configPath, 'utf-8');
  const raw = yaml.load(content);
  if (typeof raw !== 'object' || raw === null) return null;
  const cfg = (raw as Record<string, unknown>)['dateChecker'];
  if (!cfg) return null;
  return parseDateConfig(cfg);
}
