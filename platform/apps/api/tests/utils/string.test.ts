import { truncateToLast5Digits } from '../../src/utils/string';

describe('truncateToLast5Digits', () => {
  it('returns last 5 characters of a string', () => {
    expect(truncateToLast5Digits('abcdefghij')).toBe('fghij');
  });

  it('returns full string if shorter than 5', () => {
    expect(truncateToLast5Digits('abc')).toBe('abc');
  });

  it('throws on non-string input', () => {
    expect(() => truncateToLast5Digits(123 as any)).toThrow('Input must be a string');
  });
});
