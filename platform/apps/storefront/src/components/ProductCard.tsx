import { Box, Button, Card, HStack, IconButton, Image, Text, VStack } from '@chakra-ui/react';
import { Minus, Plus } from 'lucide-react';
import type { IPublicProduct } from '@mercashop/shared';
import { environment } from '@mercashop/shared/config/environment';
import { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { ProductOptionsDialog } from './ProductOptionsDialog';

interface ProductCardProps {
  product: IPublicProduct;
  disabled?: boolean;
}

function getProductImageUrl(photo?: string) {
  if (!photo) return null;
  if (photo.startsWith('http://') || photo.startsWith('https://')) {
    return photo;
  }

  const basePath = environment.API_URL.replace(/\/$/, '');
  const assetPath = photo.startsWith('/') ? photo : `/${photo}`;
  return `${basePath}${assetPath}`;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-BE', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
}

export function ProductCard({ product, disabled }: ProductCardProps) {
  const { addItem } = useCart();
  const imageUrl = getProductImageUrl(product.photo);
  const [quantity, setQuantity] = useState(1);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const hasOptions = product.optionGroups.length > 0;

  const handleAddToCart = () => {
    if (hasOptions) {
      setOptionsOpen(true);
      return;
    }

    addItem(
      {
        _id: product._id,
        name: product.name,
        price: product.price,
        photo: product.photo,
      },
      quantity,
    );
    setQuantity(1);
  };

  return (
    <>
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
              {hasOptions && (
                <Text as="span" fontSize="sm" fontWeight="normal" color="fg.muted" ml={1}>
                  + options
                </Text>
              )}
            </Text>
          </VStack>
        </Card.Body>

        <Card.Footer pt={0}>
          <VStack width="full" align="stretch" gap={3}>
            {!hasOptions && (
              <HStack justify="space-between">
                <Text fontSize="sm" color="fg.muted">
                  Quantity
                </Text>
                <HStack gap={2}>
                  <IconButton
                    aria-label={`Decrease quantity for ${product.name}`}
                    size="sm"
                    variant="outline"
                    disabled={disabled}
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
                    disabled={disabled}
                    onClick={() => setQuantity((current) => current + 1)}
                  >
                    <Plus size={16} />
                  </IconButton>
                </HStack>
              </HStack>
            )}

            <Button width="full" colorPalette="green" disabled={disabled} onClick={handleAddToCart}>
              {disabled
                ? 'Store closed'
                : hasOptions
                  ? 'Choose options'
                  : `Add ${quantity} to cart — ${formatPrice(product.price * quantity)}`}
            </Button>
          </VStack>
        </Card.Footer>
      </Card.Root>

      {hasOptions && (
        <ProductOptionsDialog
          product={product}
          isOpen={optionsOpen}
          onClose={() => setOptionsOpen(false)}
          disabled={disabled}
        />
      )}
    </>
  );
}
