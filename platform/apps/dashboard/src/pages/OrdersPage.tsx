import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Box, Button, Card, Collapsible, HStack, Input, Separator, Tabs, Text, VStack } from '@chakra-ui/react';
import { ShoppingCart } from 'lucide-react';
import { OrderStatus } from '@mercashop/shared';
import { useWebSocket } from '../hooks/useWebSocket';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { getOrderApi } from '@mercashop/shared/api-client';
import { Colors } from '../constants/colors';
import { useEstablishmentId } from '../hooks/useEstablishmentId';

const statusColorMap: Record<string, string> = {
  PENDING: 'yellow',
  ACCEPTED: 'blue',
  PREPARING: 'orange',
  READY: 'teal',
  OUT_FOR_DELIVERY: 'cyan',
  DELIVERED: 'green',
  CANCELLED: 'red',
};

function formatStatus(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-BE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

const STATUS_FLOW: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.ACCEPTED,
  OrderStatus.PREPARING,
  OrderStatus.READY,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.DELIVERED,
];

function getNextStatus(current: string): OrderStatus | null {
  const index = STATUS_FLOW.indexOf(current as OrderStatus);
  if (index < 0 || index >= STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[index + 1];
}

interface OrderLine {
  item?: {
    _id?: string;
    name?: string;
    quantity?: number;
    price?: number;
  };
}

interface Order {
  _id: string;
  status: string;
  total: number;
  orderLines: OrderLine[];
  deliveryMethod?: string;
  deliveryAddress?: {
    street?: string;
    number?: string;
    zipCode?: string;
    city?: string;
    municipality?: string;
  };
  billingInformation?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  paymentMethod?: string;
  isPaid?: boolean;
  createdAt: string;
  remark?: string;
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: async (newStatus: OrderStatus) => {
      const response = await getOrderApi().updateOrderStatus(order._id, { status: newStatus });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const nextStatus = getNextStatus(order.status);
  const isFinal = order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED;
  const canCancel = !isFinal;

  return (
    <Card.Root variant="outline">
      <Card.Body>
        <VStack align="stretch" gap="0.75rem">
          {/* Header row */}
          <HStack justify="space-between">
            <VStack align="start" gap="0.25rem">
              <Text fontWeight="semibold">Order #{order._id.slice(-6).toUpperCase()}</Text>
              <Text fontSize="sm" color={Colors.text.muted}>
                {new Date(order.createdAt).toLocaleString()}
              </Text>
            </VStack>
            <VStack align="end" gap="0.25rem">
              <Badge colorPalette={statusColorMap[order.status] ?? 'gray'}>{formatStatus(order.status)}</Badge>
              <Text fontWeight="bold">{formatCurrency(order.total)}</Text>
            </VStack>
          </HStack>

          {/* Status actions */}
          {!isFinal && (
            <HStack gap="0.5rem" flexWrap="wrap">
              {nextStatus && (
                <Button
                  size="sm"
                  colorPalette="purple"
                  loading={statusMutation.isPending}
                  onClick={() => statusMutation.mutate(nextStatus)}
                >
                  Mark as {formatStatus(nextStatus)}
                </Button>
              )}
              {canCancel && (
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="red"
                  loading={statusMutation.isPending}
                  onClick={() => statusMutation.mutate(OrderStatus.CANCELLED)}
                >
                  Cancel
                </Button>
              )}
            </HStack>
          )}

          {statusMutation.isError && (
            <Text color={Colors.feedback.errorText} fontSize="sm">
              Failed to update status. Please try again.
            </Text>
          )}

          {/* Expand/collapse */}
          <Button
            variant="ghost"
            size="sm"
            alignSelf="start"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Hide details' : 'View details'}
          </Button>

          <Collapsible.Root open={expanded}>
            <Collapsible.Content>
              <Box p="1rem" borderWidth="1px" borderColor="gray.200" borderRadius="lg" bg="gray.50">
                <VStack align="stretch" gap="0.5rem">
                  <Text fontWeight="semibold">Order lines</Text>
                  {order.orderLines.map((line, index) => (
                    <HStack key={line.item?._id ?? index} justify="space-between">
                      <Text>{line.item?.name ?? 'Unknown item'}</Text>
                      <Text fontWeight="medium" whiteSpace="nowrap">
                        {line.item?.quantity ?? 0} x {formatCurrency(line.item?.price ?? 0)}
                      </Text>
                    </HStack>
                  ))}

                  <Separator />

                  <HStack justify="space-between">
                    <Text fontWeight="semibold">Total</Text>
                    <Text fontWeight="bold">{formatCurrency(order.total)}</Text>
                  </HStack>

                  {order.billingInformation && (order.billingInformation.name || order.billingInformation.email || order.billingInformation.phone) && (
                    <>
                      <Separator />
                      <Text fontWeight="semibold">Customer</Text>
                      {order.billingInformation.name && (
                        <HStack justify="space-between">
                          <Text color={Colors.text.muted} fontSize="sm">Name</Text>
                          <Text fontSize="sm">{order.billingInformation.name}</Text>
                        </HStack>
                      )}
                      {order.billingInformation.email && (
                        <HStack justify="space-between">
                          <Text color={Colors.text.muted} fontSize="sm">Email</Text>
                          <Text fontSize="sm">{order.billingInformation.email}</Text>
                        </HStack>
                      )}
                      {order.billingInformation.phone && (
                        <HStack justify="space-between">
                          <Text color={Colors.text.muted} fontSize="sm">Phone</Text>
                          <Text fontSize="sm">{order.billingInformation.phone}</Text>
                        </HStack>
                      )}
                    </>
                  )}

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
                    <VStack align="start" gap="0.25rem">
                      <Text fontWeight="semibold">Address</Text>
                      <Text color={Colors.text.muted} fontSize="sm">
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
                          <Badge colorPalette={order.isPaid ? 'green' : 'orange'} size="sm">
                            {order.isPaid ? 'Paid' : 'Unpaid'}
                          </Badge>
                        </HStack>
                      </HStack>
                    </>
                  )}

                  {order.remark && (
                    <>
                      <Separator />
                      <VStack align="start" gap="0.25rem">
                        <Text fontWeight="semibold">Customer remark</Text>
                        <Text color={Colors.text.muted} fontSize="sm">
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

const ALL_TAB = 'ALL';
const TAB_STATUSES = [ALL_TAB, ...Object.values(OrderStatus)] as const;

function countByStatus(orders: Order[]): Record<string, number> {
  const counts: Record<string, number> = { [ALL_TAB]: orders.length };
  for (const status of Object.values(OrderStatus)) {
    counts[status] = 0;
  }
  for (const order of orders) {
    counts[order.status] = (counts[order.status] ?? 0) + 1;
  }
  return counts;
}

function OrderList({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <Text color={Colors.text.muted} py="2rem" textAlign="center">
        No orders with this status.
      </Text>
    );
  }

  return (
    <VStack gap="0.75rem" align="stretch">
      {orders.map((order) => (
        <OrderCard key={order._id} order={order} />
      ))}
    </VStack>
  );
}

export function OrdersPage() {
  const { establishmentId } = useEstablishmentId()!;
  const [activeTab, setActiveTab] = useState<string>(ALL_TAB);
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['orders', establishmentId],
    queryFn: () => getOrderApi().getOrdersByEstablishment(establishmentId),
  });

  const { onNewOrders } = useWebSocket(import.meta.env.VITE_API_URL);

  useEffect(() => {
    const cleanup = onNewOrders(() => {
      void refetch();
    });
    return cleanup;
  }, [onNewOrders, refetch]);

  if (isLoading) return <LoadingScreen />;

  const orders = (data?.data?.orders ?? []) as Order[];
  const searchTerm = search.trim().toLowerCase();
  const searchedOrders = searchTerm ? orders.filter((o) => o._id.toLowerCase().includes(searchTerm)) : orders;
  const counts = countByStatus(searchedOrders);
  const filteredOrders = activeTab === ALL_TAB ? searchedOrders : searchedOrders.filter((o) => o.status === activeTab);

  return (
    <VStack gap="1.25rem" align="stretch">
      <PageHeader breadcrumbs={[{ label: 'Orders' }]} title="Orders" description="Manage and track incoming orders." />

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by order ID"
        maxW="24rem"
      />

      {orders.length === 0 && !searchTerm ? (
        <EmptyState icon={<ShoppingCart size="2.5rem" />} title="No orders yet" description="Orders will appear here when customers place them." />
      ) : (
        <Tabs.Root value={activeTab} onValueChange={(e) => setActiveTab(e.value)} variant="line" colorPalette="purple">
          <Tabs.List flexWrap="wrap">
            {TAB_STATUSES.map((status) => (
              <Tabs.Trigger key={status} value={status}>
                {status === ALL_TAB ? 'All' : formatStatus(status)}
                <Badge
                  ml="0.375rem"
                  size="sm"
                  variant={activeTab === status ? 'solid' : 'subtle'}
                  colorPalette={status === ALL_TAB ? 'gray' : statusColorMap[status] ?? 'gray'}
                  borderRadius="full"
                >
                  {counts[status] ?? 0}
                </Badge>
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <Box mt="1rem">
            <OrderList orders={filteredOrders} />
          </Box>
        </Tabs.Root>
      )}
    </VStack>
  );
}
