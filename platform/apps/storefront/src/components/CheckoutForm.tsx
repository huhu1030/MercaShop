import { Box, Button, Card, Field, HStack, Grid, RadioGroup, Spinner, Text, Textarea, VStack } from '@chakra-ui/react';
import type { ICustomerProfile, IPublicEstablishment } from '@mercashop/shared';
import { DeliveryMethod, PaymentMethod } from '@mercashop/shared';
import { CreditCard, MapPin, MessageSquareText } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import { type BillingInfoCardRef, BillingInfoCard } from './BillingInfoCard';
import { type DeliveryAddressCardRef, DeliveryAddressCard } from './DeliveryAddressCard';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import humanizeString from 'humanize-string';

const deliveryMethods: string[] = Object.values(DeliveryMethod);

function isDeliveryMethod(value: string | null): value is DeliveryMethod {
  return value !== null && deliveryMethods.includes(value);
}

export interface CheckoutFormData {
  deliveryMethod: DeliveryMethod;
  deliveryAddress: import('@mercashop/shared').IDeliveryAddress;
  billingInformation: import('@mercashop/shared').IBillingInformation;
  paymentMethod: PaymentMethod;
  remark: string;
}

interface CheckoutFormProps {
  establishment: IPublicEstablishment;
  onSubmit: (data: CheckoutFormData) => void | Promise<void>;
  isSubmitting: boolean;
  profile?: ICustomerProfile;
}

interface CheckoutMetaForm {
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  remark: string;
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

export function CheckoutForm({ establishment, onSubmit, isSubmitting, profile }: CheckoutFormProps) {
  const { user } = useAuth();
  const billingRef = useRef<BillingInfoCardRef>(null);
  const deliveryRef = useRef<DeliveryAddressCardRef>(null);

  const metaForm = useForm<CheckoutMetaForm>({
    defaultValues: {
      deliveryMethod: DeliveryMethod.PICKUP,
      paymentMethod: establishment.paymentMethods[0] ?? PaymentMethod.CARD,
      remark: '',
    },
  });

  const deliveryMethod = metaForm.watch('deliveryMethod');
  const paymentMethod = metaForm.watch('paymentMethod');

  useEffect(() => {
    if (!establishment.paymentMethods.includes(paymentMethod)) {
      metaForm.setValue('paymentMethod', establishment.paymentMethods[0] ?? PaymentMethod.CARD);
    }
  }, [establishment.paymentMethods, paymentMethod, metaForm.setValue]);

  const billingDefaults = {
    name: profile?.billingInformation?.name || (user?.displayName ?? ''),
    email: profile?.billingInformation?.email || (user?.email ?? ''),
    phone: profile?.billingInformation?.phone ?? '',
    vatNumber: profile?.billingInformation?.vatNumber ?? '',
  };

  const handleSubmit = async (meta: CheckoutMetaForm) => {
    const billingValid = await billingRef.current?.trigger();
    const deliveryValid = meta.deliveryMethod === DeliveryMethod.DELIVERY ? await deliveryRef.current?.trigger() : true;

    if (!billingValid || !deliveryValid) return;

    await onSubmit({
      deliveryMethod: meta.deliveryMethod,
      paymentMethod: meta.paymentMethod,
      remark: meta.remark,
      billingInformation: billingRef.current!.getValues(),
      deliveryAddress: deliveryRef.current?.getValues() ?? {},
    });
  };

  return (
    <form onSubmit={metaForm.handleSubmit(handleSubmit)}>
      <VStack align="stretch" gap={6}>
        <SectionCard
          icon={<MapPin size={18} />}
          title="Delivery details"
          description="Choose how you want to receive the order and confirm the address when needed."
        >
          <Field.Root required invalid={Boolean(metaForm.formState.errors.deliveryMethod)}>
            <Field.Label>Delivery method</Field.Label>
            <RadioGroup.Root
              colorPalette={'green'}
              value={deliveryMethod}
              onValueChange={(details) => {
                if (isDeliveryMethod(details.value)) {
                  metaForm.setValue('deliveryMethod', details.value);
                }
              }}
            >
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={3}>
                {[DeliveryMethod.PICKUP, DeliveryMethod.DELIVERY].map((method) => (
                  <RadioGroup.Item
                    key={method}
                    value={method}
                    p={4}
                    borderWidth="1px"
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
                        <Text fontWeight="semibold">{humanizeString(method)}</Text>
                        <Text color="fg.muted" fontSize="sm">
                          {method === DeliveryMethod.PICKUP
                            ? 'Collect your order from the establishment.'
                            : 'Have the order brought to your address.'}
                        </Text>
                      </VStack>
                      <RadioGroup.ItemControl>
                        <RadioGroup.ItemIndicator />
                      </RadioGroup.ItemControl>
                    </HStack>
                  </RadioGroup.Item>
                ))}
              </Grid>
            </RadioGroup.Root>
          </Field.Root>

          {deliveryMethod === DeliveryMethod.DELIVERY && (
            <DeliveryAddressCard ref={deliveryRef} defaultValues={profile?.deliveryAddress} required />
          )}
        </SectionCard>

        <BillingInfoCard ref={billingRef} defaultValues={billingDefaults} required />

        <SectionCard
          icon={<MessageSquareText size={18} />}
          title="Order remark"
          description="Add a note for the establishment, e.g. special requests or delivery instructions."
        >
          <Field.Root>
            <Field.Label>Remark (optional)</Field.Label>
            <Textarea placeholder="Any special requests?" maxLength={200} {...metaForm.register('remark')} />
            <Text fontSize="xs" color="fg.muted" textAlign="right">
              {metaForm.watch('remark')?.length ?? 0}/200
            </Text>
          </Field.Root>
        </SectionCard>

        <SectionCard icon={<CreditCard size={18} />} title="Payment" description="Select the payment method supported by this establishment.">
          <Field.Root required>
            <Field.Label>Payment method</Field.Label>
            <PaymentMethodSelector
              methods={establishment.paymentMethods}
              value={paymentMethod}
              onChange={(method) => metaForm.setValue('paymentMethod', method as PaymentMethod)}
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
