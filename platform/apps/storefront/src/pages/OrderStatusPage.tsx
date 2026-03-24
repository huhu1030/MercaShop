import { Badge, Box, Button, HStack, Separator, Spinner, Steps, Text, useBreakpointValue, VStack } from '@chakra-ui/react';
import { OrderStatus } from '@mercashop/shared';
import { getPaymentApi } from '@mercashop/shared/api-client';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';

const orderSteps = [OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.DELIVERED];

function formatLabel(value: string) {
  return value.replace(/_/g, ' ');
}

function normalizeStatus(status?: string): OrderStatus {
  if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
    return status as OrderStatus;
  }

  return OrderStatus.PENDING;
}

function statusColor(status: OrderStatus) {
  switch (status) {
    case OrderStatus.DELIVERED:
      return 'green';
    case OrderStatus.CANCELLED:
      return 'red';
    case OrderStatus.READY:
      return 'teal';
    default:
      return 'orange';
  }
}

export function OrderStatusPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const stepsOrientation = useBreakpointValue({ base: 'vertical', md: 'horizontal' }) ?? 'vertical';
  const [liveStatus, setLiveStatus] = useState<OrderStatus | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['order-status', orderId],
    queryFn: async () => {
      const response = await getPaymentApi().getPaymentStatus(orderId!);
      return response.data.order as Record<string, any>;
    },
    enabled: Boolean(orderId),
  });

  useEffect(() => {
    if (!orderId) return;

    const socket = io(import.meta.env.VITE_API_URL, {
      transports: ['websocket'],
    });

    socket.emit('join-order', orderId);
    socket.on('order-updated', (payload: { status?: string }) => {
      if (payload.status) {
        setLiveStatus(normalizeStatus(payload.status));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId]);

  const order = data;
  const status = liveStatus ?? normalizeStatus(order?.status);
  const currentStep = useMemo(() => {
    if (status === OrderStatus.CANCELLED) {
      return 0;
    }

    const index = orderSteps.indexOf(status);
    return index >= 0 ? index : 0;
  }, [status]);

  if (isLoading) {
    return (
      <VStack py={20}>
        <Spinner size="xl" />
      </VStack>
    );
  }

  if (error || !order) {
    return (
      <VStack align="stretch" gap={4}>
        <Text fontSize="lg" fontWeight="semibold">
          Unable to load order status.
        </Text>
        <Button asChild alignSelf="start" variant="outline">
          <RouterLink to="/">Back to catalog</RouterLink>
        </Button>
      </VStack>
    );
  }

  return (
    <VStack align="stretch" gap={6} maxW="3xl" mx="auto" w="100%">
      <VStack align="start" gap={2}>
        <Text fontSize="3xl" fontWeight="bold">
          Order #{String(order._id).slice(-6).toUpperCase()}
        </Text>
        <HStack>
          <Badge colorPalette={statusColor(status)} px={3} py={1} borderRadius="full">
            {formatLabel(status)}
          </Badge>
          <Badge variant="outline" px={3} py={1} borderRadius="full">
            Payment {formatLabel(String(order.paymentStatus ?? 'PENDING'))}
          </Badge>
        </HStack>
      </VStack>

      <Box p={5} borderWidth="1px" borderColor="blackAlpha.100" borderRadius="2xl" bg="white" overflowX="hidden">
        <Steps.Root step={currentStep} count={orderSteps.length} orientation={stepsOrientation as 'vertical' | 'horizontal'}>
          <Steps.List>
            {orderSteps.map((step, index) => (
              <Steps.Item key={step} index={index}>
                <Steps.Indicator />
                <Steps.Title>{formatLabel(step)}</Steps.Title>
                <Steps.Separator />
              </Steps.Item>
            ))}
          </Steps.List>
        </Steps.Root>
      </Box>

      <Box p={5} borderWidth="1px" borderColor="blackAlpha.100" borderRadius="2xl" bg="white">
        <VStack align="stretch" gap={4}>
          <Text fontSize="xl" fontWeight="semibold">
            Order details
          </Text>

          {(order.orderLines ?? []).map((line: any, index: number) => (
            <VStack key={`${line.item?._id ?? index}`} align="stretch" gap={2}>
              <HStack justify="space-between">
                <Text>{line.item?.name}</Text>
                <Text>
                  {line.item?.quantity} x {line.item?.price ?? 0}
                </Text>
              </HStack>
              <Separator />
            </VStack>
          ))}

          <HStack justify="space-between">
            <Text fontWeight="semibold">Total</Text>
            <Text fontWeight="bold">{order.total}</Text>
          </HStack>

          {order.deliveryMethod && (
            <HStack justify="space-between">
              <Text fontWeight="semibold">Delivery method</Text>
              <Text>{order.deliveryMethod}</Text>
            </HStack>
          )}

          {order.deliveryAddress && (
            <VStack align="start" gap={1}>
              <Text fontWeight="semibold">Delivery address</Text>
              <Text color="fg.muted">
                {[
                  order.deliveryAddress.street,
                  order.deliveryAddress.number,
                  order.deliveryAddress.zipCode,
                  order.deliveryAddress.city,
                  order.deliveryAddress.municipality,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </Text>
              {order.deliveryAddress.comment && (
                <Text color="fg.muted" fontSize="sm">
                  Note: {order.deliveryAddress.comment}
                </Text>
              )}
            </VStack>
          )}

          {order.billingInformation && (
            <VStack align="start" gap={1}>
              <Text fontWeight="semibold">Contact information</Text>
              {order.billingInformation.name && <Text color="fg.muted">{order.billingInformation.name}</Text>}
              {order.billingInformation.email && <Text color="fg.muted">{order.billingInformation.email}</Text>}
              {order.billingInformation.phone && <Text color="fg.muted">{order.billingInformation.phone}</Text>}
            </VStack>
          )}
        </VStack>
      </Box>
    </VStack>
  );
}
