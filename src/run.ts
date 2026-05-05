import * as core from '@actions/core';
import * as github from '@actions/github';
import { loadConfig } from './config';
import { loadTemplate, parseTemplate } from './template';
import { validateAgainstTemplate } from './templateValidator';
import { validatePRBody } from './validator';
import { buildReport, printReport, summarizeReport, ValidationResult } from './reporter';

export async function run(): Promise<void> {
  try {
    const config = loadConfig();
    const pr = github.context.payload.pull_request;

    if (!pr) {
      core.setFailed('This action must be triggered by a pull_request event.');
      return;
    }

    const prBody: string = pr.body ?? '';
    const results: ValidationResult[] = [];

    if (config.templatePath) {
      const raw = await loadTemplate(config.templatePath);
      const template = parseTemplate(raw);
      const templateResults = validateAgainstTemplate(prBody, template);
      results.push(...templateResults.map((r) => ({
        rule: r.section,
        status: r.filled ? 'pass' : 'fail',
        message: r.filled
          ? `Section "${r.section}" is filled in`
          : `Section "${r.section}" is missing or uses placeholder text`,
      } as ValidationResult)));
    }

    if (config.rules && config.rules.length > 0) {
      const ruleResults = validatePRBody(prBody, config.rules);
      results.push(...ruleResults.map((r) => ({
        rule: r.rule,
        status: r.passed ? 'pass' : 'fail',
        message: r.message,
      } as ValidationResult)));
    }

    if (results.length === 0) {
      core.info('No validation rules configured. Skipping.');
      return;
    }

    const report = buildReport(results);
    core.info(summarizeReport(report));
    printReport(report);
  } catch (err) {
    core.setFailed(`Unexpected error: ${(err as Error).message}`);
  }
}

run();
