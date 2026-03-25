import { Field, Grid, GridItem, Input } from '@chakra-ui/react';
import type { IBillingInformation } from '@mercashop/shared';
import { useFormContext } from 'react-hook-form';

interface BillingInfoFieldsProps {
  required?: boolean;
}

export function BillingInfoFields({ required = false }: BillingInfoFieldsProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<IBillingInformation>();

  return (
    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
      <GridItem colSpan={{ base: 1, md: 2 }}>
        <Field.Root required={required} invalid={Boolean(errors.name)}>
          <Field.Label>Name</Field.Label>
          <Input placeholder="Your full name" {...register('name', { required })} />
        </Field.Root>
      </GridItem>
      <GridItem>
        <Field.Root required={required} invalid={Boolean(errors.email)}>
          <Field.Label>Email</Field.Label>
          <Input type="email" placeholder="name@example.com" {...register('email', { required })} />
        </Field.Root>
      </GridItem>
      <GridItem>
        <Field.Root required={required} invalid={Boolean(errors.phone)}>
          <Field.Label>Phone</Field.Label>
          <Input placeholder="+32 ..." {...register('phone', { required })} />
        </Field.Root>
      </GridItem>
      <GridItem colSpan={{ base: 1, md: 2 }}>
        <Field.Root>
          <Field.Label>VAT number</Field.Label>
          <Input placeholder="BE0123456789" {...register('vatNumber')} />
        </Field.Root>
      </GridItem>
    </Grid>
  );
}
