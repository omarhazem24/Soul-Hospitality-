import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Minus, Plus, ShieldCheck, UserRound, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { validatePromoCode } from '../../api/http.js';
import { calculateTaxInvoice } from '../../utils/taxInvoice.js';

const today = () => new Date().toISOString().split('T')[0];
const MIN_STAY_NIGHTS = 4;
const GAIA_MIN_STAY_NIGHTS = 3;
const GAIA_BEACH_ACCESS_DAYS = 7;
const GAIA_BEACH_BASE_PRICE = 3500;
const GAIA_BEACH_EXTRA_PRICE = 4000;

const dayDifference = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return 0;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const difference = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  return Number.isFinite(difference) && difference > 0 ? difference : 0;
};

const hasDateRangeOverlap = (checkInDate, checkOutDate, bookedRanges = []) => {
  if (!checkInDate || !checkOutDate || !Array.isArray(bookedRanges) || bookedRanges.length === 0) {
    return false;
  }

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
    return false;
  }

  return bookedRanges.some((range) => {
    const existingCheckIn = new Date(range.checkIn);
    const existingCheckOut = new Date(range.checkOut);
    return checkIn < existingCheckOut && checkOut > existingCheckIn;
  });
};

const formatPrice = (value) => `EGP ${Number(value || 0).toLocaleString()}`;

const getUnitCapacity = (unit) => Number(unit?.capacity || Math.max(1, Number(unit?.bedrooms || unit?.bedroom_count || 0) * 2 || 1));

const getGuestLoad = (adults, children) => Number(adults || 0) + Number(children || 0) * 0.5;

const getDynamicHousekeepingFee = (unit) => {
  const propertyType = String(unit?.propertyType || unit?.type || '').trim().toLowerCase();
  return propertyType === 'villa' ? 2500 : 1500;
};

const getBeachAccessDays = (unit) => {
  const rawValue = Number(unit?.beachAccessDays ?? unit?.beach_access_days ?? 7);
  return Number.isFinite(rawValue) && rawValue > 0 ? rawValue : 7;
};

const getConfiguredBeachAccessPrice = (unit) => Number(
  unit?.beachAccessPricePerPersonPerWeek ??
  unit?.beachAccessPricePerPerson ??
  unit?.beach_access_price_per_person_per_week ??
  unit?.beach_access_price_per_person ??
  unit?.beachAccessPrice ??
  500
);

const isGaiaUnit = (unit) => String(
  unit?.projectName ??
  unit?.destination ??
  unit?.location ??
  ''
).trim().toLowerCase() === 'gaia';

const getMinimumStayNights = (unit) => (isGaiaUnit(unit) ? GAIA_MIN_STAY_NIGHTS : MIN_STAY_NIGHTS);

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

const IncrementControl = ({ label, value, onIncrement, onDecrement, min = 0 }) => (
  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
    <div>
      <p className="text-sm font-semibold text-slate-900">{label}</p>
      <p className="text-xs text-slate-500">Adjust guest count</p>
    </div>
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onDecrement}
        disabled={value <= min}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:border-[#283f5e] hover:text-[#283f5e] disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={`Decrease ${label.toLowerCase()}`}
      >
        <Minus className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden="true" />
      </button>
      <span className="min-w-8 text-center text-sm font-semibold text-slate-900">{value}</span>
      <button
        type="button"
        onClick={onIncrement}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:border-[#283f5e] hover:text-[#283f5e]"
        aria-label={`Increase ${label.toLowerCase()}`}
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden="true" />
      </button>
    </div>
  </div>
);

export default function BookingDrawer({ open, onClose, unit }) {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [message, setMessage] = useState('');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoCodeState, setPromoCodeState] = useState({ code: '', percentage: 0, isValid: false, loading: false });
  const [formState, setFormState] = useState({
    checkInDate: '',
    checkOutDate: '',
    adults: 1,
    children: 0,
    fullName: '',
    identityDocuments: [],
    phone: '',
    secondaryPhone: '',
    email: '',
    notes: ''
  });

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    setFormState((current) => ({
      ...current,
      fullName: current.fullName || currentUser.name || '',
      phone: current.phone || currentUser.phone_number || currentUser.phone || '',
      email: current.email || currentUser.email || ''
    }));
  }, [currentUser]);

  useEffect(() => {
    if (!open) {
      setMessage('');
      setPromoCodeInput('');
      setPromoCodeState({ code: '', percentage: 0, isValid: false, loading: false });
    }
  }, [open]);

  useEffect(() => {
    if (!promoCodeState.isValid) {
      return;
    }

    const normalizedInput = String(promoCodeInput || '').trim().toUpperCase();

    if (normalizedInput !== promoCodeState.code) {
      setPromoCodeState({ code: '', percentage: 0, isValid: false, loading: false });
    }
  }, [promoCodeInput, promoCodeState.code, promoCodeState.isValid]);

  const nights = useMemo(() => dayDifference(formState.checkInDate, formState.checkOutDate), [formState.checkInDate, formState.checkOutDate]);
  const minimumStayNights = useMemo(() => getMinimumStayNights(unit), [unit]);
  const belowMinimumStay = nights > 0 && nights < minimumStayNights;
  const nightlyRate = Number(unit?.pricePerNight || unit?.price || 0);
  const housekeepingMandatoryPrice = getDynamicHousekeepingFee(unit);
  const gaiaBeachOverride = useMemo(() => getGaiaBeachOverride(unit, nights), [unit, nights]);
  const configuredBeachBasePrice = getConfiguredBeachAccessPrice(unit);
  const beachAccessPricePerPersonPerWeek = gaiaBeachOverride?.beachAccessPricePerPersonPerWeek ?? configuredBeachBasePrice;
  const beachAccessExtraGuestPricePerPerson = gaiaBeachOverride?.beachAccessExtraGuestPricePerPerson ?? getBeachAccessExtraGuestPrice(unit, configuredBeachBasePrice);
  const beachAccessDays = gaiaBeachOverride?.beachAccessDays ?? getBeachAccessDays(unit);
  const subtotalAmount = nights > 0 ? nightlyRate * nights : 0;
  const stayWeeks = nights > 0 ? Math.ceil(nights / beachAccessDays) : 0;
  const beachPassHeadcount = Number(formState.adults || 0);
  const unitCapacity = useMemo(() => getUnitCapacity(unit), [unit]);
  const guestLoad = useMemo(() => getGuestLoad(formState.adults, formState.children), [formState.adults, formState.children]);
  const includedBeachGuests = Math.min(beachPassHeadcount, unitCapacity);
  const extraBeachGuests = Math.max(0, beachPassHeadcount - unitCapacity);
  const beachAccessAmount = ((includedBeachGuests * beachAccessPricePerPersonPerWeek) + (extraBeachGuests * beachAccessExtraGuestPricePerPerson)) * stayWeeks;
  const grossAmount = subtotalAmount + housekeepingMandatoryPrice + beachAccessAmount;
  const invoice = useMemo(() => calculateTaxInvoice({
    subtotal: grossAmount,
    promoDiscountPercentage: promoCodeState.isValid ? promoCodeState.percentage : 0
  }), [grossAmount, promoCodeState.isValid, promoCodeState.percentage]);
  const promoDiscountAmount = invoice.promoDiscountAmount;
  const totalAmount = invoice.taxableSubtotal;

  const isOverlapping = useMemo(() => {
    if (!formState.checkInDate || !formState.checkOutDate || !unit?.bookedRanges) {
      return false;
    }
    const checkIn = new Date(formState.checkInDate);
    const checkOut = new Date(formState.checkOutDate);
    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      return false;
    }
    return unit.bookedRanges.some((range) => {
      const existingCheckIn = new Date(range.checkIn);
      const existingCheckOut = new Date(range.checkOut);
      return checkIn < existingCheckOut && checkOut > existingCheckIn;
    });
  }, [formState.checkInDate, formState.checkOutDate, unit?.bookedRanges]);

  if (!open) {
    return null;
  }

  const isGuest = currentUser === null;

  const handleChange = (field, value) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const handleDateChange = (field, value) => {
    setFormState((current) => {
      const nextState = { ...current, [field]: value };
      if (!nextState.checkInDate || !nextState.checkOutDate) {
        return nextState;
      }

      if (hasDateRangeOverlap(nextState.checkInDate, nextState.checkOutDate, unit?.bookedRanges)) {
        setMessage('This date range is locked by an existing pending or accepted reservation.');
        return current;
      }

      setMessage('');
      return nextState;
    });
  };

  const handleIdentityDocumentsChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []).slice(0, 2);
    setFormState((current) => ({ ...current, identityDocuments: selectedFiles }));
  };

  const handlePromoValidation = async () => {
    const code = String(promoCodeInput || '').trim();

    if (!code) {
      setPromoCodeState({ code: '', percentage: 0, isValid: false, loading: false });
      setMessage('');
      return;
    }

    setPromoCodeState((current) => ({ ...current, loading: true, isValid: false, code: current.code, percentage: current.percentage }));
    setMessage('');

    try {
      const promo = await validatePromoCode({ code });
      setPromoCodeState({
        code: promo.code,
        percentage: Number(promo.percentage || 0),
        isValid: true,
        loading: false
      });
      setMessage(`Promo code applied: ${promo.code} (${promo.percentage}% off).`);
    } catch (promoError) {
      setPromoCodeState({ code: '', percentage: 0, isValid: false, loading: false });
      setMessage(promoError.message);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage('');

    if (!currentUser?._id) {
      setMessage('Please log in or register to continue.');
      return;
    }

    if (!formState.checkInDate || !formState.checkOutDate) {
      setMessage('Please choose both check-in and check-out dates.');
      return;
    }

    if (!String(formState.fullName || '').trim()) {
      setMessage('Full legal name is required.');
      return;
    }

    if (!String(formState.phone || '').trim()) {
      setMessage('Phone number is required.');
      return;
    }

    if (!String(formState.email || '').trim()) {
      setMessage('Email address is required.');
      return;
    }

    if (nights <= 0) {
      setMessage('Check-out must be after check-in.');
      return;
    }

    if (nights < minimumStayNights) {
      setMessage(`Minimum stay is ${minimumStayNights} nights for this unit.`);
      return;
    }

    if (!Array.isArray(formState.identityDocuments) || formState.identityDocuments.length === 0) {
      setMessage('Please upload at least one National ID or Passport photo.');
      return;
    }

    if (isOverlapping) {
      setMessage('The requested duration overlaps with an existing reservation for this unit.');
      return;
    }

    const checkoutState = {
      unit,
      formState,
      nights,
      stayWeeks,
      beachAccessDays,
      nightlyRate,
      subtotalAmount,
      housekeepingMandatoryPrice,
      beachAccessPricePerPersonPerWeek,
      beachAccessExtraGuestPricePerPerson,
      beachPassHeadcount,
      includedBeachGuests,
      extraBeachGuests,
      beachAccessAmount,
      grossAmount,
      discountPercentage: promoCodeState.percentage,
      discountAmount: promoDiscountAmount,
      taxAmount: invoice.taxAmount,
      finalTotalAmount: invoice.finalPrice,
      vatRate: invoice.taxRate,
      totalAmount,
      guestLoad,
      promoCode: promoCodeState.code
    };

    navigate('/checkout/payment', { state: checkoutState });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/55 backdrop-blur-[2px]">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close booking drawer overlay" onClick={onClose} />

      <aside className="relative flex h-full w-full max-w-none flex-col bg-white shadow-2xl transition-transform duration-300 ease-out lg:ml-auto lg:max-w-[50.4rem] lg:border-l lg:border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Reservation Drawer</p>
            <h2 className="mt-1 font-serif text-2xl font-bold text-slate-900">Book {unit?.name || 'this residence'}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-[#283f5e] hover:text-[#283f5e]"
            aria-label="Close drawer"
          >
            <X className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isGuest ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center shadow-sm">
                <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#283f5e] shadow-sm">
                  <ShieldCheck className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-slate-900">Login required</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Create an account or sign in first so we can prefill your profile and secure this reservation flow.</p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <button type="button" onClick={() => navigate('/login')} className="rounded-full bg-[#283f5e] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800">
                    Login
                  </button>
                  <button type="button" onClick={() => navigate('/register')} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#283f5e] transition-colors hover:border-[#283f5e]">
                    Register
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 md:col-span-2">
                  Check-in / Check-out
                  <div className="grid gap-3 lg:grid-cols-2">
                    <input type="date" min={today()} value={formState.checkInDate} onChange={(event) => handleDateChange('checkInDate', event.target.value)} className={`rounded-2xl border ${isOverlapping ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-[#283f5e]'} bg-white px-4 py-3 text-sm text-slate-700 outline-none`} required />
                    <input type="date" min={formState.checkInDate || today()} value={formState.checkOutDate} onChange={(event) => handleDateChange('checkOutDate', event.target.value)} className={`rounded-2xl border ${isOverlapping ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-[#283f5e]'} bg-white px-4 py-3 text-sm text-slate-700 outline-none`} required />
                  </div>
                  {isOverlapping ? (
                    <p className="mt-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 normal-case tracking-normal">
                      The selected duration overlaps with an existing reservation for this unit.
                    </p>
                  ) : null}
                  {belowMinimumStay ? (
                    <p className="mt-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 normal-case tracking-normal">
                      Minimum stay is {minimumStayNights} nights for this unit.
                    </p>
                  ) : null}
                </label>

                <IncrementControl
                  label="Adults"
                  value={formState.adults}
                  min={1}
                  onDecrement={() => handleChange('adults', Math.max(1, Number(formState.adults || 1) - 1))}
                  onIncrement={() => handleChange('adults', Number(formState.adults || 1) + 1)}
                />

                <IncrementControl
                  label="Children (Under 12)"
                  value={formState.children}
                  min={0}
                  onDecrement={() => handleChange('children', Math.max(0, Number(formState.children || 0) - 1))}
                  onIncrement={() => handleChange('children', Number(formState.children || 0) + 1)}
                />

                <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-900">Mandatory beach passes</span>
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {beachPassHeadcount} guests billed
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Beach pass fee is mandatory for adults only. Children under 12 are exempt.
                  </p>
                  <p className="mt-2 text-xs text-slate-500">Calculation: {includedBeachGuests} guest{includedBeachGuests === 1 ? '' : 's'} x {formatPrice(beachAccessPricePerPersonPerWeek)} + {extraBeachGuests} extra guest{extraBeachGuests === 1 ? '' : 's'} x {formatPrice(beachAccessExtraGuestPricePerPerson)} x {stayWeeks} {stayWeeks === 1 ? 'period' : 'periods'} of {beachAccessDays} {beachAccessDays === 1 ? 'day' : 'days'}.</p>
                </div>

                <div className={`md:col-span-2 rounded-2xl border px-4 py-3 text-sm ${guestLoad > unitCapacity ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">Guest load</span>
                    <span className="font-semibold">{guestLoad} / {unitCapacity}</span>
                  </div>
                  <p className="mt-2 text-xs leading-5">
                    Adults count as 1 guest and children count as 0.5 guest.
                  </p>
                  {guestLoad > unitCapacity ? (
                    <p className="mt-2 text-xs font-semibold">
                      Guests above capacity can still book, but extra adults pay the higher beach-access rate.
                    </p>
                  ) : null}
                </div>

                <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 md:col-span-2">
                  Full Legal Name
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-[#283f5e]">
                    <UserRound className="h-4 w-4 text-slate-400" strokeWidth={2} aria-hidden="true" />
                    <input value={formState.fullName} onChange={(event) => handleChange('fullName', event.target.value)} className="w-full bg-transparent text-sm text-slate-700 outline-none" placeholder="Enter full legal name" required />
                  </div>
                </label>

                <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 md:col-span-2">
                  National ID / Passport Photos
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    multiple
                    onChange={handleIdentityDocumentsChange}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#283f5e]"
                    required
                  />
                  <p className="text-[11px] normal-case tracking-normal text-slate-500">
                    Upload clear photos of your National ID or Passport (up to 2 images).
                  </p>
                  {formState.identityDocuments.length > 0 ? (
                    <ul className="space-y-1 text-[11px] normal-case tracking-normal text-slate-600">
                      {formState.identityDocuments.map((file) => (
                        <li key={`${file.name}-${file.lastModified}`}>{file.name}</li>
                      ))}
                    </ul>
                  ) : null}
                </label>

                <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Phone Number
                  <input value={formState.phone} onChange={(event) => handleChange('phone', event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#283f5e]" placeholder="Primary phone" required />
                </label>

                <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Secondary Phone
                  <input value={formState.secondaryPhone} onChange={(event) => handleChange('secondaryPhone', event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#283f5e]" placeholder="Optional" />
                </label>

                <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 md:col-span-2">
                  Email Address
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-[#283f5e]">
                    <Mail className="h-4 w-4 text-slate-400" strokeWidth={2} aria-hidden="true" />
                    <input value={formState.email} onChange={(event) => handleChange('email', event.target.value)} className="w-full bg-transparent text-sm text-slate-700 outline-none" placeholder="Enter email address" required />
                  </div>
                </label>

                <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 md:col-span-2">
                  Notes
                  <textarea value={formState.notes} onChange={(event) => handleChange('notes', event.target.value)} rows={4} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#283f5e]" placeholder="Any special request or booking note" />
                </label>

                <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 md:col-span-2">
                  Promotional Code
                  <div className="flex gap-3">
                    <input
                      value={promoCodeInput}
                      onChange={(event) => setPromoCodeInput(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#283f5e]"
                      placeholder="Enter promo code"
                    />
                    <button
                      type="button"
                      onClick={handlePromoValidation}
                      disabled={promoCodeState.loading}
                      className="inline-flex items-center justify-center rounded-2xl bg-[#283f5e] px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-slate-800 disabled:opacity-70"
                    >
                      {promoCodeState.loading ? 'Checking' : 'Verify'}
                    </button>
                  </div>
                  {promoCodeState.isValid ? (
                    <p className="text-xs font-semibold text-emerald-600">{promoCodeState.code} applied successfully.</p>
                  ) : null}
                </label>
              </div>
            </form>
          )}
        </div>

        {!isGuest ? (
          <div className="border-t border-slate-100 bg-white px-6 py-5">
            <div className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Nightly rate</span>
                <span className="font-semibold text-slate-900">{formatPrice(nightlyRate)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{formatPrice(subtotalAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Housekeeping mandatory fee</span>
                <span className="font-semibold text-slate-900">{formatPrice(housekeepingMandatoryPrice)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Beach pass fees</span>
                <span className="font-semibold text-slate-900">{formatPrice(beachAccessAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Invoice before discount</span>
                <span className="font-semibold text-slate-900">{formatPrice(grossAmount)}</span>
              </div>
              {promoCodeState.isValid ? (
                <div className="flex items-center justify-between text-sm text-emerald-700">
                  <span>Promo discount ({promoCodeState.percentage}%)</span>
                  <span className="font-semibold">- {formatPrice(promoDiscountAmount)}</span>
                </div>
              ) : null}
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Total bill</span>
                <span className="text-lg font-bold text-slate-900">{formatPrice(totalAmount)}</span>
              </div>
              <p className="text-[11px] text-slate-500">Total price calculated above is before 14% VAT / taxes.</p>
            </div>

            {message ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</div> : null}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isOverlapping || belowMinimumStay}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#283f5e] px-5 py-4 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              Proceed to Payment
            </button>
          </div>
        ) : null}
      </aside>
    </div>
  );
}