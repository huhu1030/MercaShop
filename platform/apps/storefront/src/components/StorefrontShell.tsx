import { Box, Flex, Heading, Image, Spacer, useDisclosure } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import type { ITenantBranding } from '@mercashop/shared'
import { CartDrawer } from './CartDrawer'
import { CartIcon } from './CartIcon'

interface StorefrontShellProps {
  branding: ITenantBranding
  children: ReactNode
}

export function StorefrontShell({ branding, children }: StorefrontShellProps) {
  const { open, onOpen, onClose } = useDisclosure()

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
        {branding.logo && (
          <Image
            src={`/branding/${branding.logo}`}
            alt={branding.appName}
            h="40px"
          />
        )}
        <Heading size="md">{branding.appName}</Heading>
        <Spacer />
        <CartIcon onDesktopOpen={onOpen} />
      </Flex>
      <Box as="main" p={6}>
        {children}
      </Box>
      <CartDrawer isOpen={open} onClose={onClose} />
    </Box>
  )
}
