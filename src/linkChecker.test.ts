import { extractLinks, validateLinkFormat, checkLinks } from "./linkChecker";

jest.mock("@actions/core", () => ({ warning: jest.fn() }));

describe("extractLinks", () => {
  it("extracts http and https links from body", () => {
    const body = "See https://example.com and http://foo.bar for details.";
    expect(extractLinks(body)).toEqual(["https://example.com", "http://foo.bar"]);
  });

  it("deduplicates repeated links", () => {
    const body = "https://example.com https://example.com";
    expect(extractLinks(body)).toHaveLength(1);
  });

  it("returns empty array when no links present", () => {
    expect(extractLinks("No links here.")).toEqual([]);
  });
});

describe("validateLinkFormat", () => {
  it("marks valid URLs as valid", () => {
    const result = validateLinkFormat("https://github.com/owner/repo");
    expect(result.valid).toBe(true);
  });

  it("marks malformed URLs as invalid", () => {
    const result = validateLinkFormat("not-a-url");
    expect(result.valid).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it("marks URLs with empty hostname as invalid", () => {
    const result = validateLinkFormat("http://");
    expect(result.valid).toBe(false);
  });
});

describe("checkLinks", () => {
  it("returns correct summary for valid links", () => {
    const body = "Check https://github.com and https://example.com";
    const summary = checkLinks(body);
    expect(summary.total).toBe(2);
    expect(summary.valid).toBe(2);
    expect(summary.invalid).toBe(0);
  });

  it("returns correct summary for empty body", () => {
    const summary = checkLinks("No links.");
    expect(summary.total).toBe(0);
    expect(summary.valid).toBe(0);
    expect(summary.invalid).toBe(0);
  });
});
