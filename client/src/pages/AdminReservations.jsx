import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { fetchAdminBookingRequests } from '../api/http.js';

const formatEGP = (value) => new Intl.NumberFormat('en-EG', {
  style: 'currency',
  currency: 'EGP',
  maximumFractionDigits: 2,
}).format(Number(value || 0));

const statusClass = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'accepted') return 'admin-pill admin-pill-accepted';
  if (normalized === 'pending') return 'admin-pill admin-pill-pending';
  if (normalized === 'rejected') return 'admin-pill admin-pill-rejected';
  return 'admin-pill border-slate-200 bg-slate-100 text-slate-600';
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

export const AdminReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewPhotos, setPreviewPhotos] = useState([]);
  const [previewPhotoIndex, setPreviewPhotoIndex] = useState(0);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const reservationPayload = await fetchAdminBookingRequests();
      setReservations(Array.isArray(reservationPayload) ? reservationPayload : []);
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
          <h1 className="mt-2 text-3xl font-bold text-[#283f5e]">Reservations (Read Only)</h1>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="admin-card p-5"><p className="text-xs uppercase tracking-[0.16em] text-slate-400">Total</p><p className="mt-2 text-3xl font-bold text-[#283f5e]">{summary.total}</p></div>
        <div className="admin-card p-5"><p className="text-xs uppercase tracking-[0.16em] text-slate-400">Accepted</p><p className="mt-2 text-3xl font-bold text-[#283f5e]">{summary.accepted}</p></div>
        <div className="admin-card p-5"><p className="text-xs uppercase tracking-[0.16em] text-slate-400">Pending</p><p className="mt-2 text-3xl font-bold text-[#283f5e]">{summary.pending}</p></div>
      </div>

      {loading ? <div className="admin-card p-6 text-sm text-slate-500">Loading reservations...</div> : null}
      {error ? <div className="admin-card p-6 text-sm text-slate-500">{error}</div> : null}

      <div className="admin-table-wrap">
        <div className="hidden grid-cols-[1.3fr_1fr_0.8fr_1.2fr_0.8fr_0.9fr] gap-4 border-b border-slate-200 px-5 py-3 lg:grid admin-table-head">
          <span>Customer</span>
          <span>Phone</span>
          <span>Guests</span>
          <span>ID Photos</span>
          <span>Status</span>
          <span>Stay</span>
        </div>

        <div className="grid gap-0">
        {reservations.map((reservation) => (
          <article key={reservation._id} className="grid gap-3 border-b border-slate-100 px-5 py-4 last:border-b-0 hover:bg-slate-50/70 lg:grid-cols-[1.3fr_1fr_0.8fr_1.2fr_0.8fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{reservation.unit?.uniqueId || reservation.unit?.title}</p>
              <h3 className="mt-1 text-sm font-bold text-slate-800">{reservation.customerName || reservation.customer?.name || reservation.user?.name || 'Customer'}</h3>
              <p className="text-xs text-slate-500">{reservation.customer?.email || reservation.user?.email || '-'}</p>
              {Number(reservation.commissionPercentage || 0) > 0 && Number(reservation.commissionAmount || 0) > 0 ? (
                <p className="mt-1 text-xs font-medium text-amber-700">
                  Commission ({reservation.commissionPercentage}%): {formatEGP(reservation.commissionAmount)}
                </p>
              ) : null}
            </div>

            <p className="text-sm text-slate-600">{reservation.customerPhone || reservation.customer?.phone || reservation.user?.phone_number || '-'}</p>

            <p className="text-sm font-semibold text-slate-700">{reservation.numberOfGuests || reservation.guest_count || 0}</p>

            <div className="flex flex-wrap gap-2">
              {toIdPhotos(reservation).length > 0 ? toIdPhotos(reservation).map((photo) => (
                <button key={photo} type="button" onClick={() => openPhotoPreview(toIdPhotos(reservation), photo)} className="relative">
                  <img src={photo} alt="ID" className="h-10 w-10 rounded-lg border border-slate-200 object-cover" />
                  <span className="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#283f5e] text-white shadow-sm">
                    <Maximize2 className="h-2.5 w-2.5" strokeWidth={2} aria-hidden="true" />
                  </span>
                </button>
              )) : <span className="text-xs italic text-slate-400">No photos</span>}
            </div>

            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(reservation.status)}`}>{reservation.status || 'Pending'}</span>
            </div>

            <div className="text-xs text-slate-600">
              <p>{reservation.startDate ? new Date(reservation.startDate).toLocaleDateString() : '-'}</p>
              <p>{reservation.endDate ? new Date(reservation.endDate).toLocaleDateString() : '-'}</p>
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
    </div>
  );
};
