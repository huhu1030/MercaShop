import { Box, Button, Card, HStack, IconButton, Image, Text, VStack } from '@chakra-ui/react';
import { Minus, Plus } from 'lucide-react';
import type { IPublicProduct } from '@mercashop/shared';
import { useState } from 'react';
import { useCart } from '../hooks/useCart';

interface ProductCardProps {
  product: IPublicProduct;
}

function getProductImageUrl(photo?: string) {
  if (!photo) return null;
  if (photo.startsWith('http://') || photo.startsWith('https://')) {
    return photo;
  }

  const basePath = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? '';
  const assetPath = photo.startsWith('/') ? photo : `/${photo}`;
  return `${basePath}${assetPath}`;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-BE', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const imageUrl = getProductImageUrl(product.photo);
  const [quantity, setQuantity] = useState(1);

  return (
    <Card.Root overflow="hidden" h="100%" borderRadius="2xl" borderWidth="1px" borderColor="blackAlpha.100" bg="white" boxShadow="sm">
      {imageUrl ? (
        <Image src={imageUrl} alt={product.name} h={{ base: '160px', md: '180px' }} w="100%" objectFit="cover" />
      ) : (
        <Box h={{ base: '160px', md: '180px' }} bgGradient="linear(to-br, blackAlpha.100, blackAlpha.200)" />
      )}

      <Card.Body>
        <VStack align="stretch" gap={3}>
          <VStack align="stretch" gap={1}>
            <Text fontSize="lg" fontWeight="semibold" lineClamp={1}>
              {product.name}
            </Text>
            <Text color="fg.muted" minH="3rem" lineClamp={2}>
              {product.description ?? 'Freshly prepared and ready to order.'}
            </Text>
          </VStack>

          <Text fontSize="xl" fontWeight="bold">
            {formatPrice(product.price)}
          </Text>
        </VStack>
      </Card.Body>

      <Card.Footer pt={0}>
        <VStack width="full" align="stretch" gap={3}>
          <HStack justify="space-between">
            <Text fontSize="sm" color="fg.muted">
              Quantity
            </Text>
            <HStack gap={2}>
              <IconButton
                aria-label={`Decrease quantity for ${product.name}`}
                size="sm"
                variant="outline"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              >
                <Minus size={16} />
              </IconButton>
              <Text minW="6" textAlign="center" fontWeight="semibold">
                {quantity}
              </Text>
              <IconButton
                aria-label={`Increase quantity for ${product.name}`}
                size="sm"
                variant="outline"
                onClick={() => setQuantity((current) => current + 1)}
              >
                <Plus size={16} />
              </IconButton>
            </HStack>
          </HStack>

          <Button width="full" colorPalette="green" onClick={() => addItem(product, quantity)}>
            Add {quantity} to cart
          </Button>
        </VStack>
      </Card.Footer>
    </Card.Root>
  );
}
