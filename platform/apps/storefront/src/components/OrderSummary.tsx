import {
  Button,
  HStack,
  IconButton,
  Separator,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Minus, Plus, Trash2 } from 'lucide-react'
import type { CartItem } from '../lib/cart-store'
import { useCart } from '../hooks/useCart'

interface OrderSummaryProps {
  items: CartItem[]
  total: number
  readOnly?: boolean
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-BE', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

export function OrderSummary({
  items,
  total,
  readOnly = false,
}: OrderSummaryProps) {
  const { addItem, decrementItem, removeItem } = useCart()

  if (items.length === 0) {
    return (
      <VStack
        align="stretch"
        gap={4}
        p={6}
        borderWidth="1px"
        borderStyle="dashed"
        borderColor="blackAlpha.200"
        borderRadius="2xl"
        bg="blackAlpha.50"
      >
        <Text fontSize="lg" fontWeight="medium">
          Your cart is empty.
        </Text>
        <Text color="fg.muted">
          Add a few products to start your order.
        </Text>
      </VStack>
    )
  }

  return (
    <VStack
      align="stretch"
      gap={4}
      p={5}
      borderWidth="1px"
      borderColor="blackAlpha.100"
      borderRadius="2xl"
      bg="white"
      boxShadow="sm"
    >
      {items.map((item) => (
        <VStack key={item._id} align="stretch" gap={3}>
          <HStack justify="space-between" align="start">
            <VStack align="start" gap={1}>
              <Text fontWeight="semibold">{item.name}</Text>
              <Text color="fg.muted">
                {formatPrice(item.price)} each
              </Text>
            </VStack>
            <Text fontWeight="semibold">
              {formatPrice(item.price * item.quantity)}
            </Text>
          </HStack>

          <HStack justify="space-between">
            <HStack gap={2}>
              <Text color="fg.muted">Qty {item.quantity}</Text>
              {!readOnly && (
                <>
                  <IconButton
                    aria-label={`Decrease quantity for ${item.name}`}
                    size="sm"
                    variant="outline"
                    onClick={() => decrementItem(item._id)}
                  >
                    <Minus size={16} />
                  </IconButton>
                  <IconButton
                    aria-label={`Increase quantity for ${item.name}`}
                    size="sm"
                    variant="outline"
                    onClick={() => addItem(item)}
                  >
                    <Plus size={16} />
                  </IconButton>
                </>
              )}
            </HStack>

            {!readOnly && (
              <Button
                size="sm"
                variant="ghost"
                colorPalette="red"
                onClick={() => removeItem(item._id)}
              >
                <Trash2 size={16} />
                Remove
              </Button>
            )}
          </HStack>

          <Separator />
        </VStack>
      ))}

      <HStack justify="space-between">
        <Text fontSize="lg" fontWeight="semibold">
          Total
        </Text>
        <Text fontSize="xl" fontWeight="bold">
          {formatPrice(total)}
        </Text>
      </HStack>
    </VStack>
  )
}
