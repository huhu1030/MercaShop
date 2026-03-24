import {
  Badge,
  Button,
  Card,
  Center,
  HStack,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react'
import { getOrderApi } from '@mercashop/shared/api-client'
import { useQuery } from '@tanstack/react-query'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-BE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}

function formatStatus(value: string | undefined) {
  return String(value ?? 'pending')
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function statusColor(status: string | undefined) {
  switch (String(status ?? '').toUpperCase()) {
    case 'DELIVERED':
    case 'COMPLETED':
      return 'green'
    case 'CANCELLED':
    case 'FAILED':
      return 'red'
    case 'READY':
    case 'IN_PROGRESS':
      return 'orange'
    default:
      return 'blue'
  }
}

export function OrdersPage() {
  const { user } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ['orders', user?.uid],
    queryFn: async () => {
      const response = await getOrderApi().getOrdersByUser(user!.uid)
      return response.data.orders as Array<Record<string, any>>
    },
    enabled: !!user?.uid,
  })

  const orders = data ?? []

  if (isLoading) {
    return (
      <Center py={20}>
        <Spinner size="xl" />
      </Center>
    )
  }

  return (
    <VStack align="stretch" gap={6}>
      <VStack align="start" gap={2}>
        <Text fontSize="2xl" fontWeight="bold">
          Your orders
        </Text>
        <Text color="fg.muted">
          Track recent orders and reopen the live status view.
        </Text>
      </VStack>

      {orders.length === 0 ? (
        <Card.Root borderRadius="2xl">
          <Card.Body>
            <VStack align="start" gap={3}>
              <Text fontWeight="semibold">No orders yet.</Text>
              <Text color="fg.muted">
                Once you place an order, it will appear here.
              </Text>
              <Button asChild colorPalette="green">
                <RouterLink to="/">Browse menu</RouterLink>
              </Button>
            </VStack>
          </Card.Body>
        </Card.Root>
      ) : (
        <VStack align="stretch" gap={4}>
          {orders.map((order) => (
            <Card.Root key={String(order._id)} borderRadius="2xl">
              <Card.Body>
                <VStack align="stretch" gap={4}>
                  <HStack justify="space-between" align="start">
                    <VStack align="start" gap={1}>
                      <Text fontWeight="bold">Order #{String(order._id)}</Text>
                      <Text color="fg.muted" fontSize="sm">
                        {Array.isArray(order.orderLines) ? order.orderLines.length : 0} items
                      </Text>
                    </VStack>
                    <Badge colorPalette={statusColor(order.status)} borderRadius="full" px={3} py={1}>
                      {formatStatus(order.status)}
                    </Badge>
                  </HStack>

                  <HStack justify="space-between" align="center">
                    <Text fontWeight="semibold">
                      {formatCurrency(Number(order.total ?? 0))}
                    </Text>
                    <Button asChild variant="outline">
                      <RouterLink to={`/order/${String(order._id)}/status`}>
                        View status
                      </RouterLink>
                    </Button>
                  </HStack>
                </VStack>
              </Card.Body>
            </Card.Root>
          ))}
        </VStack>
      )}
    </VStack>
  )
}
