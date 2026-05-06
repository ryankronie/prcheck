import { KeywordCheckerConfig } from './keywordChecker.config';

export interface KeywordResult {
  keyword: string;
  found: boolean;
  required: boolean;
  forbidden: boolean;
}

export interface KeywordCheckResult {
  passed: boolean;
  results: KeywordResult[];
  errors: string[];
}

export function extractKeywords(body: string): string[] {
  return body.toLowerCase().match(/\b\w+\b/g) ?? [];
}

export function checkRequiredKeywords(
  body: string,
  required: string[]
): KeywordResult[] {
  const words = extractKeywords(body);
  return required.map((keyword) => ({
    keyword,
    found: words.includes(keyword.toLowerCase()),
    required: true,
    forbidden: false,
  }));
}

export function checkForbiddenKeywords(
  body: string,
  forbidden: string[]
): KeywordResult[] {
  const words = extractKeywords(body);
  return forbidden.map((keyword) => ({
    keyword,
    found: words.includes(keyword.toLowerCase()),
    required: false,
    forbidden: true,
  }));
}

export function validateKeywords(
  body: string,
  config: KeywordCheckerConfig
): KeywordCheckResult {
  const results: KeywordResult[] = [];
  const errors: string[] = [];

  if (config.required?.length) {
    const requiredResults = checkRequiredKeywords(body, config.required);
    results.push(...requiredResults);
    requiredResults
      .filter((r) => !r.found)
      .forEach((r) => errors.push(`Required keyword missing: "${r.keyword}"`));
  }

  if (config.forbidden?.length) {
    const forbiddenResults = checkForbiddenKeywords(body, config.forbidden);
    results.push(...forbiddenResults);
    forbiddenResults
      .filter((r) => r.found)
      .forEach((r) => errors.push(`Forbidden keyword found: "${r.keyword}"`));
  }

  return { passed: errors.length === 0, results, errors };
}
