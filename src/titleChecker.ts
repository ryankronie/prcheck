export interface TitleRule {
  pattern: string;
  message?: string;
  flags?: string;
}

export interface TitleCheckResult {
  passed: boolean;
  message: string;
  rule: TitleRule;
}

export function checkTitleRule(
  title: string,
  rule: TitleRule
): TitleCheckResult {
  const flags = rule.flags ?? "i";
  const regex = new RegExp(rule.pattern, flags);
  const passed = regex.test(title);
  const message =
    rule.message ??
    `PR title must match pattern: ${rule.pattern}`;

  return { passed, message, rule };
}

export function validatePRTitle(
  title: string,
  rules: TitleRule[]
): TitleCheckResult[] {
  if (!title || title.trim().length === 0) {
    return [
      {
        passed: false,
        message: "PR title must not be empty",
        rule: { pattern: ".+" },
      },
    ];
  }

  return rules.map((rule) => checkTitleRule(title, rule));
}
