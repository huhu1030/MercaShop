export function truncateToLast5Digits(input: string): string {
  if (typeof input !== 'string') {
    throw new TypeError('Input must be a string');
  }
  return input.slice(-5);
}
