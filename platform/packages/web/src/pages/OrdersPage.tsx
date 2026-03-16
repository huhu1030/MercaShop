import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  VStack,
  Heading,
  Card,
  Text,
  HStack,
  Badge,
} from '@chakra-ui/react';
import { ShoppingCart } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { EmptyState } from '../components/ui/EmptyState';
import { createApiConfiguration } from '../services/apiClientSetup';

interface Order {
  _id: string;
  status: string;
  total: number;
  createdAt: string;
}

interface OrdersResponse {
  orders: Order[];
}

const apiConfig = createApiConfiguration();

async function fetchOrders(restaurantId: string): Promise<OrdersResponse> {
  const res = await fetch(`${apiConfig.basePath}/commande/restaurant/${restaurantId}`, {
    headers: { Authorization: `Bearer ${await apiConfig.accessToken()}` },
  });
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json() as Promise<OrdersResponse>;
}

const statusColorMap: Record<string, string> = {
  pending: 'yellow',
  confirmed: 'blue',
  preparing: 'orange',
  ready: 'green',
  delivered: 'gray',
  cancelled: 'red',
};

export function OrdersPage() {
  const restaurantId = ''; // TODO: get from tenant/restaurateur context
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['orders', restaurantId],
    queryFn: () => fetchOrders(restaurantId),
    enabled: !!restaurantId,
  });

  const { onNewOrders } = useWebSocket(import.meta.env.VITE_API_URL);

  useEffect(() => {
    const cleanup = onNewOrders(() => { void refetch(); });
    return cleanup;
  }, [onNewOrders, refetch]);

  if (isLoading) return <LoadingScreen />;

  const orders = data?.orders ?? [];

  return (
    <VStack gap={5} align="stretch">
      <Heading size="lg">Orders</Heading>

      {orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart size={40} />}
          title="No orders yet"
          description="Orders will appear here when customers place them."
        />
      ) : (
        <VStack gap={3} align="stretch">
          {orders.map((order) => (
            <Card.Root key={order._id} variant="outline">
              <Card.Body>
                <HStack justify="space-between">
                  <VStack align="start" gap={1}>
                    <Text fontWeight="semibold">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </Text>
                  </VStack>
                  <VStack align="end" gap={1}>
                    <Badge colorPalette={statusColorMap[order.status] ?? 'gray'}>
                      {order.status}
                    </Badge>
                    <Text fontWeight="bold">&euro;{order.total.toFixed(2)}</Text>
                  </VStack>
                </HStack>
              </Card.Body>
            </Card.Root>
          ))}
        </VStack>
      )}
    </VStack>
  );
}
