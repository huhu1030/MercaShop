import { Box, Flex, Heading, Image } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import type { ITenantBranding } from '@mercashop/shared'

interface StorefrontShellProps {
  branding: ITenantBranding
  children: ReactNode
}

export function StorefrontShell({ branding, children }: StorefrontShellProps) {
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
      </Flex>
      <Box as="main" p={6}>
        {children}
      </Box>
    </Box>
  )
}
