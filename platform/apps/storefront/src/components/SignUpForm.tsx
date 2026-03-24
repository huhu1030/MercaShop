import { Button, Card, Field, IconButton, Input, InputGroup, Spinner, Text, VStack } from '@chakra-ui/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface SignUpFormState {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Authentication failed';
}

export function SignUpForm() {
  const { signUp, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<SignUpFormState>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  const handleSignUp = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      await signUp(form.email, form.password, form.firstName, form.lastName);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card.Root width="full" maxW="lg" borderRadius="3xl" boxShadow="xl" borderWidth="1px" borderColor="blackAlpha.100" overflow="hidden">
      <Card.Header>
        <VStack align="start" gap={2}>
          <Text fontSize="2xl" fontWeight="bold">
            Create account
          </Text>
          <Text color="fg.muted">Register first, then continue ordering and manage your profile.</Text>
        </VStack>
      </Card.Header>

      <Card.Body>
        <VStack align="stretch" gap={4}>
          <Field.Root required>
            <Field.Label>First name</Field.Label>
            <Input
              value={form.firstName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  firstName: event.target.value,
                }))
              }
            />
          </Field.Root>

          <Field.Root required>
            <Field.Label>Last name</Field.Label>
            <Input
              value={form.lastName}
              onChange={(event) =>
                setForm((current) => ({
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
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
            />
          </Field.Root>

          <Field.Root required>
            <Field.Label>Password</Field.Label>
            <InputGroup
              endElement={
                <IconButton
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </IconButton>
              }
            >
              <Input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
              />
            </InputGroup>
          </Field.Root>

          <Button colorPalette="green" onClick={handleSignUp} disabled={isSubmitting || loading}>
            {isSubmitting ? <Spinner size="sm" /> : 'Create account'}
          </Button>

          <Text color="fg.muted" fontSize="sm">
            Already have an account? <RouterLink to="/sign-in">Sign in</RouterLink>.
          </Text>

          {error && <Text color="red.500">{error}</Text>}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
