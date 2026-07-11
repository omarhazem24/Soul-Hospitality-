import { format } from 'date-fns';

export const getPriceForDate = (unit, date) => {
  const dateKey = format(date, 'yyyy-MM-dd');
  const monthKey = format(date, 'yyyy-MM');

  // Check for date override first
  if (unit.dateOverrides && unit.dateOverrides[dateKey]) {
    return unit.dateOverrides[dateKey];
  }

  // Check for month price
  if (unit.monthPrices && unit.monthPrices[monthKey]) {
    return unit.monthPrices[monthKey];
  }

  // Fall back to base price or pricePerNight
  return unit.basePrice || unit.pricePerNight || 0;
};

export const getCurrentMonthPrice = (unit) => {
  const now = new Date();
  return getPriceForDate(unit, now);
};

export const formatPrice = (value) => `EGP ${Number(value || 0).toLocaleString()}`;
