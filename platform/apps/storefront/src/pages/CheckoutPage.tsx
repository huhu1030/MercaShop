import { Alert, Box, Button, Card, Grid, GridItem, Heading, HStack, Spinner, Text, VStack } from '@chakra-ui/react';
import { DeliveryMethod, EstablishmentStatus, PaymentMethod } from '@mercashop/shared';
import axios from 'axios';
import { getCustomerProfileApi, getOrderApi, getPaymentApi } from '@mercashop/shared/api-client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Clock3, ShieldCheck, Store } from 'lucide-react';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { CheckoutForm, type CheckoutFormData } from '../components/CheckoutForm';
import { OrderSummary } from '../components/OrderSummary';
import { useCart } from '../hooks/useCart';
import { useEstablishment } from '../hooks/useEstablishment';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { establishment, isLoading } = useEstablishment();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['customer-profile'],
    queryFn: async () => {
      const response = await getCustomerProfileApi().getMyProfile();
      return response.data;
    },
  });

  const handleSubmit = async (formData: CheckoutFormData) => {
    if (!establishment) return;

    setError(null);
    setIsSubmitting(true);

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
        deliveryAddress: formData.deliveryMethod === DeliveryMethod.DELIVERY ? formData.deliveryAddress : undefined,
        billingInformation: formData.billingInformation,
        remark: formData.remark?.trim() || undefined,
      });

      const orderId = orderResponse.data.order?._id;
      if (!orderId) {
        throw new Error('Order creation failed');
      }

      const paymentResponse = await getPaymentApi().processPayment({
        orderId,
        paymentMethod: formData.paymentMethod as unknown as import('@mercashop/shared/api-client').PaymentMethod,
      });

      clearCart();

      if (
        (formData.paymentMethod === PaymentMethod.CARD || formData.paymentMethod === PaymentMethod.BANCONTACT) &&
        paymentResponse.data.checkoutUrl
      ) {
        window.location.href = paymentResponse.data.checkoutUrl;
        return;
      }

      navigate(`/order/${orderId}/confirmation`, { replace: true });
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(message || 'Checkout failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <Card.Root maxW="2xl" mx="auto" borderRadius="3xl" borderWidth="1px" borderColor="blackAlpha.100" bg="white" boxShadow="sm">
        <Card.Body p={{ base: 6, md: 8 }}>
          <VStack align="stretch" gap={5}>
            <Heading size="lg">Your cart is empty</Heading>
            <Text color="fg.muted">Add products before continuing to checkout.</Text>
            <Button asChild alignSelf="start" colorPalette="green" size="lg">
              <RouterLink to="/">Browse products</RouterLink>
            </Button>
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  if (isLoading || !establishment) {
    return (
      <Card.Root
        maxW="xl"
        mx="auto"
        mt={{ base: 8, md: 16 }}
        borderRadius="3xl"
        borderWidth="1px"
        borderColor="blackAlpha.100"
        bg="white"
        boxShadow="sm"
      >
        <Card.Body p={{ base: 8, md: 10 }}>
          <VStack py={6} gap={4}>
            <Spinner size="xl" color="green.500" />
            <VStack gap={1}>
              <Heading size="md">Preparing checkout</Heading>
              <Text color="fg.muted" textAlign="center">
                We&apos;re loading the latest store and payment details.
              </Text>
            </VStack>
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  if (establishment.status === EstablishmentStatus.CLOSED) {
    return (
      <Card.Root maxW="2xl" mx="auto" borderRadius="3xl" borderWidth="1px" borderColor="blackAlpha.100" bg="white" boxShadow="sm">
        <Card.Body p={{ base: 6, md: 8 }}>
          <VStack align="stretch" gap={5}>
            <Heading size="lg">Store is currently closed</Heading>
            <Text color="fg.muted">This store is not accepting orders right now. Please check back later.</Text>
            <Button asChild alignSelf="start" colorPalette="green" size="lg">
              <RouterLink to="/">Back to store</RouterLink>
            </Button>
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  const supportsOnlinePayment =
    establishment.paymentMethods.includes(PaymentMethod.CARD) || establishment.paymentMethods.includes(PaymentMethod.BANCONTACT);

  return (
    <VStack align="stretch" gap={8}>
      <Box
        position="relative"
        overflow="hidden"
        borderRadius={{ base: '2xl', md: '3xl' }}
        borderWidth="1px"
        borderColor="blackAlpha.100"
        bg="linear-gradient(135deg, white 0%, green.50 55%, orange.50 100%)"
        px={{ base: 5, md: 8 }}
        py={{ base: 6, md: 8 }}
      >
        <Box
          position="absolute"
          top="-32px"
          right="-24px"
          boxSize={{ base: 24, md: 32 }}
          borderRadius="full"
          bg="whiteAlpha.700"
          filter="blur(6px)"
        />

        <VStack align="stretch" gap={5} position="relative">
          <Button variant="ghost" alignSelf="start" onClick={() => navigate('/cart')} px={0} _hover={{ bg: 'transparent', color: 'green.700' }}>
            <ArrowLeft size={16} />
            Back to cart
          </Button>

          <VStack align="start" gap={2}>
            <Heading size="2xl">Checkout</Heading>
            <Text color="fg.muted" maxW="2xl">
              Confirm your order, add delivery and billing details, and finish payment in a cleaner production-style flow.
            </Text>
          </VStack>

          <HStack gap={3} wrap="wrap">
            <HStack gap={2} px={3} py={2} borderRadius="full" bg="whiteAlpha.800" borderWidth="1px" borderColor="blackAlpha.100">
              <Store size={16} />
              <Text fontSize="sm" fontWeight="medium">
                {establishment.name}
              </Text>
            </HStack>
            <HStack gap={2} px={3} py={2} borderRadius="full" bg="whiteAlpha.800" borderWidth="1px" borderColor="blackAlpha.100">
              <Clock3 size={16} />
              <Text fontSize="sm" fontWeight="medium">
                Ready for pickup or delivery details
              </Text>
            </HStack>
            <HStack gap={2} px={3} py={2} borderRadius="full" bg="whiteAlpha.800" borderWidth="1px" borderColor="blackAlpha.100">
              <ShieldCheck size={16} />
              <Text fontSize="sm" fontWeight="medium">
                {supportsOnlinePayment ? 'Online payment supported' : 'Pay at collection'}
              </Text>
            </HStack>
          </HStack>
        </VStack>
      </Box>

      {error && (
        <Alert.Root status="error" borderRadius="2xl">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Checkout failed</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      <Grid templateColumns={{ base: '1fr', xl: 'minmax(0, 420px) minmax(0, 1fr)' }} gap={{ base: 6, xl: 8 }} alignItems="start">
        <GridItem order={{ base: 2, xl: 1 }}>
          <VStack align="stretch" gap={4} position={{ xl: 'sticky' }} top={{ xl: 6 }}>
            <OrderSummary items={items} total={total} readOnly />
            <Card.Root borderRadius="2xl" borderWidth="1px" borderColor="blackAlpha.100" bg="white" boxShadow="sm">
              <Card.Body p={5}>
                <VStack align="stretch" gap={3}>
                  <Text fontWeight="semibold">Before you place the order</Text>
                  <Text color="fg.muted" fontSize="sm">
                    Double-check your contact details and payment method. You&apos;ll be redirected automatically for supported online payments.
                  </Text>
                </VStack>
              </Card.Body>
            </Card.Root>
          </VStack>
        </GridItem>

        <GridItem order={{ base: 1, xl: 2 }}>
          <CheckoutForm establishment={establishment} onSubmit={handleSubmit} isSubmitting={isSubmitting} profile={profile} />
        </GridItem>
      </Grid>
    </VStack>
  );
}
