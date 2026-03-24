import {
  Button,
  Card,
  Field,
  Input,
  Spinner,
  Tabs,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

interface SignInFormState {
  email: string
  password: string
}

interface SignUpFormState extends SignInFormState {
  firstName: string
  lastName: string
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Authentication failed'
}

export function LoginForm() {
  const { signIn, signInWithGoogle, signUp, loading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [signInForm, setSignInForm] = useState<SignInFormState>({
    email: '',
    password: '',
  })
  const [signUpForm, setSignUpForm] = useState<SignUpFormState>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  })

  const handleSignIn = async () => {
    setError(null)
    setIsSubmitting(true)

    try {
      await signIn(signInForm.email, signInForm.password)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignUp = async () => {
    setError(null)
    setIsSubmitting(true)

    try {
      await signUp(
        signUpForm.email,
        signUpForm.password,
        signUpForm.firstName,
        signUpForm.lastName,
      )
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    setIsSubmitting(true)

    try {
      await signInWithGoogle()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card.Root
      width="full"
      maxW="lg"
      borderRadius="3xl"
      boxShadow="xl"
      borderWidth="1px"
      borderColor="blackAlpha.100"
      overflow="hidden"
    >
      <Card.Header>
        <VStack align="start" gap={2}>
          <Text fontSize="2xl" fontWeight="bold">
            Welcome back
          </Text>
          <Text color="fg.muted">
            Sign in to continue to checkout or create a new account.
          </Text>
        </VStack>
      </Card.Header>

      <Card.Body>
        <Tabs.Root defaultValue="sign-in" variant="line">
          <Tabs.List mb={6}>
            <Tabs.Trigger value="sign-in">Sign In</Tabs.Trigger>
            <Tabs.Trigger value="sign-up">Sign Up</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="sign-in">
            <VStack align="stretch" gap={4}>
              <Field.Root required>
                <Field.Label>Email</Field.Label>
                <Input
                  type="email"
                  value={signInForm.email}
                  onChange={(event) =>
                    setSignInForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                />
              </Field.Root>

              <Field.Root required>
                <Field.Label>Password</Field.Label>
                <Input
                  type="password"
                  value={signInForm.password}
                  onChange={(event) =>
                    setSignInForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                />
              </Field.Root>

              <Button
                colorPalette="green"
                onClick={handleSignIn}
                disabled={isSubmitting || loading}
              >
                {isSubmitting ? <Spinner size="sm" /> : 'Sign In'}
              </Button>

              <Button
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting || loading}
              >
                Sign in with Google
              </Button>
            </VStack>
          </Tabs.Content>

          <Tabs.Content value="sign-up">
            <VStack align="stretch" gap={4}>
              <Field.Root required>
                <Field.Label>First name</Field.Label>
                <Input
                  value={signUpForm.firstName}
                  onChange={(event) =>
                    setSignUpForm((current) => ({
                      ...current,
                      firstName: event.target.value,
                    }))
                  }
                />
              </Field.Root>

              <Field.Root required>
                <Field.Label>Last name</Field.Label>
                <Input
                  value={signUpForm.lastName}
                  onChange={(event) =>
                    setSignUpForm((current) => ({
                      ...current,
                      lastName: event.target.value,
                    }))
                  }
                />
              </Field.Root>

              <Field.Root required>
                <Field.Label>Email</Field.Label>
                <Input
                  type="email"
                  value={signUpForm.email}
                  onChange={(event) =>
                    setSignUpForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                />
              </Field.Root>

              <Field.Root required>
                <Field.Label>Password</Field.Label>
                <Input
                  type="password"
                  value={signUpForm.password}
                  onChange={(event) =>
                    setSignUpForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                />
              </Field.Root>

              <Button
                colorPalette="green"
                onClick={handleSignUp}
                disabled={isSubmitting || loading}
              >
                {isSubmitting ? <Spinner size="sm" /> : 'Create Account'}
              </Button>
            </VStack>
          </Tabs.Content>
        </Tabs.Root>

        {error && (
          <Text mt={6} color="red.500">
            {error}
          </Text>
        )}
      </Card.Body>
    </Card.Root>
  )
}
