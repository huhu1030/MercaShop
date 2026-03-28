import { Badge, Box, Button, Card, Center, Collapsible, HStack, Separator, Spinner, Text, VStack } from '@chakra-ui/react';
import type { IOrderLine } from '@mercashop/shared';
import { OrderStatus } from '@mercashop/shared';
import { getOrderApi } from '@mercashop/shared/api-client';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { requestNotificationPermission } from '../lib/notifications';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-BE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

function formatStatus(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function statusColor(status: string) {
  switch (status) {
    case OrderStatus.DELIVERED:
      return 'green';
    case OrderStatus.CANCELLED:
      return 'red';
    case OrderStatus.READY:
      return 'teal';
    case OrderStatus.PREPARING:
    case OrderStatus.ACCEPTED:
      return 'orange';
    case OrderStatus.OUT_FOR_DELIVERY:
      return 'blue';
    default:
      return 'gray';
  }
}

interface Order {
  _id: string;
  status: string;
  total: number;
  orderLines: IOrderLine[];
  deliveryMethod?: string;
  deliveryAddress?: {
    street?: string;
    number?: string;
    zipCode?: string;
    city?: string;
    municipality?: string;
  };
  paymentMethod?: string;
  isPaid?: boolean;
  createdAt?: string;
  remark?: string;
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card.Root borderRadius="2xl">
      <Card.Body>
        <VStack align="stretch" gap={4}>
          <HStack justify="space-between" align="start">
            <VStack align="start" gap={1}>
              <Text fontWeight="bold">Order #{order._id.slice(-8)}</Text>
              <Text color="fg.muted" fontSize="sm">
                {order.orderLines.length} item{order.orderLines.length !== 1 ? 's' : ''} &middot; {formatCurrency(order.total)}
              </Text>
              {order.createdAt && (
                <Text color="fg.muted" fontSize="xs">
                  {new Date(order.createdAt).toLocaleString()}
                </Text>
              )}
            </VStack>
            <Badge colorPalette={statusColor(order.status)} borderRadius="full" px={3} py={1}>
              {formatStatus(order.status)}
            </Badge>
          </HStack>

          <HStack gap={2}>
            <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
              {expanded ? 'Hide details' : 'View details'}
            </Button>
            <Button asChild variant="outline" size="sm">
              <RouterLink to={`/order/${order._id}/status`}>Live status tracker</RouterLink>
            </Button>
          </HStack>

          <Collapsible.Root open={expanded}>
            <Collapsible.Content>
              <Box p={4} borderWidth="1px" borderColor="border.muted" borderRadius="xl" bg="bg.subtle">
                <VStack align="stretch" gap={3}>
                  <Text fontWeight="semibold">Order lines</Text>
                  {order.orderLines.map((line) => (
                    <VStack key={line.item._id} align="stretch" gap={1}>
                      <HStack justify="space-between">
                        <Text>{line.item.name}</Text>
                        <Text fontWeight="medium" whiteSpace="nowrap">
                          {line.item.quantity} x {formatCurrency(line.item.price ?? 0)}
                        </Text>
                      </HStack>
                      {line.item.selectedOptions && line.item.selectedOptions.length > 0 && (
                        <VStack align="stretch" gap={0.5} pl={4}>
                          {line.item.selectedOptions.map((group) => (
                            <VStack key={group.name} align="stretch" gap={0}>
                              <Text fontSize="xs" color="fg.muted" fontWeight="semibold">
                                {group.name}
                              </Text>
                              {group.choices.map((choice) => {
                                const qty = Number.isFinite(choice.quantity) && choice.quantity >= 1
                                  ? Math.floor(choice.quantity)
                                  : 1;
                                return (
                                <HStack key={choice.name} justify="space-between">
                                  <Text fontSize="xs" color="fg.muted">
                                    {qty > 1 ? `${qty}x ` : ''}
                                    {choice.name}
                                  </Text>
                                  {choice.extraPrice > 0 && (
                                    <Text fontSize="xs" color="fg.muted">
                                      +{formatCurrency(choice.extraPrice * qty)}
                                    </Text>
                                  )}
                                </HStack>
                                );
                              })}
                            </VStack>
                          ))}
                        </VStack>
                      )}
                    </VStack>
                  ))}

                  <Separator />

                  <HStack justify="space-between">
                    <Text fontWeight="semibold">Total</Text>
                    <Text fontWeight="bold">{formatCurrency(order.total)}</Text>
                  </HStack>

                  {order.deliveryMethod && (
                    <>
                      <Separator />
                      <HStack justify="space-between">
                        <Text fontWeight="semibold">Delivery</Text>
                        <Text>{formatStatus(order.deliveryMethod)}</Text>
                      </HStack>
                    </>
                  )}

                  {order.deliveryAddress && (
                    <VStack align="start" gap={1}>
                      <Text fontWeight="semibold">Address</Text>
                      <Text color="fg.muted" fontSize="sm">
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
                    </VStack>
                  )}

                  {order.paymentMethod && (
                    <>
                      <Separator />
                      <HStack justify="space-between">
                        <Text fontWeight="semibold">Payment</Text>
                        <HStack>
                          <Text>{order.paymentMethod}</Text>
                          <Badge colorPalette={order.isPaid ? 'green' : 'orange'} borderRadius="full" size="sm">
                            {order.isPaid ? 'Paid' : 'Unpaid'}
                          </Badge>
                        </HStack>
                      </HStack>
                    </>
                  )}

                  {order.remark && (
                    <>
                      <Separator />
                      <VStack align="start" gap={1}>
                        <Text fontWeight="semibold">Remark</Text>
                        <Text color="fg.muted" fontSize="sm">
                          {order.remark}
                        </Text>
                      </VStack>
                    </>
                  )}
                </VStack>
              </Box>
            </Collapsible.Content>
          </Collapsible.Root>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}

export function OrdersPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['orders', user?.uid],
    queryFn: async () => {
      const response = await getOrderApi().getOrdersByUser(user!.uid);
      return response.data.orders as Order[];
    },
    enabled: Boolean(user?.uid),
  });

  const orders = data ?? [];

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  if (isLoading) {
    return (
      <Center py={20}>
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <VStack align="stretch" gap={6}>
      <VStack align="start" gap={2}>
        <Text fontSize="2xl" fontWeight="bold">
          Your orders
        </Text>
        <Text color="fg.muted">View order details and track your orders.</Text>
      </VStack>

      {orders.length === 0 ? (
        <Card.Root borderRadius="2xl">
          <Card.Body>
            <VStack align="start" gap={3}>
              <Text fontWeight="semibold">No orders yet.</Text>
              <Text color="fg.muted">Once you place an order, it will appear here.</Text>
              <Button asChild colorPalette="green">
                <RouterLink to="/">Browse menu</RouterLink>
              </Button>
            </VStack>
          </Card.Body>
        </Card.Root>
      ) : (
        <VStack align="stretch" gap={4}>
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </VStack>
      )}
    </VStack>
  );
}
