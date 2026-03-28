import { useEffect } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  Field,
  HStack,
  IconButton,
  Input,
  NativeSelect,
  Switch,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Plus, Trash2, X } from 'lucide-react';
import { z } from 'zod';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import type { IOptionGroup, SelectionMode } from '@mercashop/shared';

const SELECTION_MODE_LABELS: Record<SelectionMode, string> = {
  exactlyOne: 'Exactly One',
  upToN: 'Up to N',
  anyNumber: 'Any Number',
};

const optionChoiceSchema = z.object({
  name: z.string().min(1, 'Choice name is required'),
  extraPrice: z.coerce.number().min(0),
  maxQuantity: z.coerce.number().int().min(1),
});

const optionGroupSchema = z
  .object({
    name: z.string().min(1, 'Group name is required'),
    required: z.boolean(),
    selectionMode: z.enum(['exactlyOne', 'upToN', 'anyNumber']),
    maxSelections: z.coerce.number().int().min(1).optional(),
    choices: z.array(optionChoiceSchema).min(1, 'At least one choice is required'),
  })
  .refine((g) => g.selectionMode !== 'upToN' || (g.maxSelections !== undefined && g.maxSelections >= 1), {
    message: 'Max selections must be at least 1',
    path: ['maxSelections'],
  });

const formSchema = z.object({
  optionGroups: z.array(optionGroupSchema),
});

type FormValues = z.input<typeof formSchema>;

interface OptionGroupPanelProps {
  optionGroups: IOptionGroup[];
  onChange: (groups: IOptionGroup[]) => void;
}

export function OptionGroupPanel({ optionGroups, onChange }: OptionGroupPanelProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const {
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { optionGroups },
    mode: 'onChange',
  });

  const { fields: groupFields, append: appendGroup, remove: removeGroup } = useFieldArray({ control, name: 'optionGroups' });

  const watchedGroups = watch('optionGroups');

  useEffect(() => {
    onChange(watchedGroups);
  }, [watchedGroups, onChange]);

  function addGroup() {
    appendGroup({
      name: '',
      required: false,
      selectionMode: 'exactlyOne' as const,
      maxSelections: undefined,
      choices: [{ name: '', extraPrice: 0, maxQuantity: 1 }],
    });
    setExpandedIndex(groupFields.length);
  }

  function deleteGroup(index: number) {
    removeGroup(index);
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else if (expandedIndex !== null && expandedIndex > index) {
      setExpandedIndex(expandedIndex - 1);
    }
  }

  return (
    <VStack gap="0.75rem" align="stretch">
      <Text fontWeight="semibold" fontSize="lg">
        Option Groups
      </Text>
      <Text fontSize="sm" color="gray.500">
        Add customizable options like sizes, toppings, or extras.
      </Text>

      {groupFields.map((field, groupIndex) => {
        const isExpanded = expandedIndex === groupIndex;
        const group = watchedGroups[groupIndex];
        const groupErrors = errors.optionGroups?.[groupIndex];

        return (
          <Card.Root key={field.id} variant="outline">
            <Card.Body p="0.75rem">
              <HStack
                justify="space-between"
                cursor="pointer"
                onClick={() => setExpandedIndex(isExpanded ? null : groupIndex)}
              >
                <VStack align="start" gap="0.25rem">
                  <Text fontWeight="semibold" fontSize="sm">
                    {group?.name || 'Unnamed group'}
                  </Text>
                  <HStack gap="0.5rem">
                    <Badge colorPalette={group?.required ? 'red' : 'gray'} size="sm">
                      {group?.required ? 'Required' : 'Optional'}
                    </Badge>
                    <Text fontSize="xs" color="gray.500">
                      {group ? SELECTION_MODE_LABELS[group.selectionMode] : ''}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {group?.choices.length ?? 0} {group?.choices.length === 1 ? 'choice' : 'choices'}
                    </Text>
                  </HStack>
                </VStack>
                <IconButton
                  aria-label="Delete group"
                  variant="ghost"
                  size="sm"
                  colorPalette="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteGroup(groupIndex);
                  }}
                >
                  <Trash2 size="1rem" />
                </IconButton>
              </HStack>

              {isExpanded && (
                <VStack gap="0.75rem" align="stretch" mt="0.75rem" pt="0.75rem" borderTopWidth="1px">
                  <Controller
                    control={control}
                    name={`optionGroups.${groupIndex}.name`}
                    render={({ field: f }) => (
                      <Field.Root invalid={Boolean(groupErrors?.name)}>
                        <Field.Label fontSize="sm">Group Name</Field.Label>
                        <Input size="sm" placeholder="e.g. Size, Toppings" {...f} />
                        {groupErrors?.name && (
                          <Text color="red.500" fontSize="xs">
                            {groupErrors.name.message}
                          </Text>
                        )}
                      </Field.Root>
                    )}
                  />

                  <HStack justify="space-between">
                    <Text fontSize="sm">Required</Text>
                    <Controller
                      control={control}
                      name={`optionGroups.${groupIndex}.required`}
                      render={({ field: f }) => (
                        <Switch.Root
                          checked={f.value}
                          onCheckedChange={(details) => f.onChange(details.checked)}
                          size="sm"
                        >
                          <Switch.HiddenInput />
                          <Switch.Control>
                            <Switch.Thumb />
                          </Switch.Control>
                        </Switch.Root>
                      )}
                    />
                  </HStack>

                  <Controller
                    control={control}
                    name={`optionGroups.${groupIndex}.selectionMode`}
                    render={({ field: f }) => (
                      <Field.Root>
                        <Field.Label fontSize="sm">Selection Mode</Field.Label>
                        <NativeSelect.Root size="sm">
                          <NativeSelect.Field
                            value={f.value}
                            onChange={(e) => f.onChange(e.target.value)}
                          >
                            <option value="exactlyOne">Exactly One</option>
                            <option value="upToN">Up to N</option>
                            <option value="anyNumber">Any Number</option>
                          </NativeSelect.Field>
                          <NativeSelect.Indicator />
                        </NativeSelect.Root>
                      </Field.Root>
                    )}
                  />

                  {group?.selectionMode === 'upToN' && (
                    <Controller
                      control={control}
                      name={`optionGroups.${groupIndex}.maxSelections`}
                      render={({ field: f }) => (
                        <Field.Root invalid={Boolean(groupErrors?.maxSelections)}>
                          <Field.Label fontSize="sm">Max Selections</Field.Label>
                          <Input
                            size="sm"
                            type="number"
                            min={1}
                            value={f.value ?? 1}
                            onChange={(e) => f.onChange(parseInt(e.target.value, 10) || 1)}
                          />
                          {groupErrors?.maxSelections && (
                            <Text color="red.500" fontSize="xs">
                              {groupErrors.maxSelections.message}
                            </Text>
                          )}
                        </Field.Root>
                      )}
                    />
                  )}

                  <ChoicesFieldArray control={control} groupIndex={groupIndex} groupErrors={groupErrors} />
                </VStack>
              )}
            </Card.Body>
          </Card.Root>
        );
      })}

      <Button
        variant="outline"
        w="full"
        borderStyle="dashed"
        onClick={addGroup}
      >
        <Plus size="1rem" />
        Add Option Group
      </Button>
    </VStack>
  );
}

import type { FieldErrors } from 'react-hook-form';

type GroupErrors = FieldErrors<FormValues['optionGroups'][number]>;

interface ChoicesFieldArrayProps {
  control: ReturnType<typeof useForm<FormValues>>['control'];
  groupIndex: number;
  groupErrors: GroupErrors | undefined;
}

function ChoicesFieldArray({ control, groupIndex, groupErrors }: ChoicesFieldArrayProps) {
  const { fields: choiceFields, append, remove } = useFieldArray({
    control,
    name: `optionGroups.${groupIndex}.choices`,
  });

  return (
    <Box>
      <Text fontWeight="semibold" fontSize="sm" mb="0.5rem">
        Choices
      </Text>
      {groupErrors?.choices?.message && (
        <Text color="red.500" fontSize="xs" mb="0.25rem">
          {groupErrors.choices.message}
        </Text>
      )}

      <HStack gap="0.5rem" mb="0.25rem">
        <Text fontSize="xs" color="gray.500" flex="1">
          Choice name
        </Text>
        <Text fontSize="xs" color="gray.500" w="5rem">
          Extra price
        </Text>
        <Text fontSize="xs" color="gray.500" w="4rem">
          Max qty
        </Text>
        <Box w="2rem" />
      </HStack>

      <VStack gap="0.5rem" align="stretch">
        {choiceFields.map((choiceField, choiceIndex) => {
          const choiceErrors = groupErrors?.choices?.[choiceIndex];

          return (
            <HStack key={choiceField.id} gap="0.5rem">
              <Box flex="1">
                <Controller
                  control={control}
                  name={`optionGroups.${groupIndex}.choices.${choiceIndex}.name`}
                  render={({ field: f }) => (
                    <>
                      <Input size="sm" placeholder="Choice name" {...f} />
                      {choiceErrors?.name && (
                        <Text color="red.500" fontSize="xs">
                          {choiceErrors.name.message}
                        </Text>
                      )}
                    </>
                  )}
                />
              </Box>
              <Controller
                control={control}
                name={`optionGroups.${groupIndex}.choices.${choiceIndex}.extraPrice`}
                render={({ field: f }) => (
                  <Input
                    size="sm"
                    type="number"
                    step="0.01"
                    min={0}
                    w="5rem"
                    value={f.value}
                    onChange={(e) => f.onChange(parseFloat(e.target.value) || 0)}
                  />
                )}
              />
              <Controller
                control={control}
                name={`optionGroups.${groupIndex}.choices.${choiceIndex}.maxQuantity`}
                render={({ field: f }) => (
                  <Input
                    size="sm"
                    type="number"
                    min={1}
                    w="4rem"
                    value={f.value}
                    onChange={(e) => f.onChange(parseInt(e.target.value, 10) || 1)}
                  />
                )}
              />
              <IconButton
                aria-label="Delete choice"
                variant="ghost"
                size="sm"
                colorPalette="red"
                onClick={() => remove(choiceIndex)}
              >
                <X size="0.875rem" />
              </IconButton>
            </HStack>
          );
        })}
      </VStack>

      <Button
        variant="outline"
        size="sm"
        mt="0.5rem"
        onClick={() => append({ name: '', extraPrice: 0, maxQuantity: 1 })}
      >
        <Plus size="0.875rem" />
        Add Choice
      </Button>
    </Box>
  );
}
