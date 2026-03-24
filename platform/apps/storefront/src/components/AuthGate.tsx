import { Center, Spinner } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface AuthGateProps {
  children: ReactNode
}

export function AuthGate({ children }: AuthGateProps) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <Center py={20}>
        <Spinner size="xl" />
      </Center>
    )
  }

  if (!isAuthenticated) {
    const returnUrl = `${location.pathname}${location.search}`
    return (
      <Navigate
        to={`/login?returnUrl=${encodeURIComponent(returnUrl)}`}
        replace
      />
    )
  }

  return <>{children}</>
}
