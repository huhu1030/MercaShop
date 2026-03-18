import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Box, Flex, VStack, HStack, Text, Heading, Separator } from '@chakra-ui/react';
import { Switch } from '@chakra-ui/react';
import {
  ShoppingCart,
  PackagePlus,
  Package,
  BarChart3,
  LogOut,
  ArrowLeftRight,
} from 'lucide-react';
import { useAtom } from 'jotai';
import { useAuth } from '../../hooks/useAuth';
import { isNotificationsEnabledAtom } from '../../store/atoms';
import { useOrderNotifications } from '../../hooks/useOrderNotifications';
import { useEstablishmentId } from '../../hooks/useEstablishmentId';
import { Colors } from '../../constants/colors';
import type { ReactNode } from 'react';

const SIDEBAR_WIDTH = '16.25rem';

interface NavItem {
  path: string;
  label: string;
  icon: ReactNode;
}

function getNavItems(establishmentId: string): NavItem[] {
  return [
    { path: `/establishments/${establishmentId}/orders`, label: 'Orders', icon: <ShoppingCart size="1.25rem" /> },
    { path: `/establishments/${establishmentId}/products`, label: 'Products', icon: <Package size="1.25rem" /> },
    { path: `/establishments/${establishmentId}/products/new`, label: 'Add Product', icon: <PackagePlus size="1.25rem" /> },
    { path: `/establishments/${establishmentId}/analytics`, label: 'Analytics', icon: <BarChart3 size="1.25rem" /> },
  ];
}

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useAtom(isNotificationsEnabledAtom);

  useOrderNotifications(import.meta.env.VITE_API_URL);

  const result = useEstablishmentId();
  if (!result) return <Navigate to="/establishments" replace />;
  const { establishmentId } = result;
  const navItems = getNavItems(establishmentId);

  const handleNotificationToggle = async () => {
    if (!isNotificationsEnabled) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setIsNotificationsEnabled(true);
      }
      // If denied/dismissed, toggle stays off — user sees it didn't enable
    } else {
      setIsNotificationsEnabled(false);
    }
  };

  return (
    <Flex minH="100vh">
      <Box
        as="nav"
        w={SIDEBAR_WIDTH}
        bg={Colors.surface.background}
        borderRight="1px solid"
        borderColor={Colors.surface.sidebarBorder}
        position="fixed"
        top={0}
        left={0}
        h="100vh"
        display="flex"
        flexDirection="column"
      >
        <Box p="1.25rem">
          <Heading size="lg" color={Colors.brand.primary}>MercaShop</Heading>
          <HStack
            gap="0.5rem"
            cursor="pointer"
            color={Colors.text.muted}
            _hover={{ color: Colors.brand.primary }}
            onClick={() => navigate('/establishments')}
          >
            <ArrowLeftRight size="0.875rem" />
            <Text fontSize="xs">Switch establishment</Text>
          </HStack>
        </Box>

        <Separator />

        <VStack gap="0.25rem" p="0.75rem" flex={1} align="stretch">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <HStack
                key={item.path}
                gap="0.75rem"
                px="0.75rem"
                py="0.5rem"
                borderRadius="md"
                cursor="pointer"
                bg={isActive ? Colors.brand.activeBg : 'transparent'}
                color={isActive ? Colors.brand.activeText : Colors.text.primary}
                fontWeight={isActive ? 'semibold' : 'normal'}
                _hover={{ bg: isActive ? Colors.brand.activeBg : Colors.surface.hoverBg }}
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                <Text fontSize="sm">{item.label}</Text>
              </HStack>
            );
          })}
        </VStack>

        <Separator />

        <VStack gap="0.75rem" p="1rem" align="stretch">
          <Switch.Root
            checked={isNotificationsEnabled}
            onCheckedChange={() => void handleNotificationToggle()}
            size="sm"
          >
            <Switch.HiddenInput />
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            <Switch.Label>
              <Text fontSize="sm" color={Colors.text.secondary}>Order notifications</Text>
            </Switch.Label>
          </Switch.Root>

          <HStack
            gap="0.75rem"
            px="0.75rem"
            py="0.5rem"
            borderRadius="md"
            cursor="pointer"
            color={Colors.text.secondary}
            _hover={{ bg: Colors.surface.hoverBg, color: 'red.600' }}
            onClick={logout}
          >
            <LogOut size="1.25rem" />
            <Text fontSize="sm">Sign out</Text>
          </HStack>
        </VStack>
      </Box>

      <Box as="main" flex={1} ml={SIDEBAR_WIDTH} p="1.5rem">
        {children}
      </Box>
    </Flex>
  );
}
