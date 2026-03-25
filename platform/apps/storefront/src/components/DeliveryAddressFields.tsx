import { Field, Grid, GridItem, Input, Textarea } from '@chakra-ui/react';
import type { IDeliveryAddress } from '@mercashop/shared';
import { useFormContext } from 'react-hook-form';

interface DeliveryAddressFieldsProps {
  required?: boolean;
}

export function DeliveryAddressFields({ required = false }: DeliveryAddressFieldsProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<IDeliveryAddress>();

  return (
    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
      <GridItem>
        <Field.Root required={required} invalid={Boolean(errors.street)}>
          <Field.Label>Street</Field.Label>
          <Input placeholder="Main Street" {...register('street', { required })} />
        </Field.Root>
      </GridItem>
      <GridItem>
        <Field.Root required={required} invalid={Boolean(errors.number)}>
          <Field.Label>Number</Field.Label>
          <Input placeholder="12A" {...register('number', { required })} />
        </Field.Root>
      </GridItem>
      <GridItem>
        <Field.Root required={required} invalid={Boolean(errors.zipCode)}>
          <Field.Label>Zip code</Field.Label>
          <Input placeholder="1000" {...register('zipCode', { required })} />
        </Field.Root>
      </GridItem>
      <GridItem>
        <Field.Root required={required} invalid={Boolean(errors.city)}>
          <Field.Label>City</Field.Label>
          <Input placeholder="Brussels" {...register('city', { required })} />
        </Field.Root>
      </GridItem>
      <GridItem colSpan={{ base: 1, md: 2 }}>
        <Field.Root required={required} invalid={Boolean(errors.municipality)}>
          <Field.Label>Municipality</Field.Label>
          <Input placeholder="Brussels" {...register('municipality', { required })} />
        </Field.Root>
      </GridItem>
      <GridItem colSpan={{ base: 1, md: 2 }}>
        <Field.Root>
          <Field.Label>Comment</Field.Label>
          <Textarea placeholder="Door code, floor, delivery notes..." {...register('comment')} />
        </Field.Root>
      </GridItem>
    </Grid>
  );
}
