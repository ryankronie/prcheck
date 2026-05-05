import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

export interface ValidationRule {
  name: string;
  pattern: string;
  message: string;
  required?: boolean;
}

export interface PRCheckConfig {
  template?: string;
  rules: ValidationRule[];
  minLength?: number;
  maxLength?: number;
  failOnMissingTemplate?: boolean;
}

const DEFAULT_CONFIG: PRCheckConfig = {
  rules: [],
  minLength: 50,
  failOnMissingTemplate: true,
};

export function loadConfig(configPath?: string): PRCheckConfig {
  const resolvedPath = configPath
    ? path.resolve(configPath)
    : path.resolve(process.cwd(), '.github', 'prcheck.yml');

  if (!fs.existsSync(resolvedPath)) {
    console.warn(`[prcheck] Config file not found at ${resolvedPath}. Using defaults.`);
    return DEFAULT_CONFIG;
  }

  try {
    const raw = fs.readFileSync(resolvedPath, 'utf-8');
    const parsed = yaml.load(raw) as Partial<PRCheckConfig>;
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch (err) {
    throw new Error(`[prcheck] Failed to parse config at ${resolvedPath}: ${(err as Error).message}`);
  }
}
