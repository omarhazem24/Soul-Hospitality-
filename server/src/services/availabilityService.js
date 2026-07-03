import { Booking } from '../models/Booking.js';
import Unit from '../models/Unit.js';
import { ACTIVE_BOOKING_STATUSES } from './bookingService.js';

const overlapFilter = (checkInDate, checkOutDate) => ({
  startDate: { $lt: checkOutDate },
  endDate: { $gt: checkInDate }
});

export const findAvailableUnits = async ({
  destination,
  checkInDate,
  checkOutDate,
  guests,
  minPrice,
  maxPrice,
  unitType
}) => {
  const query = Unit.find({ status: { $in: ['active', 'Available'] } });

  if (destination) {
    query.where({ $or: [{ location: new RegExp(destination, 'i') }, { projectName: new RegExp(destination, 'i') }] });
  }

  if (unitType) {
    query.where({ $or: [{ unit_type: unitType }, { type: unitType }] });
  }

  if (typeof minPrice === 'number') {
    query.where({ $or: [{ price: { $gte: minPrice } }, { pricePerNight: { $gte: minPrice } }] });
  }

  if (typeof maxPrice === 'number') {
    query.where({ $or: [{ price: { $lte: maxPrice } }, { pricePerNight: { $lte: maxPrice } }] });
  }

  if (checkInDate && checkOutDate) {
    const bookedUnitIds = await Booking.distinct('unit', {
      status: { $in: ACTIVE_BOOKING_STATUSES },
      ...overlapFilter(checkInDate, checkOutDate)
    });

    query.where('_id').nin(bookedUnitIds);
  }

  if (typeof guests === 'number') {
    query.where({ $or: [{ capacity: { $gte: guests } }, { bedroom_count: { $gte: guests } }, { bedrooms: { $gte: guests } }] });
  }

  return query.sort({ createdAt: -1 });
};
