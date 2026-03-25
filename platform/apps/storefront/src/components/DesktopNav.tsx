import { Button, HStack } from '@chakra-ui/react';
import { Home, ShoppingBag, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export type NavVariant = 'pill' | 'underline' | 'icon-label';

const NAV_ITEMS = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Orders', path: '/orders', icon: ShoppingBag },
  { label: 'Account', path: '/profile', icon: User },
];

function PillNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <HStack gap={1}>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Button
            key={item.path}
            variant="ghost"
            color="currentColor"
            borderRadius="full"
            bg={isActive ? 'whiteAlpha.400' : 'whiteAlpha.200'}
            _hover={{ bg: isActive ? 'whiteAlpha.400' : 'whiteAlpha.300' }}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </Button>
        );
      })}
    </HStack>
  );
}

function UnderlineNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <HStack gap={1}>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Button
            key={item.path}
            variant="ghost"
            color="currentColor"
            bg="transparent"
            fontWeight={isActive ? 'bold' : 'normal'}
            textDecoration={isActive ? 'underline' : 'none'}
            textUnderlineOffset="6px"
            _hover={{
              bg: 'transparent',
              textDecoration: 'underline',
              textUnderlineOffset: '6px',
            }}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </Button>
        );
      })}
    </HStack>
  );
}

function IconLabelNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <HStack gap={1}>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.path;
        const Icon = item.icon;
        return (
          <Button
            key={item.path}
            variant="ghost"
            color="currentColor"
            borderRadius="md"
            px={3}
            py={1}
            bg={isActive ? 'whiteAlpha.300' : undefined}
            _hover={{ bg: isActive ? 'whiteAlpha.300' : 'whiteAlpha.200' }}
            onClick={() => navigate(item.path)}
          >
            <Icon size={16} />
            {item.label}
          </Button>
        );
      })}
    </HStack>
  );
}

interface DesktopNavProps {
  variant: NavVariant;
}

export function DesktopNav({ variant }: DesktopNavProps) {
  switch (variant) {
    case 'pill':
      return <PillNav />;
    case 'underline':
      return <UnderlineNav />;
    case 'icon-label':
      return <IconLabelNav />;
    default: {
      const _exhaustive: never = variant;
      return _exhaustive;
    }
  }
}
