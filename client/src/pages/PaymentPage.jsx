import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Banknote, Building2, Calendar, CreditCard, ShieldCheck, Wallet } from 'lucide-react';
import { createBookingHold } from '../api/http.js';
import { BOOKING_POLICIES } from '../constants/bookingPolicies.js';
import { calculateTaxInvoice } from '../utils/taxInvoice.js';

const GAIA_BEACH_ACCESS_DAYS = 7;
const GAIA_BEACH_BASE_PRICE = 3500;
const GAIA_BEACH_EXTRA_PRICE = 4000;

const getDynamicHousekeepingFee = (unit) => {
  const propertyType = String(unit?.propertyType || unit?.type || '').trim().toLowerCase();
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

const getBeachAccessExtraGuestPrice = (unit, fallbackPrice) => Number(
  unit?.beachAccessExtraGuestPricePerPerson ??
  unit?.beach_access_extra_guest_price_per_person ??
  fallbackPrice
);

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const checkoutState = location.state;
  const callbackQuery = new URLSearchParams(location.search || '');
  const callbackStatus = callbackQuery.get('status');
  const callbackBookingId = callbackQuery.get('booking_id');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [successCard, setSuccessCard] = useState(null);

  const formatPrice = (value) => `EGP ${Number(value || 0).toLocaleString()}`;

  const renderSuccessCard = () => {
    if (!successCard) {
      return null;
    }

    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-slate-50 px-4 text-center animate-fade-in">
        <div className="max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <h2 className="font-serif text-2xl font-bold text-slate-900">Reservation Request Submitted</h2>
          <p className="mt-3 text-sm text-slate-600">{successCard.description}</p>
          <p className="mt-2 text-sm text-slate-500">Our team will contact you with an official update within 24 hours.</p>
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => navigate('/units')}
              className="rounded-full bg-[#283f5e] px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white hover:bg-slate-800"
            >
              Back to stays
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Allow callback fallback page after third-party payment redirect.
  if (!checkoutState && callbackStatus === 'success') {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-slate-50 px-4 text-center animate-fade-in">
        <div className="max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <h2 className="font-serif text-2xl font-bold text-slate-900">Payment Callback Received</h2>
          <p className="mt-3 text-sm text-slate-600">Your payment callback has been captured for booking {callbackBookingId || 'reference'}.</p>
          <p className="mt-2 text-sm text-slate-500">Your reservation status remains Pending until a manual admin review is completed within 24 hours.</p>
          <button
            type="button"
            onClick={() => navigate('/units')}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-[#283f5e] px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white hover:bg-slate-800"
          >
            Back to stays
          </button>
        </div>
      </div>
    );
  }

  // Redirect if no checkout state is found
  if (!checkoutState) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-slate-50 px-4 text-center animate-fade-in">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <h2 className="font-serif text-2xl font-bold text-slate-900">No Booking Data Found</h2>
          <p className="mt-3 text-sm text-slate-500">
            It looks like you don't have an active checkout session. Please search for stays and begin checkout first.
          </p>
          <button
            type="button"
            onClick={() => navigate('/units')}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#283f5e] px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white shadow-md transition-all duration-300 ease-out hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#283f5e]/45"
          >
            <ArrowLeft className="h-4 w-4" /> Go to Stays
          </button>
        </div>
      </div>
    );
  }

  if (successCard) {
    return renderSuccessCard();
  }

  const { unit, formState, nights, nightlyRate, totalAmount } = checkoutState;
  const gaiaBeachOverride = getGaiaBeachOverride(unit, nights);
  const beachAccessDays = checkoutState.beachAccessDays ?? gaiaBeachOverride?.beachAccessDays ?? getBeachAccessDays(unit);
  const stayWeeks = checkoutState.stayWeeks ?? (nights > 0 ? Math.ceil(nights / beachAccessDays) : 0);
  const subtotalAmount = checkoutState.subtotalAmount ?? totalAmount;
  const housekeepingMandatoryPrice = checkoutState.housekeepingMandatoryPrice ?? getDynamicHousekeepingFee(unit);
  const configuredBeachBasePrice = getConfiguredBeachAccessPrice(unit);
  const beachAccessPricePerPersonPerWeek = checkoutState.beachAccessPricePerPersonPerWeek ?? gaiaBeachOverride?.beachAccessPricePerPersonPerWeek ?? configuredBeachBasePrice;
  const beachAccessExtraGuestPricePerPerson = checkoutState.beachAccessExtraGuestPricePerPerson ?? gaiaBeachOverride?.beachAccessExtraGuestPricePerPerson ?? getBeachAccessExtraGuestPrice(unit, configuredBeachBasePrice);
  const beachPassHeadcount = checkoutState.beachPassHeadcount ?? Number(formState?.adults || 0);
  const includedBeachGuests = checkoutState.includedBeachGuests ?? Math.min(beachPassHeadcount, Number(unit?.capacity || 0));
  const extraBeachGuests = checkoutState.extraBeachGuests ?? Math.max(0, beachPassHeadcount - includedBeachGuests);
  const beachAccessAmount = checkoutState.beachAccessAmount ?? (((includedBeachGuests * beachAccessPricePerPersonPerWeek) + (extraBeachGuests * beachAccessExtraGuestPricePerPerson)) * stayWeeks);
  const beachAccessPricingLabel = beachAccessExtraGuestPricePerPerson !== beachAccessPricePerPersonPerWeek
    ? `${formatPrice(beachAccessPricePerPersonPerWeek)} base + ${formatPrice(beachAccessExtraGuestPricePerPerson)} extra`
    : `${formatPrice(beachAccessPricePerPersonPerWeek)} per guest`;
  const grossAmount = checkoutState.grossAmount ?? (subtotalAmount + housekeepingMandatoryPrice + beachAccessAmount);
  const discountPercentage = checkoutState.discountPercentage ?? 0;
  const discountAmount = checkoutState.discountAmount ?? 0;
  const invoice = calculateTaxInvoice({ subtotal: grossAmount, promoDiscountPercentage: discountPercentage });
  const promoCode = checkoutState.promoCode || '';
  const taxAmount = checkoutState.taxAmount ?? invoice.taxAmount;
  const finalTotalAmount = checkoutState.finalTotalAmount ?? invoice.finalPrice;
  const taxableSubtotal = invoice.taxableSubtotal;

  const handlePaymentSelection = (method) => {
    setSelectedMethod(method);
    setMessage('');
  };

  const handleConfirmReservation = async () => {
    if (!selectedMethod) {
      setMessage('Please select a payment method first.');
      return;
    }

    const identityDocuments = Array.isArray(formState?.identityDocuments) ? formState.identityDocuments : [];

    if (identityDocuments.length === 0) {
      setMessage('Please upload ID or passport photos before confirming payment.');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const payload = new FormData();
      payload.append('unit_id', unit?._id || '');
      payload.append('check_in_date', formState.checkInDate);
      payload.append('check_out_date', formState.checkOutDate);
      payload.append('guest_count', String(Number(formState.adults || 0) + Number(formState.children || 0)));
      payload.append('customer_name', formState.fullName || '');
      payload.append('customer_phone', formState.phone || '');
      payload.append('customer_email', formState.email || '');
      payload.append('notes', formState.notes || '');
      payload.append('payment_method', selectedMethod);
      payload.append('promo_code', promoCode);

      if (selectedMethod === 'kashier_card') {
        payload.append('callback_url', `${window.location.origin}/checkout/payment/callback?status=success`);
      }

      if (selectedMethod === 'cash') {
        payload.append('down_payment_collected', String(Math.ceil(Number(finalTotalAmount || 0) * 0.5)));
      }

      identityDocuments.forEach((file) => payload.append('id_photos', file));

      const response = await createBookingHold(payload);
      const booking = response?.booking || response?.data?.booking || response?.data?.data?.booking;
      const backendCheckoutUrl = response?.payment?.checkoutUrl || response?.data?.payment?.checkoutUrl || response?.data?.data?.payment?.checkoutUrl;

      if (selectedMethod === 'kashier_card') {
        if (backendCheckoutUrl) {
          window.location.assign(backendCheckoutUrl);
          return;
        }

        const checkoutUrl = import.meta.env.VITE_KASHIER_CHECKOUT_URL || '';
        if (checkoutUrl) {
          const callbackUrl = `${window.location.origin}/checkout/payment/callback?status=success`;
          const delimiter = checkoutUrl.includes('?') ? '&' : '?';
          window.location.assign(`${checkoutUrl}${delimiter}booking_id=${booking?._id || ''}&callback_url=${encodeURIComponent(callbackUrl)}`);
          return;
        }

        setMessage('Card checkout is not configured yet. Please set the Kashier payment session credentials on the backend.');
        return;
      }

      if (selectedMethod === 'instapay') {
        setSuccessCard({
          description: 'InstaPay reservation request is marked as Pending. You will receive an official response within 24 hours.'
        });
        return;
      }

      setSuccessCard({
        description: 'Cash reservation request recorded as Pending. A mandatory 50% deposit clearance is required to validate your booking entry.'
      });
    } catch (submitError) {
      setMessage(submitError.message || 'Unable to complete reservation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* Navigation header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#283f5e] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to reservation details
          </button>
          <h1 className="mt-3 font-serif text-3xl font-bold text-slate-900 md:text-4xl 2xl:text-6xl">Secure Checkout</h1>
          <p className="mt-1.5 text-sm text-slate-500 2xl:text-base">Decoupled payment gateway execution pipeline.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8 2xl:gap-10">
          {/* Sidebar Invoice Overview Card */}
          <div className="order-1 lg:order-2 lg:col-span-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
              <h2 className="text-lg font-bold text-slate-900 2xl:text-2xl">Reservation Summary</h2>

              {/* Unit Info */}
              <div className="mt-4 border-b border-slate-100 pb-4">
                <p className="text-2xs font-semibold uppercase tracking-wider text-slate-400 2xl:text-xs">{unit?.projectName || unit?.location}</p>
                <h3 className="mt-1 text-sm font-bold text-slate-800 2xl:text-base">{unit?.name || unit?.title}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 text-2xs font-medium text-slate-500 2xl:text-xs">
                    <Building2 className="h-3 w-3" /> {unit?.type || 'Residence'}
                  </span>
                </div>
              </div>

              {/* Dates Info */}
              <div className="mt-4 space-y-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3 text-xs text-slate-600 2xl:text-sm">
                  <Calendar className="h-4 w-4 text-[#283f5e]" />
                  <div>
                    <p className="font-semibold text-slate-700">Check-in</p>
                    <p>{new Date(formState.checkInDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600 2xl:text-sm">
                  <Calendar className="h-4 w-4 text-[#283f5e]" />
                  <div>
                    <p className="font-semibold text-slate-700">Check-out</p>
                    <p>{new Date(formState.checkOutDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Invoice Calculations */}
              <div className="mt-4 space-y-2 text-xs text-slate-600 2xl:text-sm">
                <div className="flex justify-between">
                  <span>Nightly Rate (Base)</span>
                  <span className="font-semibold text-slate-800">{formatPrice(unit?.pricePerNight || unit?.price || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration</span>
                  <span className="font-semibold text-slate-800">{nights} {nights === 1 ? 'night' : 'nights'} ({stayWeeks} {stayWeeks === 1 ? 'period' : 'periods'} of {beachAccessDays} {beachAccessDays === 1 ? 'day' : 'days'})</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">{formatPrice(subtotalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Housekeeping mandatory fee</span>
                  <span className="font-semibold text-slate-800">{formatPrice(housekeepingMandatoryPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Beach pass fees - adults only ({includedBeachGuests} base + {extraBeachGuests} extra)</span>
                  <span className="font-semibold text-slate-800">{formatPrice(beachAccessAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Beach access pricing</span>
                  <span className="font-semibold text-slate-800">{beachAccessPricingLabel} / {beachAccessDays} {beachAccessDays === 1 ? 'day' : 'days'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Invoice before discount</span>
                  <span className="font-semibold text-slate-800">{formatPrice(grossAmount)}</span>
                </div>
                {promoCode ? (
                  <div className="flex justify-between text-emerald-700">
                    <span>Promo Code {promoCode} ({discountPercentage}%)</span>
                    <span className="font-semibold">- {formatPrice(discountAmount)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <span>Taxable subtotal</span>
                  <span className="font-semibold text-slate-800">{formatPrice(taxableSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes (14% VAT)</span>
                  <span className="font-semibold text-slate-800">{formatPrice(taxAmount)}</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between border-t border-slate-100 pt-3">
                  <span className="text-sm font-bold text-slate-800 2xl:text-base">Final Invoice Total</span>
                  <span className="text-xl font-bold text-[#283f5e] 2xl:text-2xl">{formatPrice(finalTotalAmount)}</span>
                </div>
              </div>

              {/* Extra Info */}
              <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[10px] leading-relaxed text-rose-700 2xl:text-xs">
                Final bill applies dynamic housekeeping, mandatory beach pass fees, and a fixed 14% VAT before gateway processing.
              </p>

              <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <h3 className="text-sm font-bold text-rose-900 2xl:text-base">Booking Policies</h3>
                <ul className="mt-3 space-y-2 text-xs text-rose-700 2xl:text-sm">
                  {BOOKING_POLICIES.map((policy) => (
                    <li key={policy} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-rose-600" />
                      <span>{policy}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Main Payment Section */}
          <div className="order-2 space-y-6 lg:order-1 lg:col-span-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-bold text-slate-900 2xl:text-3xl">Select Gateway Option</h2>
              <p className="mt-1 text-sm text-slate-500 2xl:text-base">Please choose one of the available payment methods below to complete your hold.</p>

              {/* Gateway Cards Grid */}
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:gap-6">
                {/* Instapay Card */}
                <button
                  type="button"
                  onClick={() => handlePaymentSelection('instapay')}
                  className={`flex flex-col items-center justify-between rounded-3xl border-2 p-5 text-center transition-all duration-300 ${
                    selectedMethod === 'instapay'
                      ? 'border-indigo-600 bg-indigo-50/20 shadow-md ring-2 ring-indigo-600/10 scale-102'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <Wallet className="h-6 w-6" strokeWidth={1.8} />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm font-bold text-slate-900">Instapay Wallet</h3>
                    <p className="mt-1 text-xs text-slate-400">Instant mobile bank transfer</p>
                  </div>
                  <span
                    className={`mt-4 rounded-full px-2.5 py-0.5 text-2xs font-semibold transition-all ${
                      selectedMethod === 'instapay' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {selectedMethod === 'instapay' ? 'Selected' : 'Select'}
                  </span>
                </button>

                {/* Kashier Card */}
                <button
                  type="button"
                  onClick={() => handlePaymentSelection('kashier_card')}
                  className={`flex flex-col items-center justify-between rounded-3xl border-2 p-5 text-center transition-all duration-300 ${
                    selectedMethod === 'kashier_card'
                      ? 'border-blue-600 bg-blue-50/20 shadow-md ring-2 ring-blue-600/10 scale-102'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <CreditCard className="h-6 w-6" strokeWidth={1.8} />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm font-bold text-slate-900">Kashier Card</h3>
                    <p className="mt-1 text-xs text-slate-400">Debit or credit card payment</p>
                  </div>
                  <span
                    className={`mt-4 rounded-full px-2.5 py-0.5 text-2xs font-semibold transition-all ${
                      selectedMethod === 'kashier_card' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {selectedMethod === 'kashier_card' ? 'Selected' : 'Select'}
                  </span>
                </button>

                {/* Cash Card */}
                <button
                  type="button"
                  onClick={() => handlePaymentSelection('cash')}
                  className={`flex flex-col items-center justify-between rounded-3xl border-2 p-5 text-center transition-all duration-300 ${
                    selectedMethod === 'cash'
                      ? 'border-emerald-600 bg-emerald-50/20 shadow-md ring-2 ring-emerald-600/10 scale-102'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <Banknote className="h-6 w-6" strokeWidth={1.8} />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm font-bold text-slate-900">Cash Payment</h3>
                    <p className="mt-1 text-xs text-slate-400">Physical currency on arrival</p>
                  </div>
                  <span
                    className={`mt-4 rounded-full px-2.5 py-0.5 text-2xs font-semibold transition-all ${
                      selectedMethod === 'cash' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {selectedMethod === 'cash' ? 'Selected' : 'Select'}
                  </span>
                </button>
              </div>

              {/* Status information stub */}
              {selectedMethod && (
                <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 transition-all animate-fade-in">
                  <div className="flex gap-3">
                    <ShieldCheck className="h-5 w-5 text-rose-700 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-rose-900">Ready to Confirm via {selectedMethod === 'kashier_card' ? 'Kashier' : selectedMethod === 'instapay' ? 'InstaPay' : 'Cash'}</h4>
                      <p className="mt-1 text-xs leading-5 text-rose-700">
                        {selectedMethod === 'cash'
                          ? 'Cash bookings require a mandatory 50% deposit clearance. Your request will be submitted as Pending and reviewed manually.'
                          : selectedMethod === 'instapay'
                            ? 'InstaPay requests are submitted with Pending status. You will receive an official response within 24 hours.'
                            : 'You will be redirected to Kashier checkout. After successful callback, your request remains Pending until manual admin action.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {message ? <p className="mt-4 text-sm text-rose-600">{message}</p> : null}

              <button
                type="button"
                onClick={handleConfirmReservation}
                disabled={!selectedMethod || submitting}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-[#283f5e] px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Processing...' : 'Confirm Reservation'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
