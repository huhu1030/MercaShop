import { VStack, Heading, Box, Text } from '@chakra-ui/react';
import { Chart, useChart } from '@chakra-ui/charts';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

const PLACEHOLDER_CHART_DATA = [
  { day: 'Mon', orders: 12 },
  { day: 'Tue', orders: 19 },
  { day: 'Wed', orders: 3 },
  { day: 'Thu', orders: 5 },
  { day: 'Fri', orders: 2 },
  { day: 'Sat', orders: 3 },
  { day: 'Sun', orders: 9 },
];

export function AnalyticsPage() {
  const chart = useChart({
    data: PLACEHOLDER_CHART_DATA,
    series: [{ name: 'orders', color: 'purple.solid' }],
  });

  return (
    <VStack gap={5} align="stretch">
      <Heading size="lg">Analytics</Heading>

      <Box bg="white" p={5} borderRadius="lg" shadow="sm" maxW="700px">
        <Text fontWeight="semibold" mb={4}>Orders this week</Text>
        <Chart.Root chart={chart}>
          <BarChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" />
            <YAxis />
            <Bar
              dataKey={chart.key('orders')}
              fill={chart.color('purple.solid')}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </Chart.Root>
      </Box>
    </VStack>
  );
}
