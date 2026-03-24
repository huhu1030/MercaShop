import { Box, Button, Card, Field, Grid, GridItem, HStack, Input, RadioGroup, Spinner, Text, Textarea, VStack } from '@chakra-ui/react';
import { DeliveryMethod, PaymentMethod, type IBillingInformation, type IDeliveryAddress, type IPublicEstablishment } from '@mercashop/shared';
import { CreditCard, MapPin, UserRound } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import { PaymentMethodSelector } from './PaymentMethodSelector';

export interface CheckoutFormData {
  deliveryMethod: DeliveryMethod;
  deliveryAddress: IDeliveryAddress;
  billingInformation: IBillingInformation;
  paymentMethod: PaymentMethod;
}

interface CheckoutFormProps {
  establishment: IPublicEstablishment;
  onSubmit: (data: CheckoutFormData) => void | Promise<void>;
  isSubmitting: boolean;
}

function SectionCard({ icon, title, description, children }: { icon: ReactNode; title: string; description: string; children: ReactNode }) {
  return (
    <Card.Root borderRadius="2xl" borderWidth="1px" borderColor="blackAlpha.100" bg="white" boxShadow="sm" overflow="hidden">
      <Card.Body p={{ base: 5, md: 6 }}>
        <VStack align="stretch" gap={5}>
          <HStack align="start" gap={3}>
            <Box display="inline-flex" alignItems="center" justifyContent="center" boxSize={10} borderRadius="xl" bg="green.50" color="green.600">
              {icon}
            </Box>
            <VStack align="start" gap={1}>
              <Text fontSize="lg" fontWeight="semibold">
                {title}
              </Text>
              <Text color="fg.muted" fontSize="sm">
                {description}
              </Text>
            </VStack>
          </HStack>
          {children}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}

export function CheckoutForm({ establishment, onSubmit, isSubmitting }: CheckoutFormProps) {
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    defaultValues: {
      deliveryMethod: DeliveryMethod.PICKUP,
      deliveryAddress: {
        street: '',
        number: '',
        zipCode: '',
        city: '',
        municipality: '',
        comment: '',
      },
      billingInformation: {
        name: user?.displayName ?? '',
        email: user?.email ?? '',
        phone: '',
      },
      paymentMethod: establishment.paymentMethods[0] ?? PaymentMethod.CARD,
    },
  });

  const deliveryMethod = watch('deliveryMethod');
  const paymentMethod = watch('paymentMethod');

  useEffect(() => {
    setValue('billingInformation.email', user?.email ?? '');
    setValue('billingInformation.name', user?.displayName ?? '');
  }, [setValue, user?.displayName, user?.email]);

  useEffect(() => {
    if (!establishment.paymentMethods.includes(paymentMethod)) {
      setValue('paymentMethod', establishment.paymentMethods[0] ?? PaymentMethod.CARD);
    }
  }, [establishment.paymentMethods, paymentMethod, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack align="stretch" gap={6}>
        <SectionCard
          icon={<MapPin size={18} />}
          title="Delivery details"
          description="Choose how you want to receive the order and confirm the address when needed."
        >
          <Field.Root required invalid={!!errors.deliveryMethod}>
            <Field.Label>Delivery method</Field.Label>
            <RadioGroup.Root value={deliveryMethod} onValueChange={(details) => setValue('deliveryMethod', details.value as DeliveryMethod)}>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={3}>
                {[DeliveryMethod.PICKUP, DeliveryMethod.DELIVERY].map((method) => (
                  <RadioGroup.Item
                    key={method}
                    value={method}
                    p={4}
                    borderWidth="1px"
                    borderColor="blackAlpha.200"
                    borderRadius="xl"
                    bg="white"
                    _checked={{
                      borderColor: 'green.500',
                      bg: 'green.50',
                      boxShadow: '0 0 0 1px var(--chakra-colors-green-500)',
                    }}
                  >
                    <RadioGroup.ItemHiddenInput />
                    <HStack justify="space-between" align="start" gap={4}>
                      <VStack align="start" gap={1}>
                        <Text fontWeight="semibold">{method === DeliveryMethod.PICKUP ? 'Pickup' : 'Delivery'}</Text>
                        <Text color="fg.muted" fontSize="sm">
                          {method === DeliveryMethod.PICKUP
                            ? 'Collect your order from the establishment.'
                            : 'Have the order brought to your address.'}
                        </Text>
                      </VStack>
                      <RadioGroup.ItemControl />
                    </HStack>
                  </RadioGroup.Item>
                ))}
              </Grid>
            </RadioGroup.Root>
          </Field.Root>

          {deliveryMethod === DeliveryMethod.DELIVERY && (
            <VStack align="stretch" gap={4}>
              <Text fontSize="sm" fontWeight="medium" color="fg.muted">
                Delivery address
              </Text>

              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                <GridItem>
                  <Field.Root required invalid={!!errors.deliveryAddress?.street}>
                    <Field.Label>Street</Field.Label>
                    <Input placeholder="Main Street" {...register('deliveryAddress.street', { required: true })} />
                  </Field.Root>
                </GridItem>
                <GridItem>
                  <Field.Root required invalid={!!errors.deliveryAddress?.number}>
                    <Field.Label>Number</Field.Label>
                    <Input placeholder="12A" {...register('deliveryAddress.number', { required: true })} />
                  </Field.Root>
                </GridItem>
                <GridItem>
                  <Field.Root required invalid={!!errors.deliveryAddress?.zipCode}>
                    <Field.Label>Zip code</Field.Label>
                    <Input placeholder="1000" {...register('deliveryAddress.zipCode', { required: true })} />
                  </Field.Root>
                </GridItem>
                <GridItem>
                  <Field.Root required invalid={!!errors.deliveryAddress?.city}>
                    <Field.Label>City</Field.Label>
                    <Input placeholder="Brussels" {...register('deliveryAddress.city', { required: true })} />
                  </Field.Root>
                </GridItem>
                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <Field.Root required invalid={!!errors.deliveryAddress?.municipality}>
                    <Field.Label>Municipality</Field.Label>
                    <Input placeholder="Brussels" {...register('deliveryAddress.municipality', { required: true })} />
                  </Field.Root>
                </GridItem>
                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <Field.Root>
                    <Field.Label>Comment</Field.Label>
                    <Textarea placeholder="Door code, floor, delivery notes..." {...register('deliveryAddress.comment')} />
                  </Field.Root>
                </GridItem>
              </Grid>
            </VStack>
          )}
        </SectionCard>

        <SectionCard
          icon={<UserRound size={18} />}
          title="Billing information"
          description="Use the contact details we should attach to the order and payment."
        >
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
            <GridItem colSpan={{ base: 1, md: 2 }}>
              <Field.Root required invalid={!!errors.billingInformation?.name}>
                <Field.Label>Name</Field.Label>
                <Input placeholder="Your full name" {...register('billingInformation.name', { required: true })} />
              </Field.Root>
            </GridItem>
            <GridItem>
              <Field.Root required invalid={!!errors.billingInformation?.email}>
                <Field.Label>Email</Field.Label>
                <Input type="email" placeholder="name@example.com" {...register('billingInformation.email', { required: true })} />
              </Field.Root>
            </GridItem>
            <GridItem>
              <Field.Root required invalid={!!errors.billingInformation?.phone}>
                <Field.Label>Phone</Field.Label>
                <Input placeholder="+32 ..." {...register('billingInformation.phone', { required: true })} />
              </Field.Root>
            </GridItem>
          </Grid>
        </SectionCard>

        <SectionCard icon={<CreditCard size={18} />} title="Payment" description="Select the payment method supported by this establishment.">
          <Field.Root required>
            <Field.Label>Payment method</Field.Label>
            <PaymentMethodSelector
              methods={establishment.paymentMethods}
              value={paymentMethod}
              onChange={(method) => setValue('paymentMethod', method as PaymentMethod)}
            />
          </Field.Root>

          <Button type="submit" colorPalette="green" size="lg" disabled={isSubmitting} borderRadius="xl">
            {isSubmitting ? <Spinner size="sm" /> : 'Place order'}
          </Button>
        </SectionCard>
      </VStack>
    </form>
  );
}
