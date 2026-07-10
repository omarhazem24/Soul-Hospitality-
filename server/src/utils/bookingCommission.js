export const SALES_COMMISSION_RATE = 1;
export const WEBSITE_COMMISSION_RATE = 0.5;

const roundCurrency = (value) => Math.round(Number(value || 0) * 100) / 100;

const calculatePercentageAmount = (baseAmount, percentage) => roundCurrency((Number(baseAmount || 0) * Number(percentage || 0)) / 100);

export const isOrganicWebsiteBooking = (booking) => !booking?.isSalesCreated && !booking?.isAdminCreated;

export const applyBookingCommissionSnapshot = (bookingLike, acceptedAt = null) => {
  if (!bookingLike) {
    return bookingLike;
  }

  const isAccepted = bookingLike.status === 'Accepted';
  const totalPrice = Number(bookingLike.totalPrice || bookingLike.financials?.totalAmount || 0);
  const hasSalesAssignee = Boolean(bookingLike.assignedSalesPersonId);
  const explicitCommissionOverride = Number.isFinite(Number(bookingLike.commissionOverridePercentage))
    ? Number(bookingLike.commissionOverridePercentage)
    : null;
  const salesCommissionRate = isAccepted && hasSalesAssignee
    ? (explicitCommissionOverride !== null ? explicitCommissionOverride : SALES_COMMISSION_RATE)
    : 0;
  const websiteCommissionRate = isAccepted && isOrganicWebsiteBooking(bookingLike) ? WEBSITE_COMMISSION_RATE : 0;

  bookingLike.commissionPercentage = salesCommissionRate;
  bookingLike.commissionAmount = calculatePercentageAmount(totalPrice, salesCommissionRate);
  bookingLike.systemCommissionPercentage = websiteCommissionRate;
  bookingLike.systemCommissionAmount = calculatePercentageAmount(totalPrice, websiteCommissionRate);
  bookingLike.acceptedAt = isAccepted ? (acceptedAt || bookingLike.acceptedAt || new Date()) : null;

  return bookingLike;
};