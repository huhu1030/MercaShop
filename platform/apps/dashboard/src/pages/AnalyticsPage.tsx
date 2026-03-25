import { useState } from 'react';
import { Box, Card, HStack, Text, VStack } from '@chakra-ui/react';
import { Chart, useChart } from '@chakra-ui/charts';
import { Bar, CartesianGrid, ComposedChart, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { getAnalyticsApi } from '@mercashop/shared/api-client';
import { IAnalyticsResponse } from '@mercashop/shared';
import { PageHeader } from '../components/ui/PageHeader';
import { useEstablishmentId } from '../hooks/useEstablishmentId';
import { Colors } from '../constants/colors';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const LIMIT_OPTIONS = [5, 10, 20] as const;

function fillMonthlyGaps(monthly: IAnalyticsResponse['monthly']): Array<{ label: string; orderCount: number; revenue: number }> {
  const currentMonth = new Date().getMonth() + 1;
  const byMonth = new Map(monthly.map((m) => [m.month, m]));
  return Array.from({ length: currentMonth }, (_, i) => {
    const month = i + 1;
    const entry = byMonth.get(month);
    return {
      label: MONTH_LABELS[i],
      orderCount: entry?.orderCount ?? 0,
      revenue: entry?.revenue ?? 0,
    };
  });
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-BE', { style: 'currency', currency: 'EUR' }).format(value);
}

export function AnalyticsPage() {
  const { establishmentId } = useEstablishmentId()!;
  const [limit, setLimit] = useState<number>(5);
  const year = new Date().getFullYear();

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', establishmentId, year, limit],
    queryFn: () => getAnalyticsApi().getEstablishmentAnalytics(establishmentId, year, limit),
  });

  const analytics = data?.data;
  const monthlyData = analytics ? fillMonthlyGaps(analytics.monthly) : [];

  const chart = useChart({
    data: monthlyData,
    series: [
      { name: 'orderCount', color: Colors.brand.primarySolid },
      { name: 'revenue', color: 'green.solid' },
    ],
  });

  return (
    <VStack gap="1.25rem" align="stretch">
      <PageHeader breadcrumbs={[{ label: 'Analytics' }]} title="Analytics" description={`Year-to-date overview for ${year}.`} />

      {/* Limit selector */}
      <HStack>
        <Text fontSize="sm" color={Colors.text.secondary}>
          Show top/bottom:
        </Text>
        {LIMIT_OPTIONS.map((opt) => (
          <Box
            key={opt}
            as="button"
            px="3"
            py="1"
            borderRadius="md"
            fontSize="sm"
            fontWeight={limit === opt ? 'bold' : 'normal'}
            bg={limit === opt ? Colors.brand.activeBg : 'transparent'}
            color={limit === opt ? Colors.brand.activeText : Colors.text.secondary}
            onClick={() => setLimit(opt)}
            cursor="pointer"
          >
            {opt}
          </Box>
        ))}
      </HStack>

      {/* KPI Cards */}
      <HStack gap="1rem">
        <Card.Root flex="1">
          <Card.Body>
            <Text fontSize="xs" color={Colors.text.muted}>
              Total Orders
            </Text>
            <Text fontSize="2xl" fontWeight="bold">
              {isLoading ? '—' : (analytics?.summary.totalOrders ?? 0)}
            </Text>
          </Card.Body>
        </Card.Root>
        <Card.Root flex="1">
          <Card.Body>
            <Text fontSize="xs" color={Colors.text.muted}>
              Total Revenue
            </Text>
            <Text fontSize="2xl" fontWeight="bold">
              {isLoading ? '—' : formatCurrency(analytics?.summary.totalRevenue ?? 0)}
            </Text>
          </Card.Body>
        </Card.Root>
        <Card.Root flex="1">
          <Card.Body>
            <Text fontSize="xs" color={Colors.text.muted}>
              Avg Order Value
            </Text>
            <Text fontSize="2xl" fontWeight="bold">
              {isLoading ? '—' : formatCurrency(analytics?.summary.avgOrderValue ?? 0)}
            </Text>
          </Card.Body>
        </Card.Root>
      </HStack>

      {/* Monthly Chart */}
      <Card.Root>
        <Card.Body>
          <Text fontSize="sm" fontWeight="semibold" mb="4">
            Monthly Orders &amp; Revenue
          </Text>
          <Chart.Root chart={chart}>
            <ComposedChart data={chart.data} responsive>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="orderCount" name="Orders" fill={chart.color(Colors.brand.primarySolid)} radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="revenue" name="Revenue (€)" fill={chart.color('green.solid')} />
            </ComposedChart>
          </Chart.Root>
        </Card.Body>
      </Card.Root>

      {/* Best & Least Sellers */}
      <HStack gap="1rem" align="start">
        <Card.Root flex="1">
          <Card.Body>
            <Text fontSize="sm" fontWeight="semibold" mb="3">
              Best Sellers
            </Text>
            {isLoading ? (
              <Text color={Colors.text.muted}>Loading...</Text>
            ) : !analytics?.bestSellers?.length ? (
              <Text color={Colors.text.muted}>No data yet</Text>
            ) : (
              <VStack gap="2" align="stretch">
                {analytics.bestSellers.map((item, i) => (
                  <HStack key={item.productName} justify="space-between">
                    <Text fontSize="sm">
                      <Text as="span" fontWeight="bold" color={Colors.text.muted}>
                        {i + 1}.
                      </Text>{' '}
                      {item.productName}
                    </Text>
                    <Text fontSize="sm" fontWeight="semibold">
                      {item.quantitySold} sold
                    </Text>
                  </HStack>
                ))}
              </VStack>
            )}
          </Card.Body>
        </Card.Root>
        <Card.Root flex="1">
          <Card.Body>
            <Text fontSize="sm" fontWeight="semibold" mb="3">
              Least Sellers
            </Text>
            {isLoading ? (
              <Text color={Colors.text.muted}>Loading...</Text>
            ) : !analytics?.leastSellers?.length ? (
              <Text color={Colors.text.muted}>No data yet</Text>
            ) : (
              <VStack gap="2" align="stretch">
                {analytics.leastSellers.map((item, i) => (
                  <HStack key={item.productName} justify="space-between">
                    <Text fontSize="sm">
                      <Text as="span" fontWeight="bold" color={Colors.text.muted}>
                        {i + 1}.
                      </Text>{' '}
                      {item.productName}
                    </Text>
                    <Text fontSize="sm" fontWeight="semibold">
                      {item.quantitySold} sold
                    </Text>
                  </HStack>
                ))}
              </VStack>
            )}
          </Card.Body>
        </Card.Root>
      </HStack>
    </VStack>
  );
}
