import { HStack, RadioGroup, Text, VStack } from '@chakra-ui/react';
import { PaymentMethod } from '@mercashop/shared';

interface PaymentMethodSelectorProps {
  methods: PaymentMethod[];
  value: string;
  onChange: (method: string) => void;
}

const paymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.CARD]: 'Credit Card',
  [PaymentMethod.BANCONTACT]: 'Bancontact',
  [PaymentMethod.CASH]: 'Cash',
};

export function PaymentMethodSelector({ methods, value, onChange }: PaymentMethodSelectorProps) {
  return (
    <RadioGroup.Root
      value={value}
      onValueChange={(details) => {
        if (details.value) {
          onChange(details.value);
        }
      }}
    >
      <VStack align="stretch" gap={3}>
        {methods.map((method) => (
          <RadioGroup.Item
            key={method}
            value={method}
            p={4}
            borderWidth="1px"
            borderColor="blackAlpha.200"
            borderRadius="xl"
            _checked={{ borderColor: 'green.500', bg: 'green.50' }}
          >
            <RadioGroup.ItemHiddenInput />
            <HStack justify="space-between">
              <Text fontWeight="medium">{paymentMethodLabels[method]}</Text>
              <RadioGroup.ItemControl />
            </HStack>
          </RadioGroup.Item>
        ))}
      </VStack>
    </RadioGroup.Root>
  );
}
