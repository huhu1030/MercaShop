import {useEffect} from 'react';
import {useQuery} from '@tanstack/react-query';
import {Badge, Card, HStack, Text, VStack,} from '@chakra-ui/react';
import {ShoppingCart} from 'lucide-react';
import {useWebSocket} from '../hooks/useWebSocket';
import {LoadingScreen} from '../components/ui/LoadingScreen';
import {EmptyState} from '../components/ui/EmptyState';
import {PageHeader} from '../components/ui/PageHeader';
import {getOrderApi} from '@mercashop/shared/api-client';
import {Colors} from '../constants/colors';
import {useEstablishmentId} from '../hooks/useEstablishmentId';

const statusColorMap: Record<string, string> = {
    pending: 'yellow',
    confirmed: 'blue',
    preparing: 'orange',
    ready: 'green',
    delivered: 'gray',
    cancelled: 'red',
};

export function OrdersPage() {
    const {establishmentId} = useEstablishmentId()!;
    const {data, isLoading, refetch} = useQuery({
        queryKey: ['orders', establishmentId],
        queryFn: () => getOrderApi().getOrdersByEstablishment(establishmentId),
    });

    const {onNewOrders} = useWebSocket(import.meta.env.VITE_API_URL);

    useEffect(() => {
        const cleanup = onNewOrders(() => {
            void refetch();
        });
        return cleanup;
    }, [onNewOrders, refetch]);

    if (isLoading) return <LoadingScreen/>;

    const orders = (data?.data?.orders ?? []) as Array<{
        _id: string;
        status: string;
        total: number;
        createdAt: string;
    }>;

    return (
        <VStack gap="1.25rem" align="stretch">
            <PageHeader
                breadcrumbs={[{label: 'Orders'}]}
                title="Orders"
                description="Manage and track incoming orders."
            />

            {orders.length === 0 ? (
                <EmptyState
                    icon={<ShoppingCart size="2.5rem"/>}
                    title="No orders yet"
                    description="Orders will appear here when customers place them."
                />
            ) : (
                <VStack gap="0.75rem" align="stretch">
                    {orders.map((order) => (
                        <Card.Root key={order._id} variant="outline">
                            <Card.Body>
                                <HStack justify="space-between">
                                    <VStack align="start" gap="0.25rem">
                                        <Text fontWeight="semibold">
                                            Order #{order._id.slice(-6).toUpperCase()}
                                        </Text>
                                        <Text fontSize="sm" color={Colors.text.muted}>
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </Text>
                                    </VStack>
                                    <VStack align="end" gap="0.25rem">
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
