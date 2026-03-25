import { PipelineStage } from 'mongoose';
import { OrderModel } from '../models/Order';
import { IAnalyticsResponse } from '@mercashop/shared';

export async function getEstablishmentAnalytics(
  tenantId: string,
  establishmentId: string,
  year: number,
  limit: number,
): Promise<IAnalyticsResponse> {
  const startMs = new Date(`${year}-01-01T00:00:00.000Z`).getTime();
  const endMs = new Date(`${year + 1}-01-01T00:00:00.000Z`).getTime();

  const pipeline: PipelineStage[] = [
    {
      $match: {
        tenantId,
        establishmentId,
        orderDate: { $gte: startMs, $lt: endMs },
        status: { $ne: 'CANCELLED' },
      },
    },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalRevenue: { $sum: '$total' },
            },
          },
          {
            $project: {
              _id: 0,
              totalOrders: 1,
              totalRevenue: 1,
              avgOrderValue: {
                $cond: [
                  { $eq: ['$totalOrders', 0] },
                  0,
                  { $divide: ['$totalRevenue', '$totalOrders'] },
                ],
              },
            },
          },
        ],
        monthly: [
          {
            $group: {
              _id: { $month: { $toDate: '$orderDate' } },
              orderCount: { $sum: 1 },
              revenue: { $sum: '$total' },
            },
          },
          { $sort: { _id: 1 } },
          {
            $project: {
              _id: 0,
              month: '$_id',
              orderCount: 1,
              revenue: 1,
            },
          },
        ],
        bestSellers: [
          { $unwind: '$orderLines' },
          {
            $group: {
              _id: '$orderLines.item.name',
              quantitySold: { $sum: '$orderLines.item.quantity' },
            },
          },
          { $sort: { quantitySold: -1 } },
          { $limit: limit },
          {
            $project: {
              _id: 0,
              productName: '$_id',
              quantitySold: 1,
            },
          },
        ],
        leastSellers: [
          { $unwind: '$orderLines' },
          {
            $group: {
              _id: '$orderLines.item.name',
              quantitySold: { $sum: '$orderLines.item.quantity' },
            },
          },
          { $sort: { quantitySold: 1 } },
          { $limit: limit },
          {
            $project: {
              _id: 0,
              productName: '$_id',
              quantitySold: 1,
            },
          },
        ],
      },
    },
  ];

  const [result] = await OrderModel.aggregate(pipeline);

  const summary = result.summary[0] ?? {
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
  };

  return {
    summary: {
      totalOrders: summary.totalOrders,
      totalRevenue: Math.round(summary.totalRevenue * 100) / 100,
      avgOrderValue: Math.round(summary.avgOrderValue * 100) / 100,
    },
    monthly: result.monthly,
    bestSellers: result.bestSellers,
    leastSellers: result.leastSellers,
  };
}
