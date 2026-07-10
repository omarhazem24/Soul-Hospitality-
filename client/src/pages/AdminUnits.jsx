import React, { useEffect, useMemo, useState } from 'react';
import { Eye, Pencil, Search, Trash2, X } from 'lucide-react';
import { apiDelete, fetchAdminUnits, quickEditProperty } from '../api/http.js';
import { AdminUnitForm } from './AdminUnitForm.jsx';

const formatPrice = (value) => `EGP ${Number(value || 0).toLocaleString()}`;

const UnitBadge = ({ status }) => {
  const classes = {
    Available: 'admin-pill admin-pill-available',
    Occupied: 'admin-pill admin-pill-occupied',
    Maintenance: 'admin-pill admin-pill-maintenance'
  };

  return <span className={classes[status] || 'admin-pill border-slate-200 bg-slate-100 text-slate-600'}>{status}</span>;
};

const BedBathRow = ({ unit }) => (
  <div className="flex items-center gap-4 text-xs text-slate-500">
    <span>{unit.bedrooms || unit.bedroom_count || 0} bed</span>
    <span>{unit.bathrooms || unit.bathroom_count || 0} bath</span>
    <span>{unit.floor || 'Floor'}</span>
  </div>
);

const UnitCard = ({ unit, onDeleteSuccess, onEdit }) => {
  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to permanently delete this unit?');

    if (!confirmed) {
      return;
    }

    await apiDelete(`/admin/units/${unit._id}?hard=true`);

    if (onDeleteSuccess) {
      await onDeleteSuccess();
    }
  };

  return (
    <article className="admin-card p-5 transition-shadow hover:border-slate-300">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">
            {unit.uniqueId}
          </p>
          <h3 className="mt-2 text-lg font-bold text-slate-800">{unit.name || unit.title}</h3>
        </div>
        <UnitBadge status={unit.status} />
      </div>

      <p className="mt-2 text-sm text-slate-500">{unit.projectName || unit.location}</p>

      <div className="mt-5 space-y-2">
        <BedBathRow unit={unit} />
        <p className="flex items-center gap-2 text-xs text-slate-400">{unit.view ? <><Eye className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" /> <span>{unit.view}</span></> : 'No view note'}</p>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="text-sm font-semibold text-slate-700">Commission rules are handled at reservation level.</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-base font-bold text-slate-800">{formatPrice(unit.pricePerNight || unit.price)} <span className="text-xs font-normal text-slate-400">/ Night</span></p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit?.(unit)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-[#283f5e] hover:text-[#283f5e]"
            >
              <Pencil size={16} strokeWidth={1.8} aria-hidden="true" />
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100"
              aria-label={`Delete ${unit.name || unit.title}`}
            >
              <Trash2 size={16} strokeWidth={1.8} aria-hidden="true" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export const AdminUnits = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [projectFilter, setProjectFilter] = useState('All Projects');
  const [bedroomFilter, setBedroomFilter] = useState('All Bedrooms');
  const [showModal, setShowModal] = useState(false);
  const [selectedUnitForEdit, setSelectedUnitForEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editState, setEditState] = useState({
    pricePerNight: '',
    beachAccessPricePerPersonPerWeek: '',
    beachAccessExtraGuestPricePerPerson: '',
    beachAccessDays: '',
    status: 'Available'
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editMessage, setEditMessage] = useState('');

  const openEditModal = (unit) => {
    setSelectedUnitForEdit(unit);
    setEditState({
      pricePerNight: unit?.pricePerNight ?? unit?.price ?? '',
      beachAccessPricePerPersonPerWeek: unit?.beachAccessPricePerPersonPerWeek ?? '',
      beachAccessExtraGuestPricePerPerson: unit?.beachAccessExtraGuestPricePerPerson ?? '',
      beachAccessDays: unit?.beachAccessDays ?? '',
      status: unit?.status || 'Available'
    });
    setEditMessage('');
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUnitForEdit(null);
    setEditMessage('');
    setEditSubmitting(false);
  };

  const loadUnits = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = await fetchAdminUnits();
      setUnits(Array.isArray(payload) ? payload : []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnits();
  }, []);

  const projectOptions = useMemo(() => ['All Projects', ...new Set(units.map((unit) => unit.projectName || unit.location).filter(Boolean))], [units]);
  const bedroomOptions = useMemo(() => ['All Bedrooms', ...new Set(units.map((unit) => String(unit.bedrooms || unit.bedroom_count || 0)).filter(Boolean))], [units]);

  const filteredUnits = useMemo(
    () =>
      units.filter((unit) => {
        const haystack = [unit.uniqueId, unit.name, unit.projectName, unit.location, unit.view].join(' ').toLowerCase();
        const matchesSearch = haystack.includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'All Status' || String(unit.status || '').toLowerCase() === statusFilter.toLowerCase();
        const matchesProject = projectFilter === 'All Projects' || (unit.projectName || unit.location) === projectFilter;
        const matchesBedrooms = bedroomFilter === 'All Bedrooms' || String(unit.bedrooms || unit.bedroom_count || 0) === bedroomFilter;
        return matchesSearch && matchesStatus && matchesProject && matchesBedrooms;
      }),
    [units, search, statusFilter, projectFilter, bedroomFilter]
  );

  const handleQuickEditSubmit = async (event) => {
    event.preventDefault();

    if (!selectedUnitForEdit?._id) {
      return;
    }

    setEditSubmitting(true);
    setEditMessage('');

    try {
      await quickEditProperty(selectedUnitForEdit._id, {
        pricePerNight: Number(editState.pricePerNight || 0),
        beachAccessPricePerPersonPerWeek: Number(editState.beachAccessPricePerPersonPerWeek || 0),
        beachAccessExtraGuestPricePerPerson: Number(editState.beachAccessExtraGuestPricePerPerson || 0),
        beachAccessDays: Number(editState.beachAccessDays || 7),
        status: editState.status
      });

      await loadUnits();
      closeEditModal();
    } catch (quickEditError) {
      setEditMessage(quickEditError.message);
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Units</p>
          <h1 className="mt-2 text-3xl font-bold text-[#283f5e]">{units.length} units total</h1>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setShowModal(true)} className="rounded-full bg-[#283f5e] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1e3047]">
            + Add Unit
          </button>
        </div>
      </div>

      <div className="admin-card-soft grid gap-4 p-4 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-500 lg:col-span-1">
          <Search className="h-4 w-4 text-slate-400" strokeWidth={1.5} aria-hidden="true" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search units, projects, owners..." className="w-full bg-transparent outline-none placeholder:text-slate-400" />
        </label>

        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600 outline-none">
          <option>All Status</option>
          <option>Available</option>
          <option>Occupied</option>
          <option>Maintenance</option>
        </select>

        <select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600 outline-none">
          {projectOptions.map((item) => <option key={item}>{item}</option>)}
        </select>

        <select value={bedroomFilter} onChange={(event) => setBedroomFilter(event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600 outline-none">
          {bedroomOptions.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>

      {loading ? <div className="admin-card-soft p-6 text-sm text-slate-500">Loading units...</div> : null}
      {error ? <div className="admin-card-soft p-6 text-sm text-slate-500">{error}</div> : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredUnits.map((unit) => (
          <UnitCard key={unit._id} unit={unit} onDeleteSuccess={loadUnits} onEdit={openEditModal} />
        ))}
      </div>

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-8">
          <div className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <button type="button" onClick={() => setShowModal(false)} className="absolute right-5 top-5 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close modal">
              <X className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
            </button>
            <h2 className="mb-6 text-2xl font-serif font-bold text-[#283f5e]">Add Unit</h2>
            <AdminUnitForm
              onCancel={() => setShowModal(false)}
              onSaved={async () => {
                setShowModal(false);
                await loadUnits();
              }}
            />
          </div>
        </div>
      ) : null}

      {isEditModalOpen && selectedUnitForEdit ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-8">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <button type="button" onClick={closeEditModal} className="absolute right-5 top-5 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close edit modal">
              <X className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
            </button>
            <h2 className="mb-2 text-2xl font-serif font-bold text-[#283f5e]">Quick Edit Unit</h2>
            <p className="mb-6 text-sm text-slate-500">You can update price, both beach access rates, the beach access period, and status here.</p>

            <form onSubmit={handleQuickEditSubmit} className="space-y-4">
              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Price Per Night
                <input
                  type="number"
                  min="0"
                  value={editState.pricePerNight}
                  onChange={(event) => setEditState((current) => ({ ...current, pricePerNight: event.target.value }))}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#283f5e]"
                  required
                />
              </label>

              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Beach Access Price Per Person
                <input
                  type="number"
                  min="0"
                  value={editState.beachAccessPricePerPersonPerWeek}
                  onChange={(event) => setEditState((current) => ({ ...current, beachAccessPricePerPersonPerWeek: event.target.value }))}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#283f5e]"
                  required
                />
              </label>

              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Beach Access Extra Guest Price
                <input
                  type="number"
                  min="0"
                  value={editState.beachAccessExtraGuestPricePerPerson}
                  onChange={(event) => setEditState((current) => ({ ...current, beachAccessExtraGuestPricePerPerson: event.target.value }))}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#283f5e]"
                  required
                />
              </label>

              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Beach Access Period (Days)
                <input
                  type="number"
                  min="1"
                  value={editState.beachAccessDays}
                  onChange={(event) => setEditState((current) => ({ ...current, beachAccessDays: event.target.value }))}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#283f5e]"
                  required
                />
              </label>

              <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Status
                <select
                  value={editState.status}
                  onChange={(event) => setEditState((current) => ({ ...current, status: event.target.value }))}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#283f5e]"
                >
                  <option>Available</option>
                  <option>Occupied</option>
                  <option>Maintenance</option>
                </select>
              </label>

              {editMessage ? <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">{editMessage}</div> : null}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeEditModal} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={editSubmitting} className="rounded-full bg-[#283f5e] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1e3047] disabled:opacity-70">
                  {editSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};
