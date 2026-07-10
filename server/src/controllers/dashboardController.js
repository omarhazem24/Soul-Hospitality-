import { Booking } from '../models/Booking.js';
import Unit from '../models/Unit.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { SALES_COMMISSION_RATE, WEBSITE_COMMISSION_RATE } from '../utils/bookingCommission.js';

const currentMonthBounds = () => {
  const now = new Date();
  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 1)
  };
};

export const getDashboardSummary = asyncHandler(async (_request, response) => {
  const { start, end } = currentMonthBounds();

  const [
    totalUnitsInventoryCount,
    checkInsRows,
    checkOutsRows,
    totalRevenueRows,
    pendingRevenueRows,
    totalMonthlyReservationsRows
  ] = await Promise.all([
    Unit.countDocuments({}),
    Booking.aggregate([
      { $match: { status: 'Accepted', startDate: { $gte: start, $lt: end } } },
      { $group: { _id: null, count: { $sum: 1 } } },
      { $project: { _id: 0, count: 1 } }
    ]),
    Booking.aggregate([
      { $match: { status: 'Accepted', endDate: { $gte: start, $lt: end } } },
      { $group: { _id: null, count: { $sum: 1 } } },
      { $project: { _id: 0, count: 1 } }
    ]),
    Booking.aggregate([
      { $match: { status: 'Accepted', createdAt: { $gte: start, $lt: end } } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$totalPrice', 0] } } } },
      { $project: { _id: 0, total: 1 } }
    ]),
    Booking.aggregate([
      { $match: { status: 'Pending', createdAt: { $gte: start, $lt: end } } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$totalPrice', 0] } } } },
      { $project: { _id: 0, total: 1 } }
    ]),
    Booking.aggregate([
      { $match: { status: 'Accepted', createdAt: { $gte: start, $lt: end } } },
      { $group: { _id: null, count: { $sum: 1 } } },
      { $project: { _id: 0, count: 1 } }
    ])
  ]);

  response.json({
    success: true,
    data: {
      totalUnitsInventoryCount,
      checkInsCount: checkInsRows[0]?.count || 0,
      checkOutsCount: checkOutsRows[0]?.count || 0,
      totalRevenueCurrentMonth: totalRevenueRows[0]?.total || 0,
      pendingPaymentsCurrentMonth: pendingRevenueRows[0]?.total || 0,
      totalMonthlyReservations: totalMonthlyReservationsRows[0]?.count || 0
    }
  });
});

export const getAdminCommissionsSummary = asyncHandler(async (_request, response) => {
  const { start, end } = currentMonthBounds();

  const [leaderboardRows, websiteCommissionRows] = await Promise.all([
    Booking.aggregate([
      {
        $match: {
          status: 'Accepted',
          assignedSalesPersonId: { $ne: null }
        }
      },
      {
        $addFields: {
          effectiveAcceptedAt: { $ifNull: ['$acceptedAt', '$updatedAt'] }
        }
      },
      {
        $match: {
          effectiveAcceptedAt: { $gte: start, $lt: end }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'assignedSalesPersonId',
          foreignField: '_id',
          as: 'salesPerson'
        }
      },
      { $unwind: '$salesPerson' },
      { $match: { 'salesPerson.role': 'Sales' } },
      {
        $group: {
          _id: '$assignedSalesPersonId',
          name: { $first: '$salesPerson.name' },
          uniqueSalesId: { $first: '$salesPerson.uniqueSalesId' },
          manualSalesReservations: {
            $sum: {
              $cond: [{ $eq: ['$isSalesCreated', true] }, 1, 0]
            }
          },
          organicCustomerReservations: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$isSalesCreated', true] },
                    { $ne: ['$isAdminCreated', true] }
                  ]
                },
                1,
                0
              ]
            }
          },
          commissionAmount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$status', 'Accepted'] },
                    { $ne: ['$assignedSalesPersonId', null] }
                  ]
                },
                { $multiply: [{ $ifNull: ['$totalPrice', 0] }, SALES_COMMISSION_RATE / 100] },
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          salesPersonId: '$_id',
          name: 1,
          uniqueSalesId: 1,
          manualSalesReservations: 1,
          organicCustomerReservations: 1,
          totalMonthlyReservations: {
            $add: ['$manualSalesReservations', '$organicCustomerReservations']
          },
          commissionAmount: 1
        }
      },
      { $sort: { totalMonthlyReservations: -1, manualSalesReservations: -1, organicCustomerReservations: -1, name: 1 } }
    ]),
    Booking.aggregate([
      {
        $match: {
          status: 'Accepted',
          isSalesCreated: { $ne: true },
          isAdminCreated: { $ne: true }
        }
      },
      {
        $addFields: {
          effectiveAcceptedAt: { $ifNull: ['$acceptedAt', '$updatedAt'] }
        }
      },
      {
        $match: {
          effectiveAcceptedAt: { $gte: start, $lt: end }
        }
      },
      {
        $group: {
          _id: null,
          systemWebsiteCommission: {
            $sum: { $multiply: [{ $ifNull: ['$totalPrice', 0] }, WEBSITE_COMMISSION_RATE / 100] }
          }
        }
      },
      { $project: { _id: 0, systemWebsiteCommission: 1 } }
    ])
  ]);

  const salesAgentsCombinedCommissions = leaderboardRows.reduce((sum, row) => sum + Number(row.commissionAmount || 0), 0);

  response.json({
    success: true,
    data: {
      salesAgentsCombinedCommissions,
      systemWebsiteCommission: websiteCommissionRows[0]?.systemWebsiteCommission || 0,
      leaderboard: leaderboardRows
    }
  });
});
