import { getCurrentDateTimeEuro } from '../../src/utils/date';

describe('getCurrentDateTimeEuro', () => {
  it('returns a date string in DD/MM/YYYY HH:MM format', () => {
    const result = getCurrentDateTimeEuro();
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/);
  });
});
