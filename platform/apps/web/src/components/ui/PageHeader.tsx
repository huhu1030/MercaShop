import {Box, Heading, HStack, Separator, Text} from '@chakra-ui/react';
import {ChevronRight} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {Colors} from '../../constants/colors';

interface BreadcrumbItem {
    label: string;
    path?: string;
}

interface PageHeaderProps {
    breadcrumbs: BreadcrumbItem[];
    title: string;
    description?: string;
}

export function PageHeader({breadcrumbs, title, description}: PageHeaderProps) {
    const navigate = useNavigate();

    return (
        <Box>
            <HStack gap="0.375rem" mb="0.5rem">
                {breadcrumbs.map((item, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    return (
                        <HStack key={item.label} gap="0.375rem">
                            {index > 0 && (
                                <ChevronRight size="0.875rem" color="var(--chakra-colors-gray-400)"/>
                            )}
                            {item.path && !isLast ? (
                                <Text
                                    fontSize="sm"
                                    color={Colors.brand.primary}
                                    cursor="pointer"
                                    _hover={{textDecoration: 'underline'}}
                                    onClick={() => navigate(item.path!)}
                                >
                                    {item.label}
                                </Text>
                            ) : (
                                <Text fontSize="sm" color={Colors.text.muted}>
                                    {item.label}
                                </Text>
                            )}
                        </HStack>
                    );
                })}
            </HStack>

            <Heading size="lg">{title}</Heading>

            {description && (
                <Text fontSize="sm" color={Colors.text.secondary} mt="0.25rem">
                    {description}
                </Text>
            )}

            <Separator mt="1rem"/>
        </Box>
    );
}
