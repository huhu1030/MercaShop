import { Box, Button, Circle, Flex, Heading, IconButton, Separator, Text, VStack } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { sidebarExpandedAtom } from '../lib/sidebar-store';

export function CartSidebar() {
  const { items, total, itemCount } = useCart();
  const [expanded, setExpanded] = useAtom(sidebarExpandedAtom);
  const navigate = useNavigate();

  return (
    <Box
      flexShrink={0}
      flexBasis={expanded ? '300px' : '48px'}
      transition="flex-basis 0.2s ease"
      overflow="hidden"
      borderRadius="2xl"
      borderWidth="1px"
      borderColor="blackAlpha.100"
      bg="bg.panel"
      boxShadow="sm"
      position="sticky"
      top={0}
      alignSelf="flex-start"
      maxH="calc(100dvh - 120px)"
    >
      {expanded ? (
        <VStack align="stretch" gap={0} h="full">
          <Flex align="center" justify="space-between" px={4} py={3}>
            <Flex align="center" gap={2}>
              <Heading size="md">Cart</Heading>
              <Circle size="22px" bg="blackAlpha.100" fontSize="xs" fontWeight="semibold">
                {itemCount}
              </Circle>
            </Flex>
            <IconButton
              aria-label="Collapse cart"
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(false)}
            >
              <ChevronRight />
            </IconButton>
          </Flex>

          <Separator />

          <Box overflowY="auto" flex="1" px={4} py={2}>
            {items.length === 0 ? (
              <Text color="fg.muted" fontSize="sm" py={4} textAlign="center">
                Your cart is empty
              </Text>
            ) : (
              <VStack align="stretch" gap={2}>
                {items.map((item) => (
                  <Flex key={item._id} justify="space-between" align="center" py={1}>
                    <VStack align="start" gap={0}>
                      <Text fontSize="sm" fontWeight="medium" lineClamp={1}>
                        {item.name}
                      </Text>
                      <Text fontSize="xs" color="fg.muted">
                        x{item.quantity}
                      </Text>
                    </VStack>
                    <Text fontSize="sm" fontWeight="semibold" flexShrink={0} ml={2}>
                      €{(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </Flex>
                ))}
              </VStack>
            )}
          </Box>

          <Separator />

          <VStack align="stretch" gap={3} px={4} py={3}>
            <Flex justify="space-between" align="center">
              <Text fontWeight="semibold">Total</Text>
              <Text fontWeight="bold">€{total.toFixed(2)}</Text>
            </Flex>
            <Button
              colorPalette="green"
              disabled={items.length === 0}
              onClick={() => navigate('/checkout')}
              width="full"
            >
              Checkout
            </Button>
          </VStack>
        </VStack>
      ) : (
        <VStack align="center" gap={3} py={3} h="full">
          <IconButton
            aria-label="Expand cart"
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(true)}
          >
            <ChevronLeft />
          </IconButton>
          <Box position="relative">
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <Circle
                size="16px"
                bg="green.500"
                color="white"
                fontSize="10px"
                fontWeight="bold"
                position="absolute"
                top="-6px"
                right="-8px"
              >
                {itemCount}
              </Circle>
            )}
          </Box>
        </VStack>
      )}
    </Box>
  );
}
