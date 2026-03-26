import { Badge, Box, Button, Card, HStack, IconButton, Separator, Text, VStack } from '@chakra-ui/react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import type { CartItem } from '../lib/cart-store';

function cartItemDisplayKey(item: CartItem): string {
  if (!item.selectedOptions || item.selectedOptions.length === 0) return item._id;
  return `${item._id}:${JSON.stringify(item.selectedOptions)}`;
}

interface OrderSummaryProps {
  items: CartItem[];
  total: number;
  readOnly?: boolean;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-BE', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
}

export function OrderSummary({ items, total, readOnly = false }: OrderSummaryProps) {
  const { addItem, decrementItem, removeItem } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (items.length === 0) {
    return (
      <VStack align="stretch" gap={4} p={6} borderWidth="1px" borderStyle="dashed" borderColor="blackAlpha.200" borderRadius="2xl" bg="blackAlpha.50">
        <Text fontSize="lg" fontWeight="medium">
          Your cart is empty.
        </Text>
        <Text color="fg.muted">Add a few products to start your order.</Text>
      </VStack>
    );
  }

  return (
    <Card.Root borderRadius="2xl" borderWidth="1px" borderColor="blackAlpha.100" bg="white" boxShadow="sm" overflow="hidden">
      <Card.Body p={{ base: 5, md: 6 }}>
        <VStack align="stretch" gap={5}>
          <HStack justify="space-between" align="start">
            <VStack align="start" gap={1}>
              <Text fontSize="lg" fontWeight="semibold">
                Order summary
              </Text>
              <Text color="fg.muted" fontSize="sm">
                {itemCount} item{itemCount === 1 ? '' : 's'} in your order
              </Text>
            </VStack>
            <Badge colorPalette="green" variant="subtle" px={3} py={1} borderRadius="full">
              {formatPrice(total)}
            </Badge>
          </HStack>

          {items.map((item, index) => (
            <VStack key={cartItemDisplayKey(item)} align="stretch" gap={3}>
              <HStack justify="space-between" align="start">
                <VStack align="start" gap={1}>
                  <Text fontWeight="semibold">{item.name}</Text>
                  <HStack gap={2} wrap="wrap">
                    <Text color="fg.muted" fontSize="sm">
                      {formatPrice(item.price + (item.optionsTotalPrice ?? 0))} each
                    </Text>
                    <Badge variant="outline" borderRadius="full">
                      Qty {item.quantity}
                    </Badge>
                  </HStack>
                </VStack>
                <Text fontWeight="semibold">{formatPrice((item.price + (item.optionsTotalPrice ?? 0)) * item.quantity)}</Text>
              </HStack>

              {item.selectedOptions && item.selectedOptions.length > 0 && (
                <VStack align="start" gap={2} pl={2}>
                  {item.selectedOptions.map((group) => (
                    <VStack key={group.name} align="start" gap={1}>
                      <Text fontSize="xs" color="fg.muted" fontWeight="medium">
                        {group.name}
                      </Text>
                      <HStack gap={1} wrap="wrap">
                        {group.choices.map((choice) => (
                          <Badge
                            key={choice.name}
                            colorPalette={choice.extraPrice > 0 ? 'green' : 'gray'}
                            variant="subtle"
                            px={2}
                            py={0.5}
                            borderRadius="full"
                            fontSize="xs"
                          >
                            {choice.name}
                            {choice.extraPrice > 0 && ` +${formatPrice(choice.extraPrice)}`}
                            {choice.quantity > 1 && ` ×${choice.quantity}`}
                          </Badge>
                        ))}
                      </HStack>
                    </VStack>
                  ))}
                </VStack>
              )}

              {!readOnly && (
                <HStack justify="space-between">
                  <HStack gap={2}>
                    <IconButton aria-label={`Decrease quantity for ${item.name}`} size="sm" variant="outline" onClick={() => decrementItem(item._id, item.selectedOptions)}>
                      <Minus size={16} />
                    </IconButton>
                    <Box minW={10} px={3} py={1} borderWidth="1px" borderColor="blackAlpha.200" borderRadius="lg" textAlign="center">
                      <Text fontSize="sm" fontWeight="medium">
                        {item.quantity}
                      </Text>
                    </Box>
                    <IconButton aria-label={`Increase quantity for ${item.name}`} size="sm" variant="outline" onClick={() => addItem(item)}>
                      <Plus size={16} />
                    </IconButton>
                  </HStack>

                  <Button size="sm" variant="ghost" colorPalette="red" onClick={() => removeItem(item._id, item.selectedOptions)}>
                    <Trash2 size={16} />
                    Remove
                  </Button>
                </HStack>
              )}

              {index < items.length - 1 && <Separator />}
            </VStack>
          ))}

          <Box p={4} borderRadius="xl" bg="blackAlpha.50" borderWidth="1px" borderColor="blackAlpha.100">
            <VStack align="stretch" gap={3}>
              <HStack justify="space-between">
                <Text color="fg.muted">Subtotal</Text>
                <Text fontWeight="medium">{formatPrice(total)}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="fg.muted">Service</Text>
                <Text fontWeight="medium">Included</Text>
              </HStack>
              <Separator />
              <HStack justify="space-between">
                <Text fontSize="lg" fontWeight="semibold">
                  Total
                </Text>
                <Text fontSize="xl" fontWeight="bold">
                  {formatPrice(total)}
                </Text>
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
