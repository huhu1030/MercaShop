import { validateAndSnapshotOptions } from '../../src/utils/validateOrderOptions';

const sauceGroup = {
  name: 'Sauce',
  required: true,
  selectionMode: 'exactlyOne' as const,
  choices: [
    { name: 'Ketchup', extraPrice: 0, maxQuantity: 1 },
    { name: 'Mayo', extraPrice: 0, maxQuantity: 1 },
    { name: 'Samurai', extraPrice: 0.5, maxQuantity: 1 },
  ],
};

const toppingsGroup = {
  name: 'Toppings',
  required: false,
  selectionMode: 'upToN' as const,
  maxSelections: 3,
  choices: [
    { name: 'Extra Cheese', extraPrice: 0.5, maxQuantity: 3 },
    { name: 'Bacon', extraPrice: 1.0, maxQuantity: 1 },
    { name: 'Jalapeños', extraPrice: 0, maxQuantity: 1 },
  ],
};

const anyNumberGroup = {
  name: 'Extras',
  required: false,
  selectionMode: 'anyNumber' as const,
  choices: [
    { name: 'Onion Rings', extraPrice: 0.75, maxQuantity: 2 },
    { name: 'Coleslaw', extraPrice: 0.5, maxQuantity: 1 },
  ],
};

describe('validateAndSnapshotOptions', () => {
  it('should pass for valid exactlyOne selection', () => {
    const result = validateAndSnapshotOptions(
      [sauceGroup],
      [{ name: 'Sauce', choices: [{ name: 'Ketchup', quantity: 1 }] }],
    );
    expect(result.selectedOptions).toEqual([
      { name: 'Sauce', choices: [{ name: 'Ketchup', quantity: 1, extraPrice: 0 }] },
    ]);
    expect(result.optionsTotalPrice).toBe(0);
  });

  it('should fail when required group is missing', () => {
    expect(() => validateAndSnapshotOptions([sauceGroup], [])).toThrow(
      'Required option group "Sauce" is missing',
    );
  });

  it('should fail when exactlyOne has zero selections', () => {
    expect(() =>
      validateAndSnapshotOptions([sauceGroup], [{ name: 'Sauce', choices: [] }]),
    ).toThrow('Option group "Sauce" requires exactly 1 selection');
  });

  it('should fail when exactlyOne has multiple selections', () => {
    expect(() =>
      validateAndSnapshotOptions(
        [sauceGroup],
        [{ name: 'Sauce', choices: [{ name: 'Ketchup', quantity: 1 }, { name: 'Mayo', quantity: 1 }] }],
      ),
    ).toThrow('Option group "Sauce" requires exactly 1 selection');
  });

  it('should fail when upToN exceeds maxSelections', () => {
    expect(() =>
      validateAndSnapshotOptions(
        [toppingsGroup],
        [{
          name: 'Toppings',
          choices: [
            { name: 'Extra Cheese', quantity: 1 },
            { name: 'Bacon', quantity: 1 },
            { name: 'Jalapeños', quantity: 1 },
            { name: 'Extra Cheese', quantity: 1 },
          ],
        }],
      ),
    ).toThrow('Option group "Toppings" allows at most 3 selections');
  });

  it('should fail when choice name does not exist', () => {
    expect(() =>
      validateAndSnapshotOptions(
        [sauceGroup],
        [{ name: 'Sauce', choices: [{ name: 'Mustard', quantity: 1 }] }],
      ),
    ).toThrow('Choice "Mustard" not found in option group "Sauce"');
  });

  it('should fail when choice quantity exceeds maxQuantity', () => {
    expect(() =>
      validateAndSnapshotOptions(
        [toppingsGroup],
        [{ name: 'Toppings', choices: [{ name: 'Extra Cheese', quantity: 5 }] }],
      ),
    ).toThrow('Choice "Extra Cheese" in "Toppings" allows max quantity 3');
  });

  it('should calculate optionsTotalPrice correctly with quantities', () => {
    const result = validateAndSnapshotOptions(
      [sauceGroup, toppingsGroup],
      [
        { name: 'Sauce', choices: [{ name: 'Samurai', quantity: 1 }] },
        { name: 'Toppings', choices: [{ name: 'Extra Cheese', quantity: 2 }, { name: 'Bacon', quantity: 1 }] },
      ],
    );
    expect(result.optionsTotalPrice).toBe(2.5);
    expect(result.selectedOptions).toHaveLength(2);
  });

  it('should snapshot prices from product, not from client', () => {
    const result = validateAndSnapshotOptions(
      [sauceGroup],
      [{ name: 'Sauce', choices: [{ name: 'Samurai', quantity: 1 }] }],
    );
    expect(result.selectedOptions[0].choices[0].extraPrice).toBe(0.5);
  });

  it('should allow empty selections for optional groups', () => {
    const result = validateAndSnapshotOptions(
      [toppingsGroup],
      [],
    );
    expect(result.selectedOptions).toEqual([]);
    expect(result.optionsTotalPrice).toBe(0);
  });

  it('should handle anyNumber selection mode', () => {
    const result = validateAndSnapshotOptions(
      [anyNumberGroup],
      [{ name: 'Extras', choices: [{ name: 'Onion Rings', quantity: 2 }, { name: 'Coleslaw', quantity: 1 }] }],
    );
    expect(result.optionsTotalPrice).toBe(2.0);
  });

  it('should handle product with no option groups', () => {
    const result = validateAndSnapshotOptions([], []);
    expect(result.selectedOptions).toEqual([]);
    expect(result.optionsTotalPrice).toBe(0);
  });

  it('should fail when unknown option group is submitted', () => {
    expect(() =>
      validateAndSnapshotOptions(
        [],
        [{ name: 'FakeGroup', choices: [{ name: 'Fake', quantity: 1 }] }],
      ),
    ).toThrow('Unknown option group "FakeGroup"');
  });
});
