import { Button, HStack } from '@chakra-ui/react';

interface CategoryFilterBarProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function CategoryFilterBar({ categories, selectedCategory, onSelectCategory }: CategoryFilterBarProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <HStack
      gap={3}
      overflowX="auto"
      py={1}
      pr={1}
      css={{
        scrollbarWidth: 'none',
      }}
    >
      <Button
        size="sm"
        borderRadius="full"
        variant={selectedCategory === null ? 'solid' : 'outline'}
        colorPalette="green"
        flexShrink={0}
        onClick={() => onSelectCategory(null)}
      >
        All
      </Button>

      {categories.map((category) => (
        <Button
          key={category}
          size="sm"
          borderRadius="full"
          variant={selectedCategory === category ? 'solid' : 'outline'}
          colorPalette="green"
          flexShrink={0}
          onClick={() => onSelectCategory(category)}
        >
          {category}
        </Button>
      ))}
    </HStack>
  );
}
