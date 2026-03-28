import type { IOptionGroup } from '@mercashop/shared';

interface ClientSelectedChoice {
  name: string;
  quantity: number;
}

interface ClientSelectedOptionGroup {
  name: string;
  choices: ClientSelectedChoice[];
}

interface SnapshotResult {
  selectedOptions: Array<{
    name: string;
    choices: Array<{ name: string; quantity: number; extraPrice: number }>;
  }>;
  optionsTotalPrice: number;
}

export function validateAndSnapshotOptions(
  productOptionGroups: IOptionGroup[],
  clientSelections: ClientSelectedOptionGroup[],
): SnapshotResult {
  const groupMap = new Map(productOptionGroups.map((g) => [g.name, g]));
  let optionsTotalPrice = 0;
  const selectedOptions: SnapshotResult['selectedOptions'] = [];

  // Check for unknown groups
  for (const sel of clientSelections) {
    if (!groupMap.has(sel.name)) {
      throw new Error(`Unknown option group "${sel.name}"`);
    }
  }

  // Validate each group
  for (const group of productOptionGroups) {
    const sel = clientSelections.find((s) => s.name === group.name);
    const totalChoices = sel?.choices.length ?? 0;

    // Validate selection count (check before required guard so exactlyOne with 0 gives the right error)
    switch (group.selectionMode) {
      case 'exactlyOne':
        if (sel && totalChoices !== 1) {
          throw new Error(`Option group "${group.name}" requires exactly 1 selection`);
        }
        break;
      case 'upToN':
        if (totalChoices > (group.maxSelections ?? 1)) {
          throw new Error(`Option group "${group.name}" allows at most ${group.maxSelections} selections`);
        }
        break;
      case 'anyNumber':
        break;
      default: {
        const _exhaustive: never = group.selectionMode;
        throw new Error(`Unknown selectionMode: ${_exhaustive}`);
      }
    }

    // Check required groups have at least one selection
    if (group.required && totalChoices === 0) {
      throw new Error(`Required option group "${group.name}" is missing`);
    }

    // Skip optional groups with no selections
    if (!sel || totalChoices === 0) {
      continue;
    }

    // Validate each choice and snapshot prices
    const snapshotChoices: Array<{ name: string; quantity: number; extraPrice: number }> = [];

    for (const choice of sel.choices) {
      if (!Number.isInteger(choice.quantity) || choice.quantity < 1) {
        throw new Error(
          `Choice "${choice.name}" in "${group.name}" must have a positive integer quantity`,
        );
      }

      const productChoice = group.choices.find((c) => c.name === choice.name);
      if (!productChoice) {
        throw new Error(`Choice "${choice.name}" not found in option group "${group.name}"`);
      }

      if (choice.quantity > productChoice.maxQuantity) {
        throw new Error(
          `Choice "${choice.name}" in "${group.name}" allows max quantity ${productChoice.maxQuantity}`,
        );
      }

      snapshotChoices.push({
        name: choice.name,
        quantity: choice.quantity,
        extraPrice: productChoice.extraPrice,
      });

      optionsTotalPrice += productChoice.extraPrice * choice.quantity;
    }

    selectedOptions.push({ name: group.name, choices: snapshotChoices });
  }

  return { selectedOptions, optionsTotalPrice };
}
