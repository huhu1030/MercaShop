import { Center, Heading, Text, VStack } from '@chakra-ui/react'

export function StoreNotFound() {
  return (
    <Center h="100vh">
      <VStack gap={4}>
        <Heading size="lg">Store not found</Heading>
        <Text color="fg.muted">This store does not exist or is unavailable.</Text>
      </VStack>
    </Center>
  )
}
