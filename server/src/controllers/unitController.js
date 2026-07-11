import { asyncHandler } from '../utils/asyncHandler.js';
import Unit from '../models/Unit.js';
import mongoose from 'mongoose';
import { Review } from '../models/Review.js';
import { Booking } from '../models/Booking.js';
import { ACTIVE_BOOKING_STATUSES } from '../services/bookingService.js';

const toNumber = (value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsedValue = Number(value);
  return Number.isNaN(parsedValue) ? undefined : parsedValue;
};

const toList = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const toRegex = (value) => new RegExp(String(value).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

const normalizeSortOption = (sortOption = 'featured') => {
  const normalizedOption = String(sortOption || 'featured').trim().toLowerCase();

  const sortMap = {
    featured: { key: 'createdAt', direction: -1 },
    price_high_low: { key: 'pricePerNight', direction: -1 },
    price_low_high: { key: 'pricePerNight', direction: 1 },
    bedrooms_asc: { key: 'bedrooms', direction: 1 },
    bedrooms_desc: { key: 'bedrooms', direction: -1 },
    rating_high_low: { key: 'averageRating', direction: -1 },
    rating_low_high: { key: 'averageRating', direction: 1 }
  };

  return sortMap[normalizedOption] || sortMap.featured;
};

const sortUnits = (units, sortOption) => {
  const { key, direction } = normalizeSortOption(sortOption);

  return [...units].sort((left, right) => {
    const leftValue = Number(left?.[key] ?? 0);
    const rightValue = Number(right?.[key] ?? 0);

    if (leftValue < rightValue) {
      return -1 * direction;
    }

    if (leftValue > rightValue) {
      return 1 * direction;
    }

    return 0;
  });
};

const isLockedBookingStatus = (value) => ACTIVE_BOOKING_STATUSES.includes(String(value || '').trim());

const isReservationLiveNow = (booking, now) => {
  const checkIn = booking?.dates?.checkIn || booking?.startDate;
  const checkOut = booking?.dates?.checkOut || booking?.endDate;

  if (!checkIn || !checkOut) {
    return false;
  }

  const start = new Date(checkIn);
  const end = new Date(checkOut);

  return start <= now && end >= now;
};

const applyDynamicStatus = async (units) => {
  const now = new Date();
  const unitIds = units.map((unit) => unit?._id).filter(Boolean);

  if (!unitIds.length) {
    return units;
  }

  const liveReservations = await Booking.find({
    unitId: { $in: unitIds },
    status: { $in: ACTIVE_BOOKING_STATUSES }
  }).select('unitId dates startDate endDate status');

  const occupiedUnitIds = new Set(
    liveReservations
        .filter((booking) => isReservationLiveNow(booking, now) || isLockedBookingStatus(booking.status))
      .map((booking) => String(booking.unitId))
  );

  if (!occupiedUnitIds.size) {
    return units;
  }

  return units.map((unit) => {
    if (!occupiedUnitIds.has(String(unit._id))) {
      return unit;
    }

    return {
      ...unit,
      status: 'Occupied'
    };
  });
};

const attachReviewStats = async (units) => {
  const unitIds = units.map((unit) => unit._id).filter(Boolean);

  if (!unitIds.length) {
    return units;
  }

  const reviewStats = await Review.aggregate([
    {
      $match: {
        unitId: { $in: unitIds },
        status: 'visible'
      }
    },
    {
      $group: {
        _id: '$unitId',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  const reviewStatsByUnitId = new Map(
    reviewStats.map((item) => [String(item._id), item])
  );

  return units.map((unit) => {
    const stats = reviewStatsByUnitId.get(String(unit._id));

    return {
      ...unit,
      averageRating: Number(stats?.averageRating || unit.averageRating || 0),
      reviewCount: Number(stats?.reviewCount || unit.reviewCount || 0)
    };
  });
};

export const getFilteredUnits = asyncHandler(async (request, response) => {
  try {
    const {
      type,
      furnishing,
      minPrice,
      maxPrice,
      view,
      facilities,
      amenities,
      destination,
      projectName,
      bedrooms,
      status,
      sort
    } = request.query;

    const queryCriteria = {};

    if (type) {
      queryCriteria.type = { $in: toList(type) };
    }

    if (projectName) {
      queryCriteria.projectName = toRegex(projectName);
    }

    if (destination) {
      queryCriteria.destination = destination;
    }

    if (bedrooms && bedrooms !== 'All') {
      queryCriteria.bedrooms = Number(bedrooms);
    }

    if (furnishing && furnishing !== 'ALL FURNISHINGS') {
      queryCriteria.furnishing = furnishing;
    }

    if (status) {
      queryCriteria.status = status;
    } else {
      queryCriteria.status = 'Available';
    }

    if (view) {
      queryCriteria.view = { $in: toList(view) };
    }

    if (minPrice || maxPrice) {
      queryCriteria.pricePerNight = {};
      if (minPrice) {
        queryCriteria.pricePerNight.$gte = toNumber(minPrice);
      }
      if (maxPrice) {
        queryCriteria.pricePerNight.$lte = toNumber(maxPrice);
      }
    }

    if (facilities) {
      queryCriteria.facilities = { $all: toList(facilities) };
    }

    if (amenities) {
      queryCriteria.amenities = { $all: toList(amenities) };
    }

    const units = await Unit.find(queryCriteria).sort({ createdAt: -1 }).lean();
    const unitsWithRating = await attachReviewStats(units);
    const unitsWithOccupancy = await applyDynamicStatus(unitsWithRating);
    const sortedUnits = sortUnits(unitsWithOccupancy, sort);

    return response.status(200).json({
      success: true,
      count: sortedUnits.length,
      data: sortedUnits
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export const listAvailableUnits = getFilteredUnits;

export const getUnitByIdentifier = asyncHandler(async (request, response) => {
  const { id } = request.params;
  const query = [{ uniqueId: id }];

  if (mongoose.Types.ObjectId.isValid(id)) {
    query.push({ _id: id });
  }

  const unit = await Unit.findOne({ $or: query });

  if (!unit) {
    return response.status(404).json({
      success: false,
      message: 'Unit not found'
    });
  }

  const bookings = await Booking.find({
    unitId: unit._id,
    status: { $in: ACTIVE_BOOKING_STATUSES }
  }).select('dates startDate endDate status');

  const now = new Date();
  const isOccupied = bookings.some((booking) => isReservationLiveNow(booking, now) || isLockedBookingStatus(booking.status));

  const bookedRanges = bookings.map((b) => ({
    checkIn: b.dates?.checkIn || b.startDate,
    checkOut: b.dates?.checkOut || b.endDate
  }));

  const unitData = unit.toObject ? unit.toObject() : unit;
  unitData.bookedRanges = bookedRanges;
  if (isOccupied) {
    unitData.status = 'Occupied';
  }

  return response.status(200).json({
    success: true,
    data: unitData
  });
});

export const getUnitById = getUnitByIdentifier;

export const updateUnitPricing = asyncHandler(async (request, response) => {
  const { id } = request.params;
  const { price, applyMode, dates, monthKey } = request.body;

  const unit = await Unit.findOne({ _id: id });

  if (!unit) {
    return response.status(404).json({
      success: false,
      message: 'Unit not found'
    });
  }

  if (applyMode === 'day' && Array.isArray(dates) && dates.length > 0) {
    // Update specific date overrides
    if (!unit.dateOverrides) {
      unit.dateOverrides = new Map();
    }
    
    dates.forEach(date => {
      if (unit.dateOverrides instanceof Map) {
        unit.dateOverrides.set(date, price);
      } else {
        unit.dateOverrides[date] = price;
      }
    });
  } else if (applyMode === 'month' && monthKey) {
    // Update month price
    if (!unit.monthPrices) {
      unit.monthPrices = new Map();
    }
    
    if (unit.monthPrices instanceof Map) {
      unit.monthPrices.set(monthKey, price);
    } else {
      unit.monthPrices[monthKey] = price;
    }
  } else {
    return response.status(400).json({
      success: false,
      message: 'Invalid pricing update request'
    });
  }

  await unit.save();

  return response.status(200).json({
    success: true,
    data: unit
  });
});
