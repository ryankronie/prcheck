import * as core from "@actions/core";
import * as github from "@actions/github";

export interface LabelRule {
  label: string;
  pattern: string;
}

export interface LabelConfig {
  rules: LabelRule[];
}

export function matchLabels(body: string, rules: LabelRule[]): string[] {
  const matched: string[] = [];
  for (const rule of rules) {
    const regex = new RegExp(rule.pattern, "i");
    if (regex.test(body)) {
      matched.push(rule.label);
    }
  }
  return matched;
}

export async function applyLabels(
  token: string,
  owner: string,
  repo: string,
  prNumber: number,
  labels: string[]
): Promise<void> {
  if (labels.length === 0) {
    core.info("No labels to apply.");
    return;
  }

  const octokit = github.getOctokit(token);

  try {
    await octokit.rest.issues.addLabels({
      owner,
      repo,
      issue_number: prNumber,
      labels,
    });
    core.info(`Applied labels: ${labels.join(", ")}`);
  } catch (err) {
    core.warning(`Failed to apply labels: ${(err as Error).message}`);
  }
}
