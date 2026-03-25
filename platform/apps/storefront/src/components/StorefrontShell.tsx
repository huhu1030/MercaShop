import { Box, Button, Flex, Heading, HStack, Image, Spacer, Text, useDisclosure } from '@chakra-ui/react';
import { AlertTriangle, Menu as MenuIcon } from 'lucide-react';
import { ReactNode } from 'react';
import type { ITenantBranding } from '@mercashop/shared';
import { EstablishmentStatus } from '@mercashop/shared';
import { useLocation } from 'react-router-dom';
import { useEstablishment } from '../hooks/useEstablishment';
import { CartDrawer } from './CartDrawer';
import { CartIcon } from './CartIcon';
import type { NavVariant } from './DesktopNav';
import { DesktopNav } from './DesktopNav';
import { HeaderMenuDrawer } from './HeaderMenuDrawer';

const NAV_VARIANT: NavVariant = 'icon-label';

interface StorefrontShellProps {
  branding: ITenantBranding;
  children: ReactNode;
}

export function StorefrontShell({ branding, children }: StorefrontShellProps) {
  const location = useLocation();
  const { open: cartOpen, onOpen: onCartOpen, onClose: onCartClose } = useDisclosure();
  const { open: menuOpen, onOpen: onMenuOpen, onClose: onMenuClose } = useDisclosure();
  const isHomePage = location.pathname === '/';
  const { establishment } = useEstablishment();
  const isClosed = establishment?.status === EstablishmentStatus.CLOSED;

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
          <CartIcon onOpen={onCartOpen} />
        </HStack>
      </Flex>
      {isClosed && (
        <Flex align="center" justify="center" gap={2} px={6} py={3} bg="red.500" color="white" flexShrink={0}>
          <AlertTriangle size={16} />
          <Text fontSize="sm" fontWeight="medium">
            This store is currently closed. Orders cannot be placed at this time.
          </Text>
        </Flex>
      )}
      <Box as="main" p={6} flex="1" minH={0} overflowY={isHomePage ? 'hidden' : 'auto'}>
        {children}
      </Box>
      <HeaderMenuDrawer isOpen={menuOpen} onClose={onMenuClose} />
      <CartDrawer isOpen={cartOpen} onClose={onCartClose} />
    </Flex>
  );
}
