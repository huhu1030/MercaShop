import { Box, Button, Flex, Heading, HStack, Image, Spacer, useDisclosure } from '@chakra-ui/react'
import { Menu as MenuIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import type { ITenantBranding } from '@mercashop/shared'
import { CartDrawer } from './CartDrawer'
import { CartIcon } from './CartIcon'
import { HeaderMenuDrawer } from './HeaderMenuDrawer'

interface StorefrontShellProps {
  branding: ITenantBranding
  children: ReactNode
}

export function StorefrontShell({ branding, children }: StorefrontShellProps) {
  const {
    open: cartOpen,
    onOpen: onCartOpen,
    onClose: onCartClose,
  } = useDisclosure()
  const {
    open: menuOpen,
    onOpen: onMenuOpen,
    onClose: onMenuClose,
  } = useDisclosure()

  return (
    <Box minH="100vh">
      <Flex
        as="header"
        align="center"
        gap={3}
        px={6}
        py={4}
        bg={branding.primaryColor}
        color="white"
      >
        <Button variant="ghost" color="currentColor" onClick={onMenuOpen}>
          <MenuIcon size={18} />
          MENU
        </Button>
        {branding.logo && (
          <Image
            src={`/branding/${branding.logo}`}
            alt={branding.appName}
            h="40px"
          />
        )}
        <Heading size="md">{branding.appName}</Heading>
        <Spacer />
        <HStack gap={1} align="center">
          <CartIcon onDesktopOpen={onCartOpen} />
        </HStack>
      </Flex>
      <Box as="main" p={6}>
        {children}
      </Box>
      <HeaderMenuDrawer isOpen={menuOpen} onClose={onMenuClose} />
      <CartDrawer isOpen={cartOpen} onClose={onCartClose} />
    </Box>
  )
}
