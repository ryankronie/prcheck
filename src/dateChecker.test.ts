import { extractDates, isDateInRange, checkDates } from './dateChecker';
import { PRDateCheckerConfig } from './dateChecker.config';

describe('extractDates', () => {
  it('extracts YYYY-MM-DD dates', () => {
    expect(extractDates('Released on 2024-03-15.', 'YYYY-MM-DD')).toEqual(['2024-03-15']);
  });

  it('extracts MM/DD/YYYY dates', () => {
    expect(extractDates('Due: 03/15/2024', 'MM/DD/YYYY')).toEqual(['03/15/2024']);
  });

  it('returns empty array for unknown format', () => {
    expect(extractDates('2024-03-15', 'UNKNOWN')).toEqual([]);
  });

  it('returns empty array when no date found', () => {
    expect(extractDates('no dates here', 'YYYY-MM-DD')).toEqual([]);
  });
});

describe('isDateInRange', () => {
  it('returns true when date is within range', () => {
    expect(isDateInRange('2024-06-01', 'YYYY-MM-DD', '2024-01-01', '2024-12-31')).toBe(true);
  });

  it('returns false when date is before minDate', () => {
    expect(isDateInRange('2023-12-31', 'YYYY-MM-DD', '2024-01-01')).toBe(false);
  });

  it('returns false when date is after maxDate', () => {
    expect(isDateInRange('2025-01-01', 'YYYY-MM-DD', undefined, '2024-12-31')).toBe(false);
  });

  it('handles MM/DD/YYYY format correctly', () => {
    expect(isDateInRange('06/01/2024', 'MM/DD/YYYY', '2024-01-01', '2024-12-31')).toBe(true);
  });
});

describe('checkDates', () => {
  const config: PRDateCheckerConfig = {
    format: 'YYYY-MM-DD',
    fields: [
      { label: 'Release Date', required: true, minDate: '2024-01-01' },
      { label: 'Review By', required: false },
    ],
  };

  it('passes when required field has valid date', () => {
    const results = checkDates('Release Date: 2024-05-10', config);
    expect(results.some(r => !r.valid)).toBe(false);
  });

  it('fails when required field is missing', () => {
    const results = checkDates('No date info here', config);
    expect(results.some(r => !r.valid && r.field === 'Release Date')).toBe(true);
  });

  it('fails when date is out of range', () => {
    const results = checkDates('Release Date: 2023-06-01', config);
    expect(results.some(r => !r.valid)).toBe(true);
  });

  it('passes when optional field is absent', () => {
    const results = checkDates('Release Date: 2024-05-10', config);
    const reviewResults = results.filter(r => r.field === 'Review By');
    expect(reviewResults.every(r => r.valid)).toBe(true);
  });
});
