import { Box, Button, HStack, Spinner, Text, VStack } from '@chakra-ui/react';
import { PaymentMethod } from '@mercashop/shared';
import { getPaymentApi } from '@mercashop/shared/api-client';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';

const REDIRECT_SECONDS = 10;
const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 5;

interface ConfirmationOrder {
  paymentMethod: string;
  isPaid: boolean;
  total: number;
  deliveryMethod: string;
}

function AnimatedCheckmark() {
  return (
    <Box boxSize={20}>
      <svg viewBox="0 0 52 52" width="100%" height="100%">
        <circle
          cx="26"
          cy="26"
          r="25"
          fill="none"
          stroke="var(--chakra-colors-green-500)"
          strokeWidth="2"
          style={{
            animation: 'circleScale 0.4s ease-out forwards',
            transformOrigin: 'center',
          }}
        />
        <path
          fill="none"
          stroke="var(--chakra-colors-green-500)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14 27l8 8 16-16"
          style={{
            strokeDasharray: 40,
            strokeDashoffset: 40,
            animation: 'checkDraw 0.4s ease-out 0.4s forwards',
          }}
        />
      </svg>
      <style>{`
        @keyframes circleScale {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes checkDraw {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </Box>
  );
}

type ConfirmationState = 'verifying' | 'success' | 'not-confirmed';

export function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);
  const [confirmationState, setConfirmationState] = useState<ConfirmationState>('verifying');
  const [pollExhausted, setPollExhausted] = useState(false);

  const { data: order } = useQuery({
    queryKey: ['order-confirmation', orderId],
    queryFn: async () => {
      const response = await getPaymentApi().getPaymentStatus(orderId!);
      return response.data.order as ConfirmationOrder;
    },
    enabled: Boolean(orderId),
    refetchInterval: (query) => {
      const orderData = query.state.data as ConfirmationOrder | undefined;
      if (!orderData) return POLL_INTERVAL_MS;

      const isCashPayment = orderData.paymentMethod === PaymentMethod.CASH;
      if (isCashPayment || orderData.isPaid === true) return false;

      if (query.state.dataUpdateCount >= MAX_POLL_ATTEMPTS) {
        setPollExhausted(true);
        return false;
      }

      return POLL_INTERVAL_MS;
    },
  });

  useEffect(() => {
    if (!order) return;

    const isCashPayment = order.paymentMethod === PaymentMethod.CASH;

    if (isCashPayment || order.isPaid === true) {
      setConfirmationState('success');
    } else if (pollExhausted) {
      setConfirmationState('not-confirmed');
    }
  }, [order, pollExhausted]);

  useEffect(() => {
    if (confirmationState !== 'success') return;

    if (countdown <= 0) {
      navigate(`/order/${orderId}/status`, { replace: true });
      return;
    }

    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [confirmationState, countdown, navigate, orderId]);

  const trackerPath = `/order/${orderId}/status`;
  const orderNumber = orderId ? orderId.slice(-6).toUpperCase() : '';

  function formatLabel(value: string) {
    return value.replace(/_/g, ' ');
  }

  if (confirmationState === 'verifying') {
    return (
      <VStack gap={6} maxW="3xl" mx="auto" w="100%" py={{ base: 10, md: 20 }}>
        <Box
          p={{ base: 8, md: 12 }}
          borderRadius="3xl"
          borderWidth="1px"
          borderColor="blackAlpha.100"
          bg="white"
          boxShadow="sm"
          w="100%"
        >
          <VStack gap={5}>
            <Spinner size="xl" color="green.500" />
            <Text fontSize="xl" fontWeight="semibold">
              Verifying your payment...
            </Text>
            <Text color="fg.muted" textAlign="center">
              Please wait while we confirm your payment with our provider.
            </Text>
          </VStack>
        </Box>
      </VStack>
    );
  }

  if (confirmationState === 'not-confirmed') {
    return (
      <VStack gap={6} maxW="3xl" mx="auto" w="100%" py={{ base: 10, md: 20 }}>
        <Box
          p={{ base: 8, md: 12 }}
          borderRadius="3xl"
          borderWidth="1px"
          borderColor="blackAlpha.100"
          bg="white"
          boxShadow="sm"
          w="100%"
        >
          <VStack gap={5}>
            <Box color="orange.500">
              <AlertTriangle size={48} />
            </Box>
            <Text fontSize="xl" fontWeight="semibold">
              Payment not yet confirmed
            </Text>
            <Text color="fg.muted" textAlign="center" maxW="md">
              Your payment is still being processed. You can track your order — it will update automatically once payment is
              confirmed.
            </Text>
            <HStack gap={3} pt={2}>
              <Button asChild colorPalette="green" size="lg">
                <RouterLink to={trackerPath}>Track my order</RouterLink>
              </Button>
              <Button asChild variant="outline" size="lg">
                <RouterLink to="/">Back to shop</RouterLink>
              </Button>
            </HStack>
          </VStack>
        </Box>
      </VStack>
    );
  }

  return (
    <VStack gap={6} maxW="3xl" mx="auto" w="100%" py={{ base: 10, md: 20 }}>
      <Box
        p={{ base: 8, md: 12 }}
        borderRadius="3xl"
        borderWidth="1px"
        borderColor="blackAlpha.100"
        bg="white"
        boxShadow="sm"
        w="100%"
      >
        <VStack gap={5}>
          <AnimatedCheckmark />
          <Text fontSize="2xl" fontWeight="bold">
            Order placed successfully!
          </Text>
          <Text fontSize="lg" color="fg.muted">
            Order #{orderNumber}
          </Text>

          {order && (
            <VStack gap={1} pt={2}>
              <HStack gap={2}>
                <Text color="fg.muted">Total:</Text>
                <Text fontWeight="semibold">&euro;{order.total.toFixed(2)}</Text>
              </HStack>
              <HStack gap={2}>
                <Text color="fg.muted">Delivery:</Text>
                <Text fontWeight="semibold">{formatLabel(order.deliveryMethod)}</Text>
              </HStack>
              <HStack gap={2}>
                <Text color="fg.muted">Payment:</Text>
                <Text fontWeight="semibold">{formatLabel(order.paymentMethod)}</Text>
              </HStack>
            </VStack>
          )}

          <HStack gap={3} pt={4}>
            <Button asChild colorPalette="green" size="lg">
              <RouterLink to={trackerPath}>Track my order</RouterLink>
            </Button>
            <Button asChild variant="outline" size="lg">
              <RouterLink to="/">Back to shop</RouterLink>
            </Button>
          </HStack>

          <Text fontSize="sm" color="fg.muted">
            Redirecting to order tracker in {countdown}s...
          </Text>
        </VStack>
      </Box>
    </VStack>
  );
}
