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
import { createApiConfiguration } from '../services/apiClientSetup';

interface Product {
  _id: string;
  nom: string;
  category: string;
  prix: number;
  quantity: number;
}

interface ProductsResponse {
  products: Product[];
}

const apiConfig = createApiConfiguration();

async function fetchProducts(restaurantId: string): Promise<ProductsResponse> {
  const res = await fetch(`${apiConfig.basePath}/produit/restaurant/${restaurantId}`, {
    headers: { Authorization: `Bearer ${await apiConfig.accessToken()}` },
  });
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json() as Promise<ProductsResponse>;
}

export function ProductListPage() {
  const restaurantId = ''; // TODO: get from tenant/restaurateur context
  const { data, isLoading } = useQuery({
    queryKey: ['products', restaurantId],
    queryFn: () => fetchProducts(restaurantId),
    enabled: !!restaurantId,
  });

  if (isLoading) return <LoadingScreen />;

  const products = data?.products ?? [];

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
                    <Text fontWeight="medium">{product.nom}</Text>
                  </Table.Cell>
                  <Table.Cell>{product.category}</Table.Cell>
                  <Table.Cell textAlign="right">&euro;{product.prix.toFixed(2)}</Table.Cell>
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
