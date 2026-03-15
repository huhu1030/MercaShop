import { getDistanceFromLatLonInKm } from '../../src/utils/distance';

describe('getDistanceFromLatLonInKm', () => {
  it('returns 0 for same coordinates', () => {
    expect(getDistanceFromLatLonInKm(50.85, 4.35, 50.85, 4.35)).toBe(0);
  });

  it('calculates distance between Brussels and Antwerp (~45 km)', () => {
    const distance = getDistanceFromLatLonInKm(50.8503, 4.3517, 51.2194, 4.4025);
    expect(distance).toBeGreaterThan(40);
    expect(distance).toBeLessThan(50);
  });
});
