import { Box, Circle, IconButton, useBreakpointValue } from '@chakra-ui/react'
import { ShoppingCart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../hooks/useCart'

interface CartIconProps {
  onDesktopOpen: () => void
}

export function CartIcon({ onDesktopOpen }: CartIconProps) {
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false

  return (
    <Box position="relative">
      <IconButton
        aria-label="Open cart"
        variant="ghost"
        color="currentColor"
        onClick={() => {
          if (isMobile) {
            navigate('/cart')
            return
          }

          onDesktopOpen()
        }}
      >
        <ShoppingCart size={20} />
      </IconButton>

      {itemCount > 0 && (
        <Circle
          size="5"
          position="absolute"
          top="-1"
          right="-1"
          bg="white"
          color="black"
          fontSize="xs"
          fontWeight="bold"
        >
          {itemCount}
        </Circle>
      )}
    </Box>
  )
}
