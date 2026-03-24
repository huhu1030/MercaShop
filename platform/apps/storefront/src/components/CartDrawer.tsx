import { Button, Drawer, HStack, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { OrderSummary } from './OrderSummary';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();

  return (
    <Drawer.Root
      size={'lg'}
      open={isOpen}
      placement="end"
      onOpenChange={(details) => {
        if (!details.open) {
          onClose();
        }
      }}
    >
      <Drawer.Backdrop />
      <Drawer.Positioner>
        <Drawer.Content>
          <Drawer.Header>
            <HStack justify="space-between">
              <VStack align="start" gap={1}>
                <Drawer.Title>Cart</Drawer.Title>
                <Text color="fg.muted">Review your order before checkout.</Text>
              </VStack>
              <Drawer.CloseTrigger />
            </HStack>
          </Drawer.Header>

          <Drawer.Body>
            <OrderSummary items={items} total={total} />
          </Drawer.Body>

          <Drawer.Footer>
            <HStack width="full" justify="space-between">
              <Button variant="ghost" onClick={clearCart} disabled={items.length === 0}>
                Clear cart
              </Button>
              <Button
                colorPalette="green"
                onClick={() => {
                  onClose();
                  navigate('/checkout');
                }}
                disabled={items.length === 0}
              >
                Checkout
              </Button>
            </HStack>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  );
}
