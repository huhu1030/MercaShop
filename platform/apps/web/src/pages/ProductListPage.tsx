import { useQuery } from '@tanstack/react-query';
import {
  VStack,
  Heading,
  Table,
  Text,
} from '@chakra-ui/react';
import { Package } from 'lucide-react';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { EmptyState } from '../components/ui/EmptyState';
import { api } from '../services/apiClientSetup';

export function ProductListPage() {
  const establishmentId = ''; // TODO: get from tenant/establishment context
  const { data, isLoading } = useQuery({
    queryKey: ['products', establishmentId],
    queryFn: () => api.getProductsByEstablishment({ establishmentId }),
    enabled: !!establishmentId,
  });

  if (isLoading) return <LoadingScreen />;

  const products = (data?.products ?? []) as Array<{
    _id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
  }>;

  return (
    <VStack gap={5} align="stretch">
      <Heading size="lg">Products</Heading>

      {products.length === 0 ? (
        <EmptyState
          icon={<Package size={40} />}
          title="No products yet"
          description="Add your first product to get started."
        />
      ) : (
        <Table.ScrollArea>
          <Table.Root variant="outline" size="md">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Name</Table.ColumnHeader>
                <Table.ColumnHeader>Category</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right">Price</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right">Qty</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {products.map((product) => (
                <Table.Row key={product._id}>
                  <Table.Cell>
                    <Text fontWeight="medium">{product.name}</Text>
                  </Table.Cell>
                  <Table.Cell>{product.category}</Table.Cell>
                  <Table.Cell textAlign="right">&euro;{product.price.toFixed(2)}</Table.Cell>
                  <Table.Cell textAlign="right">{product.quantity}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
      )}
    </VStack>
  );
}
