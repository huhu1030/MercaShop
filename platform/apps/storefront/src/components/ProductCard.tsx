import {
  Box,
  Button,
  Card,
  Image,
  Text,
  VStack,
} from '@chakra-ui/react'
import type { IPublicProduct } from '@mercashop/shared'
import { useCart } from '../hooks/useCart'

interface ProductCardProps {
  product: IPublicProduct
}

function getProductImageUrl(photo?: string) {
  if (!photo) return null
  if (photo.startsWith('http://') || photo.startsWith('https://')) {
    return photo
  }

  const basePath = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? ''
  const assetPath = photo.startsWith('/') ? photo : `/${photo}`
  return `${basePath}${assetPath}`
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-BE', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const imageUrl = getProductImageUrl(product.photo)

  return (
    <Card.Root
      overflow="hidden"
      h="100%"
      borderRadius="2xl"
      borderWidth="1px"
      borderColor="blackAlpha.100"
      bg="white"
      boxShadow="sm"
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={product.name}
          h="200px"
          w="100%"
          objectFit="cover"
        />
      ) : (
        <Box
          h="200px"
          bgGradient="linear(to-br, blackAlpha.100, blackAlpha.200)"
        />
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
        <Button
          width="full"
          colorPalette="green"
          onClick={() => addItem(product)}
        >
          Add to cart
        </Button>
      </Card.Footer>
    </Card.Root>
  )
}
