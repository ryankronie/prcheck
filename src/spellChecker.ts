import { getInput } from "@actions/core";

const COMMON_MISSPELLINGS: Record<string, string> = {
  teh: "the",
  recieve: "receive",
  occured: "occurred",
  seperate: "separate",
  definately: "definitely",
  accomodate: "accommodate",
  occurance: "occurrence",
  untill: "until",
  wierd: "weird",
  relevent: "relevant",
  existance: "existence",
  dependancy: "dependency",
  enviroment: "environment",
  sucessful: "successful",
  acheive: "achieve",
};

export interface SpellCheckResult {
  word: string;
  suggestion: string;
  line: number;
  column: number;
}

export function extractWords(text: string): Array<{ word: string; line: number; column: number }> {
  const results: Array<{ word: string; line: number; column: number }> = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const matches = lines[i].matchAll(/\b([a-zA-Z]+)\b/g);
    for (const match of matches) {
      results.push({ word: match[1], line: i + 1, column: match.index! + 1 });
    }
  }
  return results;
}

export function checkSpelling(
  text: string,
  customDictionary: string[] = []
): SpellCheckResult[] {
  const words = extractWords(text);
  const results: SpellCheckResult[] = [];
  const skipSet = new Set(customDictionary.map((w) => w.toLowerCase()));

  for (const { word, line, column } of words) {
    const lower = word.toLowerCase();
    if (skipSet.has(lower)) continue;
    if (COMMON_MISSPELLINGS[lower]) {
      results.push({ word, suggestion: COMMON_MISSPELLINGS[lower], line, column });
    }
  }
  return results;
}
