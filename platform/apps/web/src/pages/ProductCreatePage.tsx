import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  VStack,
  Heading,
  Box,
  Input,
  Button,
  Text,
  Field,
} from '@chakra-ui/react';
import { createApiConfiguration } from '../services/apiClientSetup';

interface ProductPayload {
  nom: string;
  category: string;
  prix: number;
  quantity: number;
  restaurant_id: string;
}

const apiConfig = createApiConfiguration();

async function createProduct(payload: ProductPayload): Promise<void> {
  const res = await fetch(`${apiConfig.basePath}/produit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await apiConfig.accessToken()}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create product');
}

export function ProductCreatePage() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      setName('');
      setCategory('');
      setPrice('');
      setQuantity('');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      nom: name,
      category,
      prix: parseFloat(price),
      quantity: parseInt(quantity, 10),
      restaurant_id: '', // TODO: get from tenant/restaurateur context
    });
  };

  return (
    <VStack gap={5} align="stretch" maxW="500px">
      <Heading size="lg">Add Product</Heading>

      {mutation.isSuccess && (
        <Box p={3} bg="green.50" borderRadius="md" borderLeft="4px solid" borderColor="green.500">
          <Text color="green.700" fontSize="sm">Product created successfully.</Text>
        </Box>
      )}

      {mutation.isError && (
        <Box p={3} bg="red.50" borderRadius="md" borderLeft="4px solid" borderColor="red.500">
          <Text color="red.700" fontSize="sm">Failed to create product. Please try again.</Text>
        </Box>
      )}

      <Box as="form" onSubmit={handleSubmit}>
        <VStack gap={4} align="stretch">
          <Field.Root required>
            <Field.Label>Product Name</Field.Label>
            <Input
              placeholder="e.g. Margherita Pizza"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field.Root>

          <Field.Root required>
            <Field.Label>Category</Field.Label>
            <Input
              placeholder="e.g. Pizza, Drinks"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </Field.Root>

          <Field.Root required>
            <Field.Label>Price (&euro;)</Field.Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </Field.Root>

          <Field.Root>
            <Field.Label>Quantity</Field.Label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </Field.Root>

          <Button
            type="submit"
            colorPalette="purple"
            loading={mutation.isPending}
            loadingText="Creating..."
          >
            Add Product
          </Button>
        </VStack>
      </Box>
    </VStack>
  );
}
