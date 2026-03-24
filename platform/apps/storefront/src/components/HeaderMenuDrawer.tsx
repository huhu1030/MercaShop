import {
  Button,
  Drawer,
  HStack,
  Separator,
  Text,
  VStack,
} from '@chakra-ui/react'
import { ClipboardList, LogIn, LogOut, Store, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface HeaderMenuDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function HeaderMenuDrawer({ isOpen, onClose }: HeaderMenuDrawerProps) {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const navigate = useNavigate()

  const accountLabel = user?.displayName?.trim() || user?.email?.trim() || 'Guest'

  const goTo = (path: string) => {
    onClose()
    navigate(path)
  }

  return (
    <Drawer.Root
      open={isOpen}
      placement="start"
      onOpenChange={(details) => {
        if (!details.open) {
          onClose()
        }
      }}
    >
      <Drawer.Backdrop />
      <Drawer.Positioner>
        <Drawer.Content>
          <Drawer.Header>
            <HStack justify="space-between" align="start">
              <VStack align="start" gap={1}>
                <Drawer.Title>Menu</Drawer.Title>
                <Text color="fg.muted">
                  {loading ? 'Checking account status.' : isAuthenticated ? accountLabel : 'Browse and sign in to manage your orders.'}
                </Text>
              </VStack>
              <Drawer.CloseTrigger />
            </HStack>
          </Drawer.Header>

          <Drawer.Body>
            <VStack align="stretch" gap={3}>
              <Button justifyContent="start" variant="ghost" onClick={() => goTo('/')}>
                <Store size={18} />
                Menu
              </Button>

              <Button
                justifyContent="start"
                variant="ghost"
                onClick={() => goTo('/orders')}
              >
                <ClipboardList size={18} />
                Orders
              </Button>

              <Button
                justifyContent="start"
                variant="ghost"
                onClick={() => goTo('/profile')}
              >
                <UserRound size={18} />
                Account
              </Button>

              <Separator />

              {isAuthenticated ? (
                <Button
                  justifyContent="start"
                  variant="ghost"
                  colorPalette="red"
                  onClick={async () => {
                    await logout()
                    goTo('/')
                  }}
                >
                  <LogOut size={18} />
                  Logout
                </Button>
              ) : (
                <VStack align="stretch" gap={2}>
                  <Button
                    justifyContent="start"
                    variant="ghost"
                    onClick={() => goTo('/sign-in')}
                  >
                    <LogIn size={18} />
                    Sign in
                  </Button>
                  <Button
                    justifyContent="start"
                    variant="ghost"
                    onClick={() => goTo('/sign-up')}
                  >
                    <UserRound size={18} />
                    Sign up
                  </Button>
                </VStack>
              )}
            </VStack>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  )
}
