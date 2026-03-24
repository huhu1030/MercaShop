import { Button, Heading, Text, VStack } from '@chakra-ui/react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { OrderSummary } from '../components/OrderSummary'
import { useCart } from '../hooks/useCart'

export function CartPage() {
  const { items, total, clearCart } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <VStack align="stretch" gap={5}>
        <Heading size="lg">Your cart is empty</Heading>
        <Text color="fg.muted">
          Start with the catalog and add products to your order.
        </Text>
        <Button asChild alignSelf="start" colorPalette="green">
          <RouterLink to="/">Browse products</RouterLink>
        </Button>
      </VStack>
    )
  }

  return (
    <VStack align="stretch" gap={6}>
      <VStack align="start" gap={2}>
        <Heading size="lg">Your cart</Heading>
        <Text color="fg.muted">
          Adjust quantities, remove items, or continue to checkout.
        </Text>
      </VStack>

      <OrderSummary items={items} total={total} />

      <VStack align="stretch" gap={3}>
        <Button variant="outline" onClick={clearCart}>
          Clear cart
        </Button>
        <Button colorPalette="green" onClick={() => navigate('/checkout')}>
          Checkout
        </Button>
      </VStack>
    </VStack>
  )
}
