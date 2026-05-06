import {
  extractMentions,
  checkRequiredMentions,
  checkForbiddenMentions,
  validateMentions,
} from "./mentionChecker";

describe("extractMentions", () => {
  it("extracts single mention", () => {
    expect(extractMentions("Thanks @alice for the review.")).toEqual(["alice"]);
  });

  it("extracts multiple unique mentions", () => {
    const result = extractMentions("@alice and @bob reviewed, @alice approved.");
    expect(result).toEqual(["alice", "bob"]);
  });

  it("returns empty array when no mentions", () => {
    expect(extractMentions("No mentions here.")).toEqual([]);
  });
});

describe("checkRequiredMentions", () => {
  it("marks found mentions as found", () => {
    const results = checkRequiredMentions("Reviewed by @alice", ["alice"]);
    expect(results[0].found).toBe(true);
  });

  it("marks missing mentions as not found", () => {
    const results = checkRequiredMentions("No reviewer mentioned", ["alice"]);
    expect(results[0].found).toBe(false);
  });
});

describe("checkForbiddenMentions", () => {
  it("marks present forbidden mentions as found", () => {
    const results = checkForbiddenMentions("CC @bot", ["bot"]);
    expect(results[0].found).toBe(true);
  });

  it("marks absent forbidden mentions as not found", () => {
    const results = checkForbiddenMentions("No bots here", ["bot"]);
    expect(results[0].found).toBe(false);
  });
});

describe("validateMentions", () => {
  it("passes when all required mentions present and no forbidden ones", () => {
    const { passed, errors } = validateMentions("@alice reviewed", ["alice"], ["bot"]);
    expect(passed).toBe(true);
    expect(errors).toHaveLength(0);
  });

  it("fails when required mention is missing", () => {
    const { passed, errors } = validateMentions("No reviewer", ["alice"], []);
    expect(passed).toBe(false);
    expect(errors[0]).toMatch(/@alice/);
  });

  it("fails when forbidden mention is present", () => {
    const { passed, errors } = validateMentions("CC @bot", [], ["bot"]);
    expect(passed).toBe(false);
    expect(errors[0]).toMatch(/@bot/);
  });

  it("collects multiple errors", () => {
    const { passed, errors } = validateMentions("CC @bot", ["alice"], ["bot"]);
    expect(passed).toBe(false);
    expect(errors).toHaveLength(2);
  });
});
