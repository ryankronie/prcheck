import { PRCheckConfig, ValidationRule } from './config';

export interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

function checkRule(body: string, rule: ValidationRule): string | null {
  const regex = new RegExp(rule.pattern, 'im');
  if (!regex.test(body)) {
    return rule.message || `Rule "${rule.name}" failed: pattern not matched.`;
  }
  return null;
}

export function validatePRBody(
  body: string | null | undefined,
  config: PRCheckConfig
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!body || body.trim().length === 0) {
    errors.push('PR description is empty.');
    return { passed: false, errors, warnings };
  }

  const trimmed = body.trim();

  if (config.minLength && trimmed.length < config.minLength) {
    errors.push(
      `PR description is too short (${trimmed.length} chars). Minimum is ${config.minLength}.`
    );
  }

  if (config.maxLength && trimmed.length > config.maxLength) {
    warnings.push(
      `PR description is very long (${trimmed.length} chars). Consider shortening it.`
    );
  }

  for (const rule of config.rules) {
    const error = checkRule(trimmed, rule);
    if (error) {
      if (rule.required !== false) {
        errors.push(error);
      } else {
        warnings.push(error);
      }
    }
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}
