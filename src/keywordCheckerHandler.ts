import * as core from '@actions/core';
import { loadKeywordConfig } from './keywordChecker.config';
import { validateKeywords } from './keywordChecker';

export async function runKeywordCheck(
  body: string,
  configPath: string
): Promise<boolean> {
  const config = loadKeywordConfig(configPath);

  if (!config) {
    core.info('No keyword checker config found, skipping keyword check.');
    return true;
  }

  if (!config.required?.length && !config.forbidden?.length) {
    core.info('Keyword checker config has no rules defined, skipping.');
    return true;
  }

  const result = validateKeywords(body, config);

  if (result.errors.length > 0) {
    result.errors.forEach((err) => core.error(`[KeywordChecker] ${err}`));
  } else {
    core.info('[KeywordChecker] All keyword checks passed.');
  }

  return result.passed;
}
