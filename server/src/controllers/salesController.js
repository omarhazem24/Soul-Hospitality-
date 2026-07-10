import mongoose from 'mongoose';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';
import Unit from '../models/Unit.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createReservationHold, normalizeBookingRequest } from '../services/bookingService.js';
import { uploadBufferToCloudinary } from '../services/cloudinaryService.js';
import { applyBookingCommissionSnapshot, SALES_COMMISSION_RATE } from '../utils/bookingCommission.js';

const currentMonthBounds = () => {
  const now = new Date();
  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 1)
  };
};

const toObjectId = (value) => {
  if (!value || !mongoose.Types.ObjectId.isValid(value)) {
    return null;
  }
  return new mongoose.Types.ObjectId(value);
};

export const getSalesDashboardSummary = asyncHandler(async (request, response) => {
  const salesUserId = request.user?.id;
  const { start, end } = currentMonthBounds();
  const salesObjectId = toObjectId(salesUserId);
  const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();

  const [closedReservationRows, pendingApprovals, commissionRows, performanceRows] = await Promise.all([
    Booking.aggregate([
      {
        $match: {
          assignedSalesPersonId: salesObjectId,
          status: 'Accepted'
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
          closedReservations: { $sum: 1 }
        }
      },
      { $project: { _id: 0, closedReservations: 1 } }
    ]),
    Booking.countDocuments({
      assignedSalesPersonId: salesObjectId,
      status: 'Pending',
      isSalesCreated: { $ne: true }
    }),
    Booking.aggregate([
      {
        $match: {
          assignedSalesPersonId: salesObjectId,
          status: 'Accepted'
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
          currentMonthCommission: {
            $sum: { $multiply: [{ $ifNull: ['$totalPrice', 0] }, SALES_COMMISSION_RATE / 100] }
          }
        }
      },
      { $project: { _id: 0, currentMonthCommission: 1 } }
    ]),
    Booking.aggregate([
      {
        $match: {
          assignedSalesPersonId: salesObjectId,
          status: 'Accepted'
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
          _id: { $dayOfMonth: '$effectiveAcceptedAt' },
          totalBookings: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ])
  ]);

  const closedReservations = closedReservationRows[0]?.closedReservations || 0;

  const dailyCounts = new Map(performanceRows.map((row) => [Number(row._id), Number(row.totalBookings || 0)]));
  const performanceSeries = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    return {
      day,
      totalBookings: dailyCounts.get(day) || 0
    };
  });

  response.json({
    success: true,
    data: {
      closedReservations,
      manualReservations: closedReservations,
      pendingApprovals,
      currentMonthCommission: commissionRows[0]?.currentMonthCommission || 0,
      performanceSeries
    }
  });
});

export const listSalesReservations = asyncHandler(async (request, response) => {
  const salesObjectId = toObjectId(request.user?.id);
  const statusWeight = { Pending: 1, Accepted: 2, Rejected: 3 };

  const reservations = await Booking.find({ assignedSalesPersonId: salesObjectId })
    .populate('unit', 'title location unit_type price capacity photos status uniqueId projectName type')
    .populate('assignedSalesPersonId', 'name email uniqueSalesId')
    .lean();

  const reservationIds = reservations.map((item) => item?._id).filter(Boolean);
  const payments = reservationIds.length
    ? await Payment.find({ booking_id: { $in: reservationIds } }).select('booking_id payment_method').lean()
    : [];
  const paymentMethodByBookingId = new Map(payments.map((item) => [String(item.booking_id), item.payment_method]));

  const reservationsWithPaymentMethod = reservations.map((item) => ({
    ...item,
    paymentMethod: paymentMethodByBookingId.get(String(item._id)) || item.paymentMethod || 'cash'
  }));

  reservationsWithPaymentMethod.sort((a, b) => {
    const statusDiff = (statusWeight[a?.status] || 99) - (statusWeight[b?.status] || 99);
    if (statusDiff !== 0) {
      return statusDiff;
    }

    const aCheckIn = new Date(a?.startDate || a?.dates?.checkIn || 0).getTime();
    const bCheckIn = new Date(b?.startDate || b?.dates?.checkIn || 0).getTime();
    return aCheckIn - bCheckIn;
  });

  response.json({ success: true, data: reservationsWithPaymentMethod });
});

export const listSalesSchedule = asyncHandler(async (request, response) => {
  const reservations = await Booking.find({
    status: { $in: ['Pending', 'Accepted'] }
  })
    .populate('unit', 'title location unit_type price capacity photos status uniqueId projectName type')
    .sort({ startDate: 1 });

  const units = await Unit.find({}).sort({ createdAt: -1 }).lean();

  response.json({ success: true, data: { reservations, units } });
});

export const createSalesReservation = asyncHandler(async (request, response) => {
  const rawBody = request.body || {};
  const payload = normalizeBookingRequest(rawBody);
  let transferEvidencePhoto = rawBody.transfer_evidence_photo || rawBody.transferEvidencePhoto || '';

  if (request.file?.buffer) {
    const upload = await uploadBufferToCloudinary(request.file.buffer, {
      folder: 'sales-transfer-evidence',
      resourceType: 'image'
    });

    transferEvidencePhoto = upload?.secure_url || transferEvidencePhoto;
  }

  const result = await createReservationHold({
    ...payload,
    userId: request.user?.id,
    assignedSalesPersonId: request.user?.id,
    isSalesCreated: true,
    isAdminCreated: false,
    transferEvidencePhoto,
    paymentMethod: payload.paymentMethod || 'cash'
  });

  response.status(201).json({ success: true, data: result });
});

export const updateSalesReservationStatus = asyncHandler(async (request, response) => {
  const { status } = request.body;
  const allowedStatuses = ['Pending', 'Accepted', 'Rejected'];

  if (!allowedStatuses.includes(status)) {
    throw new AppError('status must be Pending, Accepted, or Rejected', 400);
  }

  const salesObjectId = toObjectId(request.user?.id);
  const booking = await Booking.findOne({ _id: request.params.id, assignedSalesPersonId: salesObjectId });

  if (!booking) {
    throw new AppError('Booking request not found', 404);
  }

  booking.status = status;
  booking.holdExpiresAt = status === 'Pending' ? booking.holdExpiresAt : null;
  applyBookingCommissionSnapshot(booking, status === 'Accepted' ? new Date() : null);
  await booking.save();

  response.json({ success: true, data: booking });
});

export const deleteSalesReservation = asyncHandler(async (request, response) => {
  const currentSalesUserId = String(request.user?.id || request.user?.userId || request.user?._id || '');
  const booking = await Booking.findById(request.params.id);

  if (!booking) {
    throw new AppError('Booking request not found', 404);
  }

  const assignedSalesUserId = String(booking.assignedSalesPersonId || '');
  const legacySalesUserId = String(booking.salesPerson || '');
  const isOwnedByCurrentSales = currentSalesUserId && (assignedSalesUserId === currentSalesUserId || legacySalesUserId === currentSalesUserId);

  if (!isOwnedByCurrentSales) {
    throw new AppError('Booking request not found', 404);
  }

  await Payment.deleteOne({ booking_id: booking._id });
  await Booking.deleteOne({ _id: booking._id });

  response.json({
    success: true,
    message: 'Reservation deleted successfully'
  });
});

export const getSalesCommissions = asyncHandler(async (request, response) => {
  const leaderboard = await Booking.aggregate([
    {
      $match: {
        assignedSalesPersonId: { $ne: null }
      }
    },
    {
      $group: {
        _id: '$assignedSalesPersonId',
        commissionAmount: { $sum: { $ifNull: ['$commissionAmount', 0] } }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'salesPerson'
      }
    },
    { $unwind: '$salesPerson' },
    {
      $project: {
        _id: 0,
        salesPersonId: '$salesPerson._id',
        name: '$salesPerson.name',
        uniqueSalesId: '$salesPerson.uniqueSalesId',
        commissionAmount: 1
      }
    },
    { $sort: { commissionAmount: -1, name: 1 } }
  ]);

  response.json({ success: true, data: leaderboard });
});