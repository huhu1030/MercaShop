import {
  Alert,
  Box,
  Button,
  Grid,
  Heading,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react'
import { DeliveryMethod, PaymentMethod } from '@mercashop/shared'
import {
  getOrderApi,
  getPaymentApi,
} from '@mercashop/shared/api-client'
import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { AuthGate } from '../components/AuthGate'
import {
  CheckoutForm,
  type CheckoutFormData,
} from '../components/CheckoutForm'
import { OrderSummary } from '../components/OrderSummary'
import { useCart } from '../hooks/useCart'
import { useEstablishment } from '../hooks/useEstablishment'

export function CheckoutPage() {
  return (
    <AuthGate>
      <CheckoutPageContent />
    </AuthGate>
  )
}

function CheckoutPageContent() {
  const navigate = useNavigate()
  const { items, total, clearCart } = useCart()
  const { establishment, isLoading } = useEstablishment()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: CheckoutFormData) => {
    if (!establishment) return

    setError(null)
    setIsSubmitting(true)

    try {
      const orderResponse = await getOrderApi().createOrder({
        establishmentId: establishment._id,
        orderLines: items.map((item) => ({
          item: {
            _id: item._id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          },
        })),
        total,
        paymentMethod: formData.paymentMethod as unknown as import('@mercashop/shared/api-client').PaymentMethod,
        deliveryMethod: formData.deliveryMethod,
        deliveryAddress:
          formData.deliveryMethod === DeliveryMethod.DELIVERY
            ? formData.deliveryAddress
            : undefined,
        billingInformation: formData.billingInformation,
      })

      const orderId = orderResponse.data.order?._id
      if (!orderId) {
        throw new Error('Order creation failed')
      }

      const paymentResponse = await getPaymentApi().processPayment({
        orderId,
        paymentMethod: formData.paymentMethod as unknown as import('@mercashop/shared/api-client').PaymentMethod,
      })

      clearCart()

      if (
        (formData.paymentMethod === PaymentMethod.CARD ||
          formData.paymentMethod === PaymentMethod.BANCONTACT) &&
        paymentResponse.data.checkoutUrl
      ) {
        window.location.href = paymentResponse.data.checkoutUrl
        return
      }

      navigate(`/order/${orderId}/status`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <VStack align="stretch" gap={5}>
        <Heading size="lg">Your cart is empty</Heading>
        <Text color="fg.muted">
          Add products before continuing to checkout.
        </Text>
        <Button asChild alignSelf="start" colorPalette="green">
          <RouterLink to="/">Browse products</RouterLink>
        </Button>
      </VStack>
    )
  }

  if (isLoading || !establishment) {
    return (
      <VStack py={20}>
        <Spinner size="xl" />
      </VStack>
    )
  }

  return (
    <VStack align="stretch" gap={6}>
      <VStack align="start" gap={2}>
        <Heading size="xl">Checkout</Heading>
        <Text color="fg.muted">
          Review your order, choose delivery, and confirm payment.
        </Text>
      </VStack>

      {error && (
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Checkout failed</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      <Grid templateColumns={{ base: '1fr', lg: 'minmax(0, 420px) minmax(0, 1fr)' }} gap={8}>
        <Box>
          <OrderSummary items={items} total={total} readOnly />
        </Box>
        <Box>
          <CheckoutForm
            establishment={establishment}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </Box>
      </Grid>
    </VStack>
  )
}
