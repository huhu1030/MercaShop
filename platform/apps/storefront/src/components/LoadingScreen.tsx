import { Center, Spinner } from '@chakra-ui/react'

export function LoadingScreen() {
  return (
    <Center h="100vh">
      <Spinner size="xl" />
    </Center>
  )
}
