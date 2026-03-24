import {
  Button,
  Field,
  Grid,
  GridItem,
  Input,
  RadioGroup,
  Spinner,
  Textarea,
  VStack,
} from '@chakra-ui/react'
import {
  DeliveryMethod,
  PaymentMethod,
  type IBillingInformation,
  type IDeliveryAddress,
  type IPublicEstablishment,
} from '@mercashop/shared'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../hooks/useAuth'
import { PaymentMethodSelector } from './PaymentMethodSelector'

export interface CheckoutFormData {
  deliveryMethod: DeliveryMethod
  deliveryAddress: IDeliveryAddress
  billingInformation: IBillingInformation
  paymentMethod: PaymentMethod
}

interface CheckoutFormProps {
  establishment: IPublicEstablishment
  onSubmit: (data: CheckoutFormData) => void | Promise<void>
  isSubmitting: boolean
}

export function CheckoutForm({
  establishment,
  onSubmit,
  isSubmitting,
}: CheckoutFormProps) {
  const { user } = useAuth()
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
  })

  const deliveryMethod = watch('deliveryMethod')
  const paymentMethod = watch('paymentMethod')

  useEffect(() => {
    setValue('billingInformation.email', user?.email ?? '')
    setValue('billingInformation.name', user?.displayName ?? '')
  }, [setValue, user?.displayName, user?.email])

  useEffect(() => {
    if (!establishment.paymentMethods.includes(paymentMethod)) {
      setValue('paymentMethod', establishment.paymentMethods[0] ?? PaymentMethod.CARD)
    }
  }, [establishment.paymentMethods, paymentMethod, setValue])

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack align="stretch" gap={6}>
        <Field.Root required invalid={!!errors.deliveryMethod}>
          <Field.Label>Delivery method</Field.Label>
          <RadioGroup.Root
            value={deliveryMethod}
            onValueChange={(details) =>
              setValue('deliveryMethod', details.value as DeliveryMethod)
            }
          >
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={3}>
              {[DeliveryMethod.PICKUP, DeliveryMethod.DELIVERY].map((method) => (
                <RadioGroup.Item
                  key={method}
                  value={method}
                  p={4}
                  borderWidth="1px"
                  borderColor="blackAlpha.200"
                  borderRadius="xl"
                >
                  <RadioGroup.ItemHiddenInput />
                  <VStack align="start" gap={1}>
                    <Field.Label mb={0}>
                      {method === DeliveryMethod.PICKUP ? 'Pickup' : 'Delivery'}
                    </Field.Label>
                    <RadioGroup.ItemControl />
                  </VStack>
                </RadioGroup.Item>
              ))}
            </Grid>
          </RadioGroup.Root>
        </Field.Root>

        {deliveryMethod === DeliveryMethod.DELIVERY && (
          <VStack align="stretch" gap={4}>
            <Field.Root>
              <Field.Label>Delivery address</Field.Label>
            </Field.Root>

            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
              <GridItem>
                <Field.Root required invalid={!!errors.deliveryAddress?.street}>
                  <Field.Label>Street</Field.Label>
                  <Input {...register('deliveryAddress.street', { required: true })} />
                </Field.Root>
              </GridItem>
              <GridItem>
                <Field.Root required invalid={!!errors.deliveryAddress?.number}>
                  <Field.Label>Number</Field.Label>
                  <Input {...register('deliveryAddress.number', { required: true })} />
                </Field.Root>
              </GridItem>
              <GridItem>
                <Field.Root required invalid={!!errors.deliveryAddress?.zipCode}>
                  <Field.Label>Zip code</Field.Label>
                  <Input {...register('deliveryAddress.zipCode', { required: true })} />
                </Field.Root>
              </GridItem>
              <GridItem>
                <Field.Root required invalid={!!errors.deliveryAddress?.city}>
                  <Field.Label>City</Field.Label>
                  <Input {...register('deliveryAddress.city', { required: true })} />
                </Field.Root>
              </GridItem>
              <GridItem colSpan={{ base: 1, md: 2 }}>
                <Field.Root required invalid={!!errors.deliveryAddress?.municipality}>
                  <Field.Label>Municipality</Field.Label>
                  <Input {...register('deliveryAddress.municipality', { required: true })} />
                </Field.Root>
              </GridItem>
              <GridItem colSpan={{ base: 1, md: 2 }}>
                <Field.Root>
                  <Field.Label>Comment</Field.Label>
                  <Textarea {...register('deliveryAddress.comment')} />
                </Field.Root>
              </GridItem>
            </Grid>
          </VStack>
        )}

        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
          <GridItem colSpan={{ base: 1, md: 2 }}>
            <Field.Root required invalid={!!errors.billingInformation?.name}>
              <Field.Label>Name</Field.Label>
              <Input {...register('billingInformation.name', { required: true })} />
            </Field.Root>
          </GridItem>
          <GridItem>
            <Field.Root required invalid={!!errors.billingInformation?.email}>
              <Field.Label>Email</Field.Label>
              <Input
                type="email"
                {...register('billingInformation.email', { required: true })}
              />
            </Field.Root>
          </GridItem>
          <GridItem>
            <Field.Root required invalid={!!errors.billingInformation?.phone}>
              <Field.Label>Phone</Field.Label>
              <Input {...register('billingInformation.phone', { required: true })} />
            </Field.Root>
          </GridItem>
        </Grid>

        <Field.Root required>
          <Field.Label>Payment method</Field.Label>
          <PaymentMethodSelector
            methods={establishment.paymentMethods}
            value={paymentMethod}
            onChange={(method) => setValue('paymentMethod', method as PaymentMethod)}
          />
        </Field.Root>

        <Button type="submit" colorPalette="green" disabled={isSubmitting}>
          {isSubmitting ? <Spinner size="sm" /> : 'Place Order'}
        </Button>
      </VStack>
    </form>
  )
}
