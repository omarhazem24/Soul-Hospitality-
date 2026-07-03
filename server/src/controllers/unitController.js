import { asyncHandler } from '../utils/asyncHandler.js';
import { findAvailableUnits } from '../services/availabilityService.js';

const toNumber = (value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsedValue = Number(value);
  return Number.isNaN(parsedValue) ? undefined : parsedValue;
};

const toDate = (value) => {
  if (!value) {
    return undefined;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
};

export const listAvailableUnits = asyncHandler(async (request, response) => {
  const units = await findAvailableUnits({
    destination: request.query.destination,
    checkInDate: toDate(request.query.check_in),
    checkOutDate: toDate(request.query.check_out),
    guests: toNumber(request.query.guests),
    minPrice: toNumber(request.query.min_price),
    maxPrice: toNumber(request.query.max_price),
    unitType: request.query.unit_type
  });

  response.json({
    success: true,
    data: units
  });
});
