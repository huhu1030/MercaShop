import { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  Drawer,
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
import type { IOptionGroup, IOptionChoice, SelectionMode } from '@mercashop/shared';
import { Portal } from '@chakra-ui/react';

interface OptionGroupDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  optionGroups: IOptionGroup[];
  onChange: (groups: IOptionGroup[]) => void;
}

interface ValidationErrors {
  groupName?: string;
  choices?: string;
  choiceNames?: Record<number, string>;
  maxSelections?: string;
}

const SELECTION_MODE_LABELS: Record<SelectionMode, string> = {
  exactlyOne: 'Exactly One',
  upToN: 'Up to N',
  anyNumber: 'Any Number',
};

function createDefaultChoice(): IOptionChoice {
  return { name: '', extraPrice: 0, maxQuantity: 1 };
}

function createDefaultGroup(): IOptionGroup {
  return {
    name: '',
    required: false,
    selectionMode: 'exactlyOne' as const,
    choices: [createDefaultChoice()],
  };
}

function validateGroup(group: IOptionGroup): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!group.name.trim()) {
    errors.groupName = 'Group name is required';
  }

  if (group.choices.length === 0) {
    errors.choices = 'At least one choice is required';
  }

  const choiceNameErrors: Record<number, string> = {};
  group.choices.forEach((choice, i) => {
    if (!choice.name.trim()) {
      choiceNameErrors[i] = 'Choice name is required';
    }
  });
  if (Object.keys(choiceNameErrors).length > 0) {
    errors.choiceNames = choiceNameErrors;
  }

  if (group.selectionMode === 'upToN' && (!group.maxSelections || group.maxSelections < 1)) {
    errors.maxSelections = 'Max selections must be at least 1';
  }

  return errors;
}

function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function OptionGroupDrawer({ isOpen, onClose, optionGroups, onChange }: OptionGroupDrawerProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<number, ValidationErrors>>({});

  function updateGroup(index: number, updater: (group: IOptionGroup) => IOptionGroup) {
    const updated = optionGroups.map((g, i) => (i === index ? updater(g) : g));
    const errors = validateGroup(updated[index]);
    setValidationErrors((prev) => ({ ...prev, [index]: errors }));
    onChange(updated);
  }

  function addGroup() {
    const newGroups = [...optionGroups, createDefaultGroup()];
    onChange(newGroups);
    setExpandedIndex(newGroups.length - 1);
  }

  function deleteGroup(index: number) {
    const updated = optionGroups.filter((_, i) => i !== index);
    onChange(updated);
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else if (expandedIndex !== null && expandedIndex > index) {
      setExpandedIndex(expandedIndex - 1);
    }
  }

  function addChoice(groupIndex: number) {
    updateGroup(groupIndex, (g) => ({
      ...g,
      choices: [...g.choices, createDefaultChoice()],
    }));
  }

  function deleteChoice(groupIndex: number, choiceIndex: number) {
    updateGroup(groupIndex, (g) => ({
      ...g,
      choices: g.choices.filter((_, i) => i !== choiceIndex),
    }));
  }

  function updateChoice(groupIndex: number, choiceIndex: number, updates: Partial<IOptionChoice>) {
    updateGroup(groupIndex, (g) => ({
      ...g,
      choices: g.choices.map((c, i) => (i === choiceIndex ? { ...c, ...updates } : c)),
    }));
  }

  function getSelectionModeText(mode: SelectionMode): string {
    return SELECTION_MODE_LABELS[mode];
  }

  return (
    <Drawer.Root open={isOpen} onOpenChange={(details) => !details.open && onClose()} placement="end" size="md">
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>Option Groups</Drawer.Title>
              <Drawer.CloseTrigger asChild position="absolute" top="0.75rem" right="0.75rem">
                <IconButton aria-label="Close drawer" variant="ghost" size="sm">
                  <X size="1.25rem" />
                </IconButton>
              </Drawer.CloseTrigger>
            </Drawer.Header>

            <Drawer.Body>
              <VStack gap="0.75rem" align="stretch">
                {optionGroups.map((group, groupIndex) => {
                  const isExpanded = expandedIndex === groupIndex;
                  const errors = validationErrors[groupIndex] ?? {};

                  return (
                    <Card.Root key={groupIndex} variant="outline">
                      <Card.Body p="0.75rem">
                        {/* Summary row */}
                        <HStack
                          justify="space-between"
                          cursor="pointer"
                          onClick={() => setExpandedIndex(isExpanded ? null : groupIndex)}
                        >
                          <VStack align="start" gap="0.25rem">
                            <Text fontWeight="semibold" fontSize="sm">
                              {group.name || 'Unnamed group'}
                            </Text>
                            <HStack gap="0.5rem">
                              <Badge colorPalette={group.required ? 'red' : 'gray'} size="sm">
                                {group.required ? 'Required' : 'Optional'}
                              </Badge>
                              <Text fontSize="xs" color="gray.500">
                                {getSelectionModeText(group.selectionMode)}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {group.choices.length} {group.choices.length === 1 ? 'choice' : 'choices'}
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

                        {/* Expanded editing form */}
                        {isExpanded && (
                          <VStack gap="0.75rem" align="stretch" mt="0.75rem" pt="0.75rem" borderTopWidth="1px">
                            {/* Group name */}
                            <Field.Root invalid={Boolean(errors.groupName)}>
                              <Field.Label fontSize="sm">Group Name</Field.Label>
                              <Input
                                size="sm"
                                placeholder="e.g. Size, Toppings"
                                value={group.name}
                                onChange={(e) =>
                                  updateGroup(groupIndex, (g) => ({ ...g, name: e.target.value }))
                                }
                              />
                              {errors.groupName && (
                                <Text color="red.500" fontSize="xs">
                                  {errors.groupName}
                                </Text>
                              )}
                            </Field.Root>

                            {/* Required toggle */}
                            <HStack justify="space-between">
                              <Text fontSize="sm">Required</Text>
                              <Switch.Root
                                checked={group.required}
                                onCheckedChange={(details) =>
                                  updateGroup(groupIndex, (g) => ({ ...g, required: details.checked }))
                                }
                                size="sm"
                              >
                                <Switch.HiddenInput />
                                <Switch.Control>
                                  <Switch.Thumb />
                                </Switch.Control>
                              </Switch.Root>
                            </HStack>

                            {/* Selection mode */}
                            <Field.Root>
                              <Field.Label fontSize="sm">Selection Mode</Field.Label>
                              <NativeSelect.Root size="sm">
                                <NativeSelect.Field
                                  value={group.selectionMode}
                                  onChange={(e) =>
                                    updateGroup(groupIndex, (g) => ({
                                      ...g,
                                      selectionMode: e.target.value as SelectionMode,
                                      maxSelections:
                                        e.target.value === 'upToN' ? (g.maxSelections ?? 1) : undefined,
                                    }))
                                  }
                                >
                                  <option value="exactlyOne">Exactly One</option>
                                  <option value="upToN">Up to N</option>
                                  <option value="anyNumber">Any Number</option>
                                </NativeSelect.Field>
                                <NativeSelect.Indicator />
                              </NativeSelect.Root>
                            </Field.Root>

                            {/* Max selections (only for upToN) */}
                            {group.selectionMode === 'upToN' && (
                              <Field.Root invalid={Boolean(errors.maxSelections)}>
                                <Field.Label fontSize="sm">Max Selections</Field.Label>
                                <Input
                                  size="sm"
                                  type="number"
                                  min={1}
                                  value={group.maxSelections ?? 1}
                                  onChange={(e) =>
                                    updateGroup(groupIndex, (g) => ({
                                      ...g,
                                      maxSelections: parseInt(e.target.value, 10) || 1,
                                    }))
                                  }
                                />
                                {errors.maxSelections && (
                                  <Text color="red.500" fontSize="xs">
                                    {errors.maxSelections}
                                  </Text>
                                )}
                              </Field.Root>
                            )}

                            {/* Choices editor */}
                            <Box>
                              <Text fontWeight="semibold" fontSize="sm" mb="0.5rem">
                                Choices
                              </Text>
                              {errors.choices && (
                                <Text color="red.500" fontSize="xs" mb="0.25rem">
                                  {errors.choices}
                                </Text>
                              )}

                              {/* Column headers */}
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
                                {group.choices.map((choice, choiceIndex) => (
                                  <HStack key={choiceIndex} gap="0.5rem">
                                    <Box flex="1">
                                      <Input
                                        size="sm"
                                        placeholder="Choice name"
                                        value={choice.name}
                                        onChange={(e) =>
                                          updateChoice(groupIndex, choiceIndex, { name: e.target.value })
                                        }
                                      />
                                      {errors.choiceNames?.[choiceIndex] && (
                                        <Text color="red.500" fontSize="xs">
                                          {errors.choiceNames[choiceIndex]}
                                        </Text>
                                      )}
                                    </Box>
                                    <Input
                                      size="sm"
                                      type="number"
                                      step="0.01"
                                      min={0}
                                      w="5rem"
                                      value={choice.extraPrice}
                                      onChange={(e) =>
                                        updateChoice(groupIndex, choiceIndex, {
                                          extraPrice: parseFloat(e.target.value) || 0,
                                        })
                                      }
                                    />
                                    <Input
                                      size="sm"
                                      type="number"
                                      min={1}
                                      w="4rem"
                                      value={choice.maxQuantity}
                                      onChange={(e) =>
                                        updateChoice(groupIndex, choiceIndex, {
                                          maxQuantity: parseInt(e.target.value, 10) || 1,
                                        })
                                      }
                                    />
                                    <IconButton
                                      aria-label="Delete choice"
                                      variant="ghost"
                                      size="sm"
                                      colorPalette="red"
                                      onClick={() => deleteChoice(groupIndex, choiceIndex)}
                                    >
                                      <X size="0.875rem" />
                                    </IconButton>
                                  </HStack>
                                ))}
                              </VStack>

                              <Button
                                variant="outline"
                                size="sm"
                                mt="0.5rem"
                                onClick={() => addChoice(groupIndex)}
                              >
                                <Plus size="0.875rem" />
                                Add Choice
                              </Button>
                            </Box>
                          </VStack>
                        )}
                      </Card.Body>
                    </Card.Root>
                  );
                })}

                {/* Add group button */}
                <Button
                  variant="outline"
                  w="full"
                  borderStyle="dashed"
                  onClick={addGroup}
                >
                  <Plus size="1rem" />
                  Add Group
                </Button>
              </VStack>
            </Drawer.Body>

            <Drawer.Footer>
              <Button
                colorPalette="purple"
                onClick={onClose}
                disabled={Object.values(validationErrors).some(hasErrors)}
              >
                Done
              </Button>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
