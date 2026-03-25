import { Box, Button, Flex, Heading, HStack, Image, Spacer, useDisclosure } from '@chakra-ui/react';
import { Menu as MenuIcon } from 'lucide-react';
import { ReactNode } from 'react';
import type { ITenantBranding } from '@mercashop/shared';
import { useLocation } from 'react-router-dom';
import { CartDrawer } from './CartDrawer';
import { CartIcon } from './CartIcon';
import { DesktopNav, type NavVariant } from './DesktopNav';
import { HeaderMenuDrawer } from './HeaderMenuDrawer';

const NAV_VARIANT: NavVariant = 'pill';

interface StorefrontShellProps {
  branding: ITenantBranding;
  children: ReactNode;
}

export function StorefrontShell({ branding, children }: StorefrontShellProps) {
  const location = useLocation();
  const { open: cartOpen, onOpen: onCartOpen, onClose: onCartClose } = useDisclosure();
  const { open: menuOpen, onOpen: onMenuOpen, onClose: onMenuClose } = useDisclosure();
  const isHomePage = location.pathname === '/';

  return (
    <Flex direction="column" h="100dvh" overflow="hidden">
      <Flex as="header" align="center" gap={3} px={6} py={4} bg={branding.primaryColor} color="white" flexShrink={0}>
        <Box display={{ base: 'flex', md: 'none' }}>
          <Button variant="ghost" color="currentColor" onClick={onMenuOpen} _hover={{ bg: 'whiteAlpha.200' }}>
            <MenuIcon size={18} />
            MENU
          </Button>
        </Box>
        {branding.logo && <Image src={`/branding/${branding.logo}`} alt={branding.appName} h="40px" />}
        <Heading size="md">{branding.appName}</Heading>
        <Box display={{ base: 'none', md: 'flex' }}>
          <DesktopNav variant={NAV_VARIANT} />
        </Box>
        <Spacer />
        <HStack gap={1} align="center">
          <CartIcon onDesktopOpen={isHomePage ? undefined : onCartOpen} />
        </HStack>
      </Flex>
      <Box as="main" p={6} flex="1" minH={0} overflowY={isHomePage ? 'hidden' : 'auto'}>
        {children}
      </Box>
      <HeaderMenuDrawer isOpen={menuOpen} onClose={onMenuClose} />
      <CartDrawer isOpen={cartOpen} onClose={onCartClose} />
    </Flex>
  );
}
