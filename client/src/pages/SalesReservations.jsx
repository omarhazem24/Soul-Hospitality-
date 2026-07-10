import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Trash2, X } from 'lucide-react';
import { deleteSalesReservation, fetchAvailableUnits, fetchSalesReservations, updateSalesReservationStatus } from '../api/http.js';
import { SalesReservationModal } from '../components/sales/SalesReservationModal.jsx';

const statusOptions = ['Pending', 'Accepted', 'Rejected'];
const formatEGP = (value) => new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 2 }).format(Number(value || 0));
const getPaymentMethodClasses = (method) => {
  if (method === 'kashier_card' || method === 'card') {
    return 'bg-purple-100 text-purple-700';
  }

  if (method === 'instapay') {
    return 'bg-green-100 text-green-700';
  }

  return 'bg-amber-100 text-amber-700';
};

const formatPaymentMethodLabel = (method) => {
  if (method === 'kashier_card') {
    return 'CARD';
  }

  return String(method || 'cash').toUpperCase();
};

const formatDate = (value) => {
  if (!value) {
    return '-';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '-';
  }

  return parsed.toLocaleDateString('en-GB');
};

const toIdPhotos = (reservation) => {
  if (Array.isArray(reservation?.idPhotos)) {
    return reservation.idPhotos.filter(Boolean);
  }

  if (Array.isArray(reservation?.customer?.idPhotos)) {
    return reservation.customer.idPhotos.filter(Boolean);
  }

  return [];
};

export const SalesReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState('');
  const [deletingReservationId, setDeletingReservationId] = useState('');
  const [previewPhotos, setPreviewPhotos] = useState([]);
  const [previewPhotoIndex, setPreviewPhotoIndex] = useState(0);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [reservationPayload, unitPayload] = await Promise.all([fetchSalesReservations(), fetchAvailableUnits()]);
      setReservations(Array.isArray(reservationPayload) ? reservationPayload : []);
      setUnits(Array.isArray(unitPayload) ? unitPayload : []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (previewPhotos.length === 0) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setPreviewPhotos([]);
        setPreviewPhotoIndex(0);
        return;
      }

      if (previewPhotos.length <= 1) {
        return;
      }

      if (event.key === 'ArrowLeft') {
        setPreviewPhotoIndex((current) => (current - 1 + previewPhotos.length) % previewPhotos.length);
      }

      if (event.key === 'ArrowRight') {
        setPreviewPhotoIndex((current) => (current + 1) % previewPhotos.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewPhotos]);

  const summary = useMemo(() => ({
    total: reservations.length,
    accepted: reservations.filter((item) => item.status === 'Accepted').length,
    pending: reservations.filter((item) => item.status === 'Pending').length
  }), [reservations]);

  const handleStatusChange = async (reservationId, status) => {
    setUpdatingStatusId(reservationId);
    try {
      await updateSalesReservationStatus(reservationId, status);
      setReservations((current) => current.map((item) => (item._id === reservationId ? { ...item, status } : item)));
    } catch (updateError) {
      setError(updateError.message || 'Could not update reservation status.');
    } finally {
      setUpdatingStatusId('');
    }
  };

  const handleDeleteReservation = async (reservationId) => {
    const confirmed = window.confirm('Delete this reservation permanently?');
    if (!confirmed) {
      return;
    }

    setDeletingReservationId(reservationId);
    setError('');

    try {
      await deleteSalesReservation(reservationId);
      setReservations((current) => current.filter((item) => item._id !== reservationId));
    } catch (deleteError) {
      setError(deleteError.message || 'Could not delete reservation.');
    } finally {
      setDeletingReservationId('');
    }
  };

  const openPhotoPreview = (photos, selectedPhoto) => {
    const safePhotos = Array.isArray(photos) ? photos.filter(Boolean) : [];
    if (!safePhotos.length) {
      return;
    }

    const selectedIndex = Math.max(0, safePhotos.findIndex((item) => item === selectedPhoto));
    setPreviewPhotos(safePhotos);
    setPreviewPhotoIndex(selectedIndex);
  };

  const closePhotoPreview = () => {
    setPreviewPhotos([]);
    setPreviewPhotoIndex(0);
  };

  const previewPhotoUrl = previewPhotos[previewPhotoIndex] || '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Reservations</p>
          <h1 className="mt-2 text-3xl font-bold text-[#283f5e]">Sales reservations</h1>
        </div>
        <button type="button" onClick={() => setShowModal(true)} className="rounded-full bg-[#283f5e] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1e3047]">
          + Add Reservation
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="admin-card p-5"><p className="text-xs uppercase tracking-[0.16em] text-slate-400">Total</p><p className="mt-2 text-3xl font-bold text-[#283f5e]">{summary.total}</p></div>
        <div className="admin-card p-5"><p className="text-xs uppercase tracking-[0.16em] text-slate-400">Accepted</p><p className="mt-2 text-3xl font-bold text-[#283f5e]">{summary.accepted}</p></div>
        <div className="admin-card p-5"><p className="text-xs uppercase tracking-[0.16em] text-slate-400">Pending</p><p className="mt-2 text-3xl font-bold text-[#283f5e]">{summary.pending}</p></div>
      </div>

      {loading ? <div className="admin-card p-6 text-sm text-slate-500">Loading reservations...</div> : null}
      {error ? <div className="admin-card p-6 text-sm text-slate-500">{error}</div> : null}

      <div className="admin-table-wrap">
        <div className="hidden grid-cols-[1.2fr_0.9fr_0.6fr_1fr_1fr_0.9fr_0.9fr_1fr_1fr_0.8fr] gap-4 border-b border-slate-200 px-5 py-3 lg:grid admin-table-head">
          <span>Customer</span>
          <span>Phone</span>
          <span>Guests</span>
          <span>ID Photos</span>
          <span>Check-In</span>
          <span>Check-Out</span>
          <span>Payment</span>
          <span>Commission</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        <div className="grid gap-0">
          {reservations.map((reservation) => (
            <article key={reservation._id} className="grid gap-3 border-b border-slate-100 px-5 py-4 last:border-b-0 hover:bg-slate-50/70 lg:grid-cols-[1.2fr_0.9fr_0.6fr_1fr_1fr_0.9fr_0.9fr_1fr_1fr_0.8fr] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{reservation.unit?.uniqueId || reservation.unit?.title}</p>
                <h3 className="mt-1 text-sm font-bold text-slate-800">{reservation.customerName || reservation.customer?.name || 'Customer'}</h3>
                <p className="text-xs text-slate-500">{reservation.customer?.email || reservation.user?.email || '-'}</p>
              </div>

              <p className="text-sm text-slate-600">{reservation.customerPhone || reservation.customer?.phone || reservation.user?.phone_number || '-'}</p>
              <p className="text-sm font-semibold text-slate-700">{reservation.numberOfGuests || reservation.guest_count || 0}</p>

              <div className="flex flex-wrap gap-2">
                {toIdPhotos(reservation).length > 0 ? toIdPhotos(reservation).map((photo) => (
                  <button key={photo} type="button" onClick={() => openPhotoPreview(toIdPhotos(reservation), photo)} className="relative">
                    <img src={photo} alt="ID" className="h-12 w-12 rounded-lg border border-slate-200 object-cover" />
                    <span className="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#283f5e] text-white shadow-sm">
                      <Maximize2 className="h-2.5 w-2.5" strokeWidth={2} aria-hidden="true" />
                    </span>
                  </button>
                )) : <span className="text-xs italic text-slate-400">No photos</span>}
              </div>

              <p className="text-sm text-slate-600">{formatDate(reservation.startDate || reservation.dates?.checkIn)}</p>
              <p className="text-sm text-slate-600">{formatDate(reservation.endDate || reservation.dates?.checkOut)}</p>

              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentMethodClasses(reservation.paymentMethod)}`}>
                  {formatPaymentMethodLabel(reservation.paymentMethod)}
                </span>
              </div>

              <p className="text-sm font-semibold text-slate-700">{formatEGP(reservation.commissionAmount)}</p>

              <div className="flex items-center gap-2">
                <select
                  value={reservation.status || 'Pending'}
                  onChange={(event) => handleStatusChange(reservation._id, event.target.value)}
                  disabled={updatingStatusId === reservation._id}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#283f5e]"
                >
                  {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
                <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{reservation.status || 'Pending'}</span>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => handleDeleteReservation(reservation._id)}
                  disabled={deletingReservationId === reservation._id}
                  className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
                  {deletingReservationId === reservation._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {previewPhotoUrl ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4">
          <button type="button" className="absolute inset-0" aria-label="Close image preview" onClick={closePhotoPreview} />
          <div className="relative z-10 max-h-[90vh] max-w-5xl overflow-hidden rounded-2xl border border-white/20 bg-black">
            <img src={previewPhotoUrl} alt="Reservation ID full preview" className="max-h-[90vh] w-full object-contain" />

            {previewPhotos.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => setPreviewPhotoIndex((current) => (current - 1 + previewPhotos.length) % previewPhotos.length)}
                  className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white hover:bg-black/60"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewPhotoIndex((current) => (current + 1) % previewPhotos.length)}
                  className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white hover:bg-black/60"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
                </button>
              </>
            ) : null}

            <a
              href={previewPhotoUrl}
              target="_blank"
              rel="noreferrer"
              className="absolute left-3 top-3 inline-flex h-9 items-center justify-center rounded-full border border-white/20 bg-black/40 px-3 text-xs font-semibold text-white hover:bg-black/60"
            >
              Open Original
            </a>

            <button
              type="button"
              onClick={closePhotoPreview}
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white hover:bg-black/60"
              aria-label="Close image preview"
            >
              <X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}

      {showModal ? <SalesReservationModal open={showModal} onClose={() => setShowModal(false)} onSaved={loadData} units={units} /> : null}
    </div>
  );
};
