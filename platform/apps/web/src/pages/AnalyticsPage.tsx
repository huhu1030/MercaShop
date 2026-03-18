import {Heading, VStack} from '@chakra-ui/react';
import {Chart, useChart} from '@chakra-ui/charts';
import {Bar, BarChart, CartesianGrid, XAxis, YAxis} from 'recharts';
import {Colors} from '../constants/colors';

const PLACEHOLDER_CHART_DATA = [
    {day: 'Mon', orders: 12},
    {day: 'Tue', orders: 19},
    {day: 'Wed', orders: 3},
    {day: 'Thu', orders: 5},
    {day: 'Fri', orders: 2},
    {day: 'Sat', orders: 3},
    {day: 'Sun', orders: 9},
];

export function AnalyticsPage() {
    const chart = useChart({
        data: PLACEHOLDER_CHART_DATA,
        series: [{name: 'orders', color: Colors.brand.primarySolid}],
    });

    return (
        <VStack gap="1.25rem" align="stretch">
            <Heading size="lg">Analytics</Heading>
            <Chart.Root chart={chart}>
                <BarChart data={chart.data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                    <XAxis dataKey="day"/>
                    <YAxis/>
                    <Bar
                        dataKey={chart.key('orders')}
                        fill={chart.color(Colors.brand.primarySolid)}
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </Chart.Root>
        </VStack>
    );
}
