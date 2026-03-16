import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Flex, VStack, HStack, Text, Heading, Separator } from '@chakra-ui/react';
import { Switch } from '@chakra-ui/react';
import {
  ShoppingCart,
  PackagePlus,
  Package,
  BarChart3,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { enableNotification, disableNotification } from '../../store/slices/generalSettingsSlice';
import type { ReactNode } from 'react';

const SIDEBAR_WIDTH = 260;

interface NavItem {
  path: string;
  label: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { path: '/orders', label: 'Orders', icon: <ShoppingCart size={20} /> },
  { path: '/products', label: 'Products', icon: <Package size={20} /> },
  { path: '/products/new', label: 'Add Product', icon: <PackagePlus size={20} /> },
  { path: '/analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const dispatch = useAppDispatch();
  const isSoundEnabled = useAppSelector((s) => s.generalSettings.isSoundEnabled);

  const handleSoundToggle = () => {
    dispatch(isSoundEnabled ? disableNotification() : enableNotification());
  };

  return (
    <Flex minH="100vh">
      <Box
        as="nav"
        w={`${SIDEBAR_WIDTH}px`}
        bg="gray.50"
        borderRight="1px solid"
        borderColor="gray.200"
        position="fixed"
        top={0}
        left={0}
        h="100vh"
        display="flex"
        flexDirection="column"
      >
        <Box p={5}>
          <Heading size="lg" color="purple.600">MercaShop</Heading>
        </Box>

        <Separator />

        <VStack gap={1} p={3} flex={1} align="stretch">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <HStack
                key={item.path}
                gap={3}
                px={3}
                py={2}
                borderRadius="md"
                cursor="pointer"
                bg={isActive ? 'purple.50' : 'transparent'}
                color={isActive ? 'purple.700' : 'gray.700'}
                fontWeight={isActive ? 'semibold' : 'normal'}
                _hover={{ bg: isActive ? 'purple.50' : 'gray.100' }}
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                <Text fontSize="sm">{item.label}</Text>
              </HStack>
            );
          })}
        </VStack>

        <Separator />

        <VStack gap={3} p={4} align="stretch">
          <Switch.Root
            checked={isSoundEnabled}
            onCheckedChange={handleSoundToggle}
            size="sm"
          >
            <Switch.HiddenInput />
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            <Switch.Label>
              <Text fontSize="sm" color="gray.600">Sound notifications</Text>
            </Switch.Label>
          </Switch.Root>

          <HStack
            gap={3}
            px={3}
            py={2}
            borderRadius="md"
            cursor="pointer"
            color="gray.600"
            _hover={{ bg: 'gray.100', color: 'red.600' }}
            onClick={logout}
          >
            <LogOut size={20} />
            <Text fontSize="sm">Sign out</Text>
          </HStack>
        </VStack>
      </Box>

      <Box as="main" flex={1} ml={`${SIDEBAR_WIDTH}px`} p={6}>
        {children}
      </Box>
    </Flex>
  );
}
