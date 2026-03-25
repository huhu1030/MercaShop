import { Box, Circle, IconButton } from '@chakra-ui/react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../hooks/useCart';

interface CartIconProps {
  onOpen: () => void;
}

export function CartIcon({ onOpen }: CartIconProps) {
  const { itemCount } = useCart();

  return (
    <Box position="relative">
      <IconButton
        _hover={{ bg: 'whiteAlpha.200' }}
        aria-label="Open cart"
        variant="ghost"
        color="currentColor"
        onClick={onOpen}
      >
        <ShoppingCart size={20} />
      </IconButton>

      {itemCount > 0 && (
        <Circle size="5" position="absolute" top="-1" right="-1" bg="white" color="black" fontSize="xs" fontWeight="bold">
          {itemCount}
        </Circle>
      )}
    </Box>
  );
}
