import { Heading, Text, VStack } from '@chakra-ui/react'

export function HomePage() {
  return (
    <VStack gap={4} align="start">
      <Heading>Welcome</Heading>
      <Text>Browse our products and place an order.</Text>
    </VStack>
  )
}
