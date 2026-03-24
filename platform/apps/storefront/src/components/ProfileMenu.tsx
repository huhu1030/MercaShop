import { Avatar, Box, Button, HStack, Menu, Portal, Spinner, Text } from '@chakra-ui/react';
import { ChevronDown, LogIn, LogOut, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function getProfileLabel(email: string | null | undefined, displayName: string | null | undefined) {
  if (displayName?.trim()) {
    return displayName;
  }

  if (email?.trim()) {
    return email;
  }

  return 'Account';
}

export function ProfileMenu() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const navigate = useNavigate();

  const profileLabel = getProfileLabel(user?.email, user?.displayName);
  const statusLabel = loading ? 'Checking account' : isAuthenticated ? 'Logged in' : 'Not signed in';

  return (
    <Menu.Root positioning={{ placement: 'bottom-end' }}>
      <Menu.Trigger asChild>
        <Button
          variant="ghost"
          color="currentColor"
          px={{ base: 2, md: 3 }}
          minW={0}
          aria-label={loading ? 'Checking account status' : isAuthenticated ? 'Open profile menu' : 'Open sign in menu'}
        >
          <HStack gap={2}>
            {loading ? (
              <Box display="flex" alignItems="center" justifyContent="center" boxSize="8" borderRadius="full" bg="whiteAlpha.300">
                <Spinner size="sm" color="currentColor" />
              </Box>
            ) : (
              <Avatar.Root size="sm" variant="subtle">
                <Avatar.Fallback name={isAuthenticated ? profileLabel : 'Guest'} bg="whiteAlpha.300" color="white" />
              </Avatar.Root>
            )}

            <Box display={{ base: 'none', md: 'block' }} textAlign="left">
              <Text fontSize="sm" fontWeight="semibold" lineHeight="short">
                {loading ? 'Account' : isAuthenticated ? profileLabel : 'Sign in'}
              </Text>
              <Text fontSize="xs" color="whiteAlpha.800" lineHeight="short">
                {statusLabel}
              </Text>
            </Box>

            <ChevronDown size={16} />
          </HStack>
        </Button>
      </Menu.Trigger>

      <Portal>
        <Menu.Positioner>
          <Menu.Content minW="220px">
            {isAuthenticated ? (
              <>
                <Box px={3} py={2}>
                  <Text fontSize="sm" fontWeight="semibold">
                    {profileLabel}
                  </Text>
                  {user?.email && (
                    <Text fontSize="xs" color="fg.muted">
                      {user.email}
                    </Text>
                  )}
                </Box>
                <Menu.Separator />
                <Menu.Item value="profile" onClick={() => navigate('/profile')}>
                  <UserRound size={16} />
                  <Box flex="1">Profile</Box>
                </Menu.Item>
                <Menu.Item
                  value="logout"
                  color="red.600"
                  onClick={async () => {
                    await logout();
                    navigate('/', { replace: true });
                  }}
                >
                  <LogOut size={16} />
                  <Box flex="1">Logout</Box>
                </Menu.Item>
              </>
            ) : (
              <Menu.Item value="login" onClick={() => navigate('/sign-in')}>
                <LogIn size={16} />
                <Box flex="1">Sign in</Box>
              </Menu.Item>
            )}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
