import mongoose from 'mongoose';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';
import { PromoCode } from '../models/PromoCode.js';
import { User } from '../models/User.js';
import Unit from '../models/Unit.js';
import { Notification } from '../models/Notification.js';
import { CardCheckoutSession } from '../models/CardCheckoutSession.js';
import { emitSalesNotification } from '../config/socket.js';
import { AppError } from '../utils/AppError.js';
import { applyBookingCommissionSnapshot } from '../utils/bookingCommission.js';
import { calculateTaxInvoice } from '../utils/taxInvoice.js';

const HOLD_TTL_SECONDS = 900;
export const ACTIVE_BOOKING_STATUSES = ['Pending', 'Accepted'];
const DEFAULT_MIN_STAY_NIGHTS = 4;
const GAIA_MIN_STAY_NIGHTS = 3;
const GAIA_BEACH_ACCESS_DAYS = 7;
const GAIA_BEACH_BASE_PRICE = 3500;
const GAIA_BEACH_EXTRA_PRICE = 4000;

const overlapFilter = (checkInDate, checkOutDate) => ({
  startDate: { $lt: checkOutDate },
  endDate: { $gt: checkInDate }
});

const toDate = (value, fieldName) => {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new AppError(`Invalid ${fieldName}`, 400);
  }
  return parsedDate;
};

const calculateNights = (checkInDate, checkOutDate) => {
  const millisecondsPerNight = 24 * 60 * 60 * 1000;
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / millisecondsPerNight);
  if (nights <= 0) {
    throw new AppError('check_out_date must be after check_in_date', 400);
  }
  return nights;
};

const calculateWeightedGuests = (guestCount) => Number(guestCount || 0);

const getPriceForDate = (unit, date) => {
  const dateKey = date.toISOString().split('T')[0];
  const monthKey = date.toISOString().slice(0, 7);

  // Check for date override first
  if (unit.dateOverrides && unit.dateOverrides instanceof Map && unit.dateOverrides.has(dateKey)) {
    return unit.dateOverrides.get(dateKey);
  }
  if (unit.dateOverrides && typeof unit.dateOverrides === 'object' && unit.dateOverrides[dateKey]) {
    return unit.dateOverrides[dateKey];
  }

  // Check for month price
  if (unit.monthPrices && unit.monthPrices instanceof Map && unit.monthPrices.has(monthKey)) {
    return unit.monthPrices.get(monthKey);
  }
  if (unit.monthPrices && typeof unit.monthPrices === 'object' && unit.monthPrices[monthKey]) {
    return unit.monthPrices[monthKey];
  }

  // Fall back to base price or pricePerNight
  return unit.basePrice || unit.pricePerNight || 0;
};

const calculateWeightedPriceForDateRange = (unit, checkInDate, checkOutDate) => {
  const nights = calculateNights(checkInDate, checkOutDate);
  let totalPrice = 0;
  
  for (let i = 0; i < nights; i++) {
    const currentDate = new Date(checkInDate);
    currentDate.setDate(currentDate.getDate() + i);
    totalPrice += getPriceForDate(unit, currentDate);
  }
  
  return totalPrice;
};

const getDynamicHousekeepingFee = (unit) => {
  const propertyType = String(unit?.propertyType || unit?.type || unit?.unit_type || '').trim().toLowerCase();
  return propertyType === 'villa' ? 2500 : 1500;
};

const getBeachAccessDays = (unit) => {
  const rawValue = Number(unit?.beachAccessDays ?? unit?.beach_access_days ?? 7);
  return Number.isFinite(rawValue) && rawValue > 0 ? rawValue : 7;
};

const getConfiguredBeachAccessPrice = (unit) => {
  const rawValue = Number(
    unit?.beachAccessPricePerPersonPerWeek ??
    unit?.beachAccessPricePerPerson ??
    unit?.beach_access_price_per_person_per_week ??
    unit?.beach_access_price_per_person ??
    unit?.beachAccessPrice ??
    500
  );

  return rawValue > 0 ? rawValue : 500;
};

const isGaiaUnit = (unit) => String(
  unit?.projectName ??
  unit?.destination ??
  unit?.location ??
  ''
).trim().toLowerCase() === 'gaia';

const getMinimumStayNights = (unit) => (isGaiaUnit(unit) ? GAIA_MIN_STAY_NIGHTS : DEFAULT_MIN_STAY_NIGHTS);

const getGaiaBeachOverride = (unit, nights) => {
  if (isGaiaUnit(unit) && Number(nights || 0) > 3) {
    return {
      beachAccessDays: GAIA_BEACH_ACCESS_DAYS,
      beachAccessPricePerPersonPerWeek: GAIA_BEACH_BASE_PRICE,
      beachAccessExtraGuestPricePerPerson: GAIA_BEACH_EXTRA_PRICE
    };
  }

  return null;
};

const getBeachAccessExtraGuestPrice = (unit, fallbackPrice) => {
  const rawValue = Number(
    unit?.beachAccessExtraGuestPricePerPerson ??
    unit?.beach_access_extra_guest_price_per_person ??
    fallbackPrice
  );

  return rawValue > 0 ? rawValue : fallbackPrice;
};

const pickRandomSalesUserId = async () => {
  const salesUsers = await User.find({ role: 'Sales' }).select('_id isFirstLogin').lean();
  if (!salesUsers.length) {
    return null;
  }
  const activeSalesUsers = salesUsers.filter((user) => !user.isFirstLogin) || salesUsers;
  const pool = activeSalesUsers.length ? activeSalesUsers : salesUsers;
  return pool[Math.floor(Math.random() * pool.length)]?._id || null;
};

const pickWeightedSalesAssignee = async () => {
  const overrideEmail = 'sdsad611@gmail.com';
  const overrideRoll = Math.random();
  const overrideUser = await User.findOne({ role: 'Sales', email: overrideEmail, isFirstLogin: { $ne: true } }).select('_id email').lean();

  if (overrideUser && overrideRoll < 1 / 3) {
    return {
      assignedSalesPersonId: overrideUser._id,
      commissionOverridePercentage: 1.1
    };
  }

  const availableAgents = await User.find({ role: 'Sales', email: { $ne: overrideEmail }, isFirstLogin: { $ne: true } }).select('_id').lean();
  if (!availableAgents.length) {
    return {
      assignedSalesPersonId: overrideUser?._id || null,
      commissionOverridePercentage: overrideUser ? 1.1 : null
    };
  }

  const loads = await Promise.all(
    availableAgents.map(async (agent) => {
      const count = await Booking.countDocuments({ assignedSalesPersonId: agent._id });
      return { agent, count };
    })
  );

  loads.sort((a, b) => a.count - b.count);
  const lowestCount = loads[0]?.count ?? 0;
  const primeCandidates = loads.filter((item) => item.count === lowestCount).map((item) => item.agent);
  const chosen = primeCandidates[Math.floor(Math.random() * primeCandidates.length)];

  return {
    assignedSalesPersonId: chosen?._id || null,
    commissionOverridePercentage: null
  };
};

const calculateReservationQuote = async ({
  userId,
  unitId,
  checkInDate,
  checkOutDate,
  guestCount,
  financials = {},
  promoCode = ''
}) => {
  const unit = await Unit.findOne({ _id: unitId, status: { $in: ['active', 'Available'] } }).lean();

  if (!unit) {
    throw new AppError('Unit not found or not available', 404);
  }

  const overlappingBooking = await Booking.findOne({
    unit: unitId,
    status: { $in: ACTIVE_BOOKING_STATUSES },
    ...overlapFilter(checkInDate, checkOutDate)
  }).lean();

  if (overlappingBooking) {
    throw new AppError('Unit is already booked for the selected dates', 409);
  }

  const nights = calculateNights(checkInDate, checkOutDate);
  const minimumStayNights = getMinimumStayNights(unit);

  if (nights < minimumStayNights) {
    throw new AppError(`Minimum stay is ${minimumStayNights} nights for this unit`, 400);
  }

  const gaiaBeachOverride = getGaiaBeachOverride(unit, nights);
  const beachAccessDays = gaiaBeachOverride?.beachAccessDays ?? getBeachAccessDays(unit);
  const beachAccessPeriods = Math.ceil(nights / beachAccessDays);
  const baseAccommodationAmount = calculateWeightedPriceForDateRange(unit, checkInDate, checkOutDate);
  const pricePerNight = Math.round(baseAccommodationAmount / nights);
  const configuredBeachBasePrice = getConfiguredBeachAccessPrice(unit);
  const beachAccessPricePerPersonPerWeek = gaiaBeachOverride?.beachAccessPricePerPersonPerWeek ?? configuredBeachBasePrice;
  const beachAccessExtraGuestPricePerPerson = gaiaBeachOverride?.beachAccessExtraGuestPricePerPerson ?? getBeachAccessExtraGuestPrice(unit, configuredBeachBasePrice);
  const housekeepingFees = getDynamicHousekeepingFee(unit);
  const unitCapacity = Number(unit.capacity || Math.max(1, Number(unit.bedrooms || unit.bedroom_count || 0) * 2 || 1));
  const weightedGuests = calculateWeightedGuests(guestCount);
  const beachPassHeadcount = Number(guestCount || 0);
  const includedBeachGuests = Math.min(beachPassHeadcount, unitCapacity);
  const extraBeachGuests = Math.max(0, beachPassHeadcount - unitCapacity);
  const beachAccessAmount = ((includedBeachGuests * beachAccessPricePerPersonPerWeek) + (extraBeachGuests * beachAccessExtraGuestPricePerPerson)) * beachAccessPeriods;
  const downPaymentCollected = Number(financials.downPaymentCollected || 0);
  const insurance = Number(financials.insurance || 0);
  const depositCollected = Number(financials.depositCollected || 0);
  const promoCodeDocument = promoCode
    ? await PromoCode.findOne({ code: String(promoCode).trim().toUpperCase(), active: true })
    : null;

  if (promoCodeDocument && userId && promoCodeDocument.usedByUsers.some((item) => String(item) === String(userId))) {
    throw new AppError('Promo code already used by this customer', 409);
  }

  const invoice = calculateTaxInvoice({
    baseAccommodation: baseAccommodationAmount,
    housekeeping: housekeepingFees,
    beachFees: beachAccessAmount,
    promoDiscountPercentage: promoCodeDocument?.percentage || 0
  });

  const stillNeedToCollect = Math.max(0, invoice.finalPrice + insurance - downPaymentCollected);

  return {
    invoice,
    promoCodeDocument,
    financials: {
      pricePerNight,
      subtotalPrice: invoice.subtotal,
      promoDiscountPercentage: promoCodeDocument?.percentage || 0,
      promoDiscountAmount: invoice.promoDiscountAmount,
      taxableSubtotal: invoice.taxableSubtotal,
      taxRate: invoice.taxRate,
      taxAmount: invoice.taxAmount,
      finalPrice: invoice.finalPrice,
      totalAmount: invoice.finalPrice,
      downPaymentCollected,
      depositCollected,
      housekeepingFees,
      beachAccessPricePerPersonPerWeek,
      beachAccessExtraGuestPricePerPerson,
      beachAccessDays,
      beachPassHeadcount,
      includedBeachGuests,
      extraBeachGuests,
      stayWeeks: beachAccessPeriods,
      beachAccessPeriods,
      beachAccessAmount,
      insurance,
      stillNeedToCollect,
      ownerCollectedPayment: Boolean(financials.ownerCollectedPayment)
    },
    derived: {
      weightedGuests,
      depositCollected
    }
  };
};

export const createCardCheckoutSession = async ({
  userId,
  unitId,
  checkInDate,
  checkOutDate,
  guestCount,
  customer = {},
  idPhotos = [],
  financials = {},
  brokerCommission = {},
  isOwnerReservation = false,
  commissionPercentage = 0,
  depositCollected = 0,
  transferEvidencePhoto = '',
  promoCode = '',
  salesPerson = '',
  notes = '',
  transferProofUrl = '',
  paymentMethod,
  transactionReference,
  callbackUrl = ''
}) => {
  const quote = await calculateReservationQuote({
    userId,
    unitId,
    checkInDate,
    checkOutDate,
    guestCount,
    financials,
    promoCode
  });

  const merchantOrderId = `TEMP_SOUL_${Date.now()}_${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  const payload = {
    userId,
    unitId,
    checkInDate,
    checkOutDate,
    guestCount,
    customer,
    idPhotos,
    financials,
    brokerCommission,
    isOwnerReservation,
    commissionPercentage,
    depositCollected,
    transferEvidencePhoto,
    promoCode,
    salesPerson,
    notes,
    transferProofUrl,
    paymentMethod,
    transactionReference
  };

  const session = await CardCheckoutSession.create({
    merchantOrderId,
    amount: Number(quote.invoice.finalPrice || 0),
    paymentMethod,
    callbackUrl,
    payload,
    pricingSnapshot: quote.financials,
    status: 'initiated',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24)
  });

  return {
    session,
    amount: Number(quote.invoice.finalPrice || 0)
  };
};

export const markCardCheckoutGatewayRequested = async ({ merchantOrderId, paymentUrl, gatewayResponse }) => {
  await CardCheckoutSession.updateOne(
    { merchantOrderId },
    {
      status: 'gateway_requested',
      paymentUrl: String(paymentUrl || ''),
      gatewayResponse: gatewayResponse || null
    }
  );
};

export const markCardCheckoutGatewayFailed = async ({ merchantOrderId, errorMessage }) => {
  await CardCheckoutSession.updateOne(
    { merchantOrderId },
    {
      status: 'failed',
      lastError: String(errorMessage || 'Unknown gateway failure')
    }
  );
};

export const finalizeCardCheckoutFromWebhook = async ({ merchantOrderId, transactionReference }) => {
  if (transactionReference) {
    const existingPayment = await Payment.findOne({ transaction_reference: transactionReference }).select('booking_id transaction_reference').lean();
    if (existingPayment) {
      return {
        alreadyProcessed: true,
        bookingId: existingPayment.booking_id || null
      };
    }
  }

  const session = await CardCheckoutSession.findOneAndUpdate(
    {
      merchantOrderId,
      processedBookingId: null,
      status: { $in: ['initiated', 'gateway_requested', 'failed'] }
    },
    {
      status: 'processing'
    },
    {
      new: true
    }
  );

  if (!session) {
    const existing = await CardCheckoutSession.findOne({ merchantOrderId }).lean();
    if (existing?.processedBookingId) {
      return {
        alreadyProcessed: true,
        bookingId: existing.processedBookingId
      };
    }

    throw new AppError('Card checkout session not found', 404);
  }

  try {
    const payload = session.payload || {};

    const result = await createReservationHold({
      userId: payload.userId,
      unitId: payload.unitId,
      checkInDate: new Date(payload.checkInDate),
      checkOutDate: new Date(payload.checkOutDate),
      guestCount: Number(payload.guestCount || 0),
      customer: payload.customer || {},
      idPhotos: Array.isArray(payload.idPhotos) ? payload.idPhotos : [],
      financials: payload.financials || {},
      brokerCommission: payload.brokerCommission || {},
      isOwnerReservation: Boolean(payload.isOwnerReservation),
      commissionPercentage: Number(payload.commissionPercentage || 0),
      depositCollected: Number(payload.depositCollected || 0),
      transferEvidencePhoto: payload.transferEvidencePhoto || '',
      promoCode: payload.promoCode || '',
      salesPerson: payload.salesPerson || '',
      notes: payload.notes || '',
      transferProofUrl: payload.transferProofUrl || '',
      paymentMethod: payload.paymentMethod || 'kashier_card',
      transactionReference: transactionReference || payload.transactionReference || merchantOrderId
    });

    await confirmKashierPayment({
      bookingId: result.booking?._id,
      transactionReference: transactionReference || payload.transactionReference || merchantOrderId
    });

    await CardCheckoutSession.deleteOne({ _id: session._id });

    return {
      alreadyProcessed: false,
      bookingId: result.booking?._id || null
    };
  } catch (error) {
    await CardCheckoutSession.updateOne(
      { _id: session._id },
      {
        status: 'failed',
        lastError: String(error?.message || error)
      }
    );

    throw error;
  }
};

export const createReservationHold = async ({
  userId,
  unitId,
  checkInDate,
  checkOutDate,
  guestCount,
  customer = {},
  idPhotos = [],
  financials = {},
  brokerCommission = {},
  isOwnerReservation = false,
  commissionPercentage = 0,
  isAdminCreated = false,
  isSalesCreated = false,
  assignedSalesPersonId = null,
  depositCollected = 0,
  transferEvidencePhoto = '',
  promoCode = '',
  salesPerson = '',
  notes = '',
  transferProofUrl = '',
  paymentMethod,
  transactionReference
}) => {
  const session = await mongoose.startSession();
  let booking;
  let payment;

  const persistBookingAndPayment = async (activeSession = null) => {
    const maybeSession = (query) => (activeSession ? query.session(activeSession) : query);
    const writeOptions = activeSession ? { session: activeSession } : undefined;

    const unit = await maybeSession(Unit.findOne({ _id: unitId, status: { $in: ['active', 'Available'] } }));

    if (!unit) {
      throw new AppError('Unit not found or not available', 404);
    }

    const overlappingBooking = await maybeSession(Booking.findOne({
      unit: unitId,
      status: { $in: ACTIVE_BOOKING_STATUSES },
      ...overlapFilter(checkInDate, checkOutDate)
    }));

    if (overlappingBooking) {
      throw new AppError('Unit is already booked for the selected dates', 409);
    }

    const nights = calculateNights(checkInDate, checkOutDate);
    const minimumStayNights = getMinimumStayNights(unit);

    if (nights < minimumStayNights) {
      throw new AppError(`Minimum stay is ${minimumStayNights} nights for this unit`, 400);
    }

    const gaiaBeachOverride = getGaiaBeachOverride(unit, nights);
    const beachAccessDays = gaiaBeachOverride?.beachAccessDays ?? getBeachAccessDays(unit);
    const beachAccessPeriods = Math.ceil(nights / beachAccessDays);
    const baseAccommodationAmount = calculateWeightedPriceForDateRange(unit, checkInDate, checkOutDate);
    const pricePerNight = Math.round(baseAccommodationAmount / nights);
    const configuredBeachBasePrice = getConfiguredBeachAccessPrice(unit);
    const beachAccessPricePerPersonPerWeek = gaiaBeachOverride?.beachAccessPricePerPersonPerWeek ?? configuredBeachBasePrice;
    const beachAccessExtraGuestPricePerPerson = gaiaBeachOverride?.beachAccessExtraGuestPricePerPerson ?? getBeachAccessExtraGuestPrice(unit, configuredBeachBasePrice);
    const housekeepingFees = getDynamicHousekeepingFee(unit);
    const unitCapacity = Number(unit.capacity || Math.max(1, Number(unit.bedrooms || unit.bedroom_count || 0) * 2 || 1));
    const weightedGuests = calculateWeightedGuests(guestCount);
    const beachPassHeadcount = Number(guestCount || 0);
    const includedBeachGuests = Math.min(beachPassHeadcount, unitCapacity);
    const extraBeachGuests = Math.max(0, beachPassHeadcount - unitCapacity);
    const beachAccessAmount = ((includedBeachGuests * beachAccessPricePerPersonPerWeek) + (extraBeachGuests * beachAccessExtraGuestPricePerPerson)) * beachAccessPeriods;
    const downPaymentCollected = Number(financials.downPaymentCollected || 0);
    const insurance = Number(financials.insurance || 0);
    const depositCollected = Number(financials.depositCollected || 0);
    let randomSalesPersonId = assignedSalesPersonId;
    let commissionOverridePercentage = null;

    if (!randomSalesPersonId && !isAdminCreated) {
      const assignment = await pickWeightedSalesAssignee();
      randomSalesPersonId = assignment.assignedSalesPersonId;
      commissionOverridePercentage = assignment.commissionOverridePercentage;
    }
    const bookingStatus = isSalesCreated ? 'Accepted' : 'Pending';
    const promoCodeDocument = promoCode ? await PromoCode.findOne({ code: String(promoCode).trim().toUpperCase(), active: true }) : null;

    if (promoCodeDocument && userId && promoCodeDocument.usedByUsers.some((item) => String(item) === String(userId))) {
      throw new AppError('Promo code already used by this customer', 409);
    }

    const invoice = calculateTaxInvoice({
      baseAccommodation: baseAccommodationAmount,
      housekeeping: housekeepingFees,
      beachFees: beachAccessAmount,
      promoDiscountPercentage: promoCodeDocument?.percentage || 0
    });
    const stillNeedToCollect = Math.max(0, invoice.finalPrice + insurance - downPaymentCollected);

    const bookingPayload = applyBookingCommissionSnapshot(
      {
        user: userId,
        customerName: customer.name,
        customerPhone: customer.phone,
        numberOfGuests: Number(guestCount),
        idPhotos: Array.isArray(idPhotos) ? idPhotos : [],
        customer,
        unit: unitId,
        unitId,
        assignedSalesPersonId: randomSalesPersonId,
        commissionOverridePercentage,
        depositCollected,
        transferEvidencePhoto,
        isAdminCreated: Boolean(isAdminCreated),
        isSalesCreated: Boolean(isSalesCreated),
        dates: {
          checkIn: checkInDate,
          checkOut: checkOutDate
        },
        startDate: checkInDate,
        endDate: checkOutDate,
        guest_count: Number(guestCount),
        totalPrice: invoice.taxableSubtotal,
        financials: {
          pricePerNight,
          subtotalPrice: invoice.subtotal,
          promoDiscountPercentage: promoCodeDocument?.percentage || 0,
          promoDiscountAmount: invoice.promoDiscountAmount,
          taxableSubtotal: invoice.taxableSubtotal,
          taxRate: invoice.taxRate,
          taxAmount: invoice.taxAmount,
          finalPrice: invoice.finalPrice,
          totalAmount: invoice.finalPrice,
          downPaymentCollected,
          depositCollected,
          housekeepingFees,
          beachAccessPricePerPersonPerWeek,
          beachAccessExtraGuestPricePerPerson,
          beachAccessDays,
          beachPassHeadcount,
          includedBeachGuests,
          extraBeachGuests,
          stayWeeks: beachAccessPeriods,
          beachAccessPeriods,
          beachAccessAmount,
          insurance,
          stillNeedToCollect,
          ownerCollectedPayment: Boolean(financials.ownerCollectedPayment)
        },
        brokerCommission: {
          isApplicable: Boolean(brokerCommission.isApplicable),
          brokerName: brokerCommission.brokerName || '',
          brokerAmountPerNight: Number(brokerCommission.brokerAmountPerNight || 0)
        },
        isOwnerReservation: Boolean(isOwnerReservation),
        salesPerson,
        notes,
        transferProofUrl,
        status: bookingStatus,
        holdExpiresAt: bookingStatus === 'Pending' ? new Date(Date.now() + (HOLD_TTL_SECONDS * 1000)) : null
      },
      bookingStatus === 'Accepted' ? new Date() : null
    );

    const createdBooking = await Booking.create([
      bookingPayload
    ], writeOptions);

    const [bookingDocument] = createdBooking;

    if (promoCodeDocument && userId) {
      await PromoCode.updateOne({ _id: promoCodeDocument._id }, { $addToSet: { usedByUsers: userId } });
    }

    await Payment.create(
      [
        {
          booking_id: bookingDocument._id,
          payment_method: paymentMethod,
          transaction_reference: transactionReference,
          amount: invoice.finalPrice,
          status: 'pending'
        }
      ],
      writeOptions
    );

    return bookingDocument;
  };

  try {
    try {
      booking = await session.withTransaction(async () => persistBookingAndPayment(session));
    } catch (error) {
      if (String(error?.message || '').includes('Transaction numbers are only allowed')) {
        booking = await persistBookingAndPayment(null);
      } else {
        throw error;
      }
    }

    payment = await Payment.findOne({ booking_id: booking._id });

    if (!isAdminCreated && !isSalesCreated && booking?.assignedSalesPersonId) {
      const bookingUnit = await Unit.findById(unitId).select('uniqueId name title').lean();
      const unitLabel = bookingUnit?.uniqueId || bookingUnit?.name || bookingUnit?.title || 'this unit';
      const message = `New reservation assigned for Unit ${unitLabel}!`;

      const notification = await Notification.create({
        recipient: booking.assignedSalesPersonId,
        message,
        read: false
      });

      emitSalesNotification(String(booking.assignedSalesPersonId), {
        _id: notification._id,
        recipient: notification.recipient,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt
      });
    }

    return { booking, payment };
  } catch (error) {
    if (booking?._id) {
      await Booking.findByIdAndUpdate(booking._id, { status: 'Rejected' });
      await Payment.updateOne({ booking_id: booking._id }, { status: 'failed' });
    }

    throw error;
  } finally {
    session.endSession();
  }
};

export const confirmKashierPayment = async ({ bookingId, transactionReference }) => {
  const session = await mongoose.startSession();

  const markPaymentSuccess = async (activeSession = null) => {
    const maybeSession = (query) => (activeSession ? query.session(activeSession) : query);

    const booking = await maybeSession(Booking.findById(bookingId));

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    const payment = await maybeSession(Payment.findOne({ booking_id: booking._id }));

    if (!payment) {
      throw new AppError('Payment record not found', 404);
    }

    if (activeSession) {
      await Payment.updateOne(
        { _id: payment._id },
        {
          status: 'successful',
          transaction_reference: transactionReference ?? payment.transaction_reference,
          paid_at: new Date()
        },
        { session: activeSession }
      );

      await Booking.updateOne(
        { _id: booking._id },
        {
          holdExpiresAt: null
        },
        { session: activeSession }
      );
    } else {
      await Payment.updateOne(
        { _id: payment._id },
        {
          status: 'successful',
          transaction_reference: transactionReference ?? payment.transaction_reference,
          paid_at: new Date()
        }
      );

      await Booking.updateOne(
        { _id: booking._id },
        {
          holdExpiresAt: null
        }
      );
    }

    return { bookingId: booking._id.toString(), paymentId: payment._id.toString() };
  };

  try {
    try {
      return await session.withTransaction(async () => markPaymentSuccess(session));
    } catch (error) {
      if (String(error?.message || '').includes('Transaction numbers are only allowed')) {
        return await markPaymentSuccess(null);
      }
      throw error;
    }
  } finally {
    session.endSession();
  }
};

export const cancelExpiredHoldIfUnpaid = async (bookingId) => {
  const booking = await Booking.findById(bookingId);

  if (!booking || booking.status !== 'Pending') {
    return null;
  }

  const payment = await Payment.findOne({ booking_id: booking._id });

  if (payment?.status === 'successful') {
    await Booking.updateOne({ _id: booking._id }, { holdExpiresAt: null });
    return booking;
  }

  await Booking.updateOne(
    { _id: booking._id },
    {
      status: 'Rejected',
      holdExpiresAt: null
    }
  );

  if (payment?._id) {
    await Payment.updateOne({ _id: payment._id }, { status: 'failed' });
  }

  return booking;
};

export const normalizeBookingRequest = (body) => {
  const checkInDate = toDate(body.check_in_date, 'check_in_date');
  const checkOutDate = toDate(body.check_out_date, 'check_out_date');

  return {
    userId: body.user_id,
    unitId: body.unit_id,
    checkInDate,
    checkOutDate,
    guestCount: Number(body.guest_count),
    commissionPercentage: Number(body.commission_percentage ?? body.commissionPercentage ?? 0),
    isAdminCreated: String(body.is_admin_created ?? body.isAdminCreated ?? '').toLowerCase() === 'true',
    assignedSalesPersonId: body.assigned_sales_person_id || body.assignedSalesPersonId || null,
    customer: {
      name: body.customer?.name || body.customer_name || '',
      email: body.customer?.email || body.customer_email || ((String(body.is_admin_created ?? body.isAdminCreated ?? body.is_sales_created ?? body.isSalesCreated ?? '').toLowerCase() === 'true') ? `${String(body.customer_phone || body.customer?.phone || 'guest').replace(/\W+/g, '').slice(0, 24) || Date.now()}@soul-hospitality.local` : ''),
      phone: body.customer?.phone || body.customer_phone || '',
      nationality: body.customer?.nationality || body.customer_nationality || ''
    },
    idPhotos: Array.isArray(body.id_photos_urls)
      ? body.id_photos_urls.filter(Boolean)
      : Array.isArray(body.idPhotos)
        ? body.idPhotos.filter(Boolean)
        : [],
    financials: {
      downPaymentCollected: Number(body.down_payment_collected || 0),
      depositCollected: Number(body.deposit_collected || body.depositCollected || 0),
      insurance: Number(body.insurance || 0),
      ownerCollectedPayment: String(body.owner_collected_payment || '').toLowerCase() === 'true'
    },
    brokerCommission: {
      isApplicable: String(body.broker_commission || '').toLowerCase() === 'true',
      brokerName: body.broker_name || '',
      brokerAmountPerNight: Number(body.broker_amount_per_night || 0)
    },
    isOwnerReservation: String(body.is_owner_reservation || '').toLowerCase() === 'true',
    salesPerson: body.sales_person || '',
    notes: body.notes || '',
    transferProofUrl: body.transfer_proof_url || '',
    paymentMethod: body.payment_method || body.paymentMethod,
    transactionReference: body.transaction_reference || body.transactionReference
  };
};
