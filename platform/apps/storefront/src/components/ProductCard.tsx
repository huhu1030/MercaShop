import { Badge, Box, Button, Card, HStack, IconButton, Image, Text, VStack, Wrap } from '@chakra-ui/react';
import { Minus, Plus } from 'lucide-react';
import type { IPublicProduct, IOptionGroup, IOptionChoice } from '@mercashop/shared';
import { useState, useMemo, useCallback } from 'react';
import { useCart } from '../hooks/useCart';
import type { CartItemSelectedOption } from '../lib/cart-store';

interface ProductCardProps {
  product: IPublicProduct;
  disabled?: boolean;
}

function getProductImageUrl(photo?: string) {
  if (!photo) return null;
  if (photo.startsWith('http://') || photo.startsWith('https://')) {
    return photo;
  }

  const basePath = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? '';
  const assetPath = photo.startsWith('/') ? photo : `/${photo}`;
  return `${basePath}${assetPath}`;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-BE', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
}

function getSelectionHint(group: IOptionGroup): string {
  switch (group.selectionMode) {
    case 'exactlyOne':
      return 'Choose exactly 1';
    case 'upToN':
      return `Choose up to ${group.maxSelections ?? 1}`;
    case 'anyNumber':
      return 'Add as many as you like';
  }
}

function isGroupValid(group: IOptionGroup, selections: Map<string, number> | undefined): boolean {
  if (!group.required) return true;
  if (!selections || selections.size === 0) return false;

  const totalSelected = Array.from(selections.values()).reduce((sum, qty) => sum + qty, 0);

  switch (group.selectionMode) {
    case 'exactlyOne':
      return totalSelected === 1;
    case 'upToN':
      return totalSelected >= 1 && totalSelected <= (group.maxSelections ?? 1);
    case 'anyNumber':
      return totalSelected >= 1;
  }
}

export function ProductCard({ product, disabled }: ProductCardProps) {
  const { addItem } = useCart();
  const imageUrl = getProductImageUrl(product.photo);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Map<string, Map<string, number>>>(new Map());

  const hasOptions = product.optionGroups.length > 0;

  const handleChoiceClick = useCallback((group: IOptionGroup, choice: IOptionChoice) => {
    setSelectedOptions((prev) => {
      const next = new Map(prev);
      const groupSelections = new Map(next.get(group.name) ?? new Map<string, number>());

      if (group.selectionMode === 'exactlyOne') {
        groupSelections.clear();
        groupSelections.set(choice.name, 1);
      } else {
        if (groupSelections.has(choice.name)) {
          groupSelections.delete(choice.name);
        } else {
          const totalSelected = Array.from(groupSelections.values()).reduce((sum, qty) => sum + qty, 0);
          if (group.selectionMode === 'upToN' && totalSelected >= (group.maxSelections ?? 1)) {
            return prev;
          }
          groupSelections.set(choice.name, 1);
        }
      }

      next.set(group.name, groupSelections);
      return next;
    });
  }, []);

  const handleChoiceQuantity = useCallback((group: IOptionGroup, choice: IOptionChoice, delta: number) => {
    setSelectedOptions((prev) => {
      const next = new Map(prev);
      const groupSelections = new Map(next.get(group.name) ?? new Map<string, number>());
      const currentQty = groupSelections.get(choice.name) ?? 0;
      const newQty = Math.max(0, Math.min(choice.maxQuantity, currentQty + delta));

      if (newQty === 0) {
        groupSelections.delete(choice.name);
      } else {
        if (group.selectionMode === 'upToN') {
          const othersTotal = Array.from(groupSelections.entries())
            .filter(([name]) => name !== choice.name)
            .reduce((sum, [, qty]) => sum + qty, 0);
          if (othersTotal + newQty > (group.maxSelections ?? 1)) {
            return prev;
          }
        }
        groupSelections.set(choice.name, newQty);
      }

      next.set(group.name, groupSelections);
      return next;
    });
  }, []);

  const optionsTotalPrice = useMemo(() => {
    let total = 0;
    for (const group of product.optionGroups) {
      const groupSelections = selectedOptions.get(group.name);
      if (!groupSelections) continue;
      for (const choice of group.choices) {
        const qty = groupSelections.get(choice.name);
        if (qty) {
          total += choice.extraPrice * qty;
        }
      }
    }
    return total;
  }, [selectedOptions, product.optionGroups]);

  const allRequiredValid = useMemo(() => {
    return product.optionGroups.every((group) =>
      isGroupValid(group, selectedOptions.get(group.name)),
    );
  }, [selectedOptions, product.optionGroups]);

  const unitTotal = product.price + optionsTotalPrice;

  const buildSelectedOptions = useCallback((): CartItemSelectedOption[] => {
    const result: CartItemSelectedOption[] = [];
    for (const group of product.optionGroups) {
      const groupSelections = selectedOptions.get(group.name);
      if (!groupSelections || groupSelections.size === 0) continue;
      const choices: CartItemSelectedOption['choices'] = [];
      for (const choice of group.choices) {
        const qty = groupSelections.get(choice.name);
        if (qty && qty > 0) {
          choices.push({ name: choice.name, quantity: qty, extraPrice: choice.extraPrice });
        }
      }
      if (choices.length > 0) {
        result.push({ name: group.name, choices });
      }
    }
    return result;
  }, [selectedOptions, product.optionGroups]);

  const handleAddToCart = () => {
    const opts = hasOptions ? buildSelectedOptions() : undefined;
    addItem(
      {
        _id: product._id,
        name: product.name,
        price: product.price,
        photo: product.photo,
        selectedOptions: opts,
        optionsTotalPrice: hasOptions ? optionsTotalPrice : undefined,
      },
      quantity,
    );
    setQuantity(1);
    setSelectedOptions(new Map());
  };

  const addDisabled = disabled || (hasOptions && !allRequiredValid);

  return (
    <Card.Root overflow="hidden" h="100%" borderRadius="2xl" borderWidth="1px" borderColor="blackAlpha.100" bg="white" boxShadow="sm">
      {imageUrl ? (
        <Image src={imageUrl} alt={product.name} h={{ base: '160px', md: '180px' }} w="100%" objectFit="cover" />
      ) : (
        <Box h={{ base: '160px', md: '180px' }} bgGradient="linear(to-br, blackAlpha.100, blackAlpha.200)" />
      )}

      <Card.Body>
        <VStack align="stretch" gap={3}>
          <VStack align="stretch" gap={1}>
            <Text fontSize="lg" fontWeight="semibold" lineClamp={1}>
              {product.name}
            </Text>
            <Text color="fg.muted" minH="3rem" lineClamp={2}>
              {product.description ?? 'Freshly prepared and ready to order.'}
            </Text>
          </VStack>

          <Text fontSize="xl" fontWeight="bold">
            {formatPrice(product.price)}
          </Text>

          {hasOptions &&
            product.optionGroups.map((group) => {
              const groupSelections = selectedOptions.get(group.name);
              return (
                <VStack key={group.name} align="stretch" gap={1}>
                  <HStack gap={2}>
                    <Text fontWeight="semibold" fontSize="sm">
                      {group.name}
                    </Text>
                    <Badge colorPalette={group.required ? 'red' : 'gray'} size="sm">
                      {group.required ? 'Required' : 'Optional'}
                    </Badge>
                  </HStack>
                  <Text fontSize="xs" color="fg.muted">
                    {getSelectionHint(group)}
                  </Text>
                  <Wrap gap={2}>
                    {group.choices.map((choice) => {
                      const isSelected = groupSelections?.has(choice.name) ?? false;
                      const choiceQty = groupSelections?.get(choice.name) ?? 0;
                      const showStepper = isSelected && choice.maxQuantity > 1;
                      const label = choice.extraPrice > 0 ? `${choice.name} +${formatPrice(choice.extraPrice)}` : choice.name;

                      return (
                        <HStack key={choice.name} gap={1}>
                          <Button
                            size="xs"
                            variant={isSelected ? 'solid' : 'outline'}
                            colorPalette={isSelected ? 'green' : undefined}
                            onClick={() => handleChoiceClick(group, choice)}
                          >
                            {label}
                          </Button>
                          {showStepper && (
                            <HStack gap={0}>
                              <IconButton
                                aria-label={`Decrease ${choice.name}`}
                                size="2xs"
                                variant="outline"
                                onClick={() => handleChoiceQuantity(group, choice, -1)}
                              >
                                <Minus size={12} />
                              </IconButton>
                              <Text fontSize="xs" minW="4" textAlign="center">
                                {choiceQty}
                              </Text>
                              <IconButton
                                aria-label={`Increase ${choice.name}`}
                                size="2xs"
                                variant="outline"
                                disabled={choiceQty >= choice.maxQuantity}
                                onClick={() => handleChoiceQuantity(group, choice, 1)}
                              >
                                <Plus size={12} />
                              </IconButton>
                            </HStack>
                          )}
                        </HStack>
                      );
                    })}
                  </Wrap>
                </VStack>
              );
            })}
        </VStack>
      </Card.Body>

      <Card.Footer pt={0}>
        <VStack width="full" align="stretch" gap={3}>
          <HStack justify="space-between">
            <Text fontSize="sm" color="fg.muted">
              Quantity
            </Text>
            <HStack gap={2}>
              <IconButton
                aria-label={`Decrease quantity for ${product.name}`}
                size="sm"
                variant="outline"
                disabled={disabled}
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              >
                <Minus size={16} />
              </IconButton>
              <Text minW="6" textAlign="center" fontWeight="semibold">
                {quantity}
              </Text>
              <IconButton
                aria-label={`Increase quantity for ${product.name}`}
                size="sm"
                variant="outline"
                disabled={disabled}
                onClick={() => setQuantity((current) => current + 1)}
              >
                <Plus size={16} />
              </IconButton>
            </HStack>
          </HStack>

          <Button width="full" colorPalette="green" disabled={addDisabled} onClick={handleAddToCart}>
            {disabled ? 'Store closed' : `Add ${quantity} to cart — ${formatPrice(unitTotal * quantity)}`}
          </Button>
        </VStack>
      </Card.Footer>
    </Card.Root>
  );
}
