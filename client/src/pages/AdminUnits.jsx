import React, { useEffect, useMemo, useState } from 'react';
import { fetchAdminUnits } from '../api/http.js';
import { AdminUnitForm } from './AdminUnitForm.jsx';

const formatPrice = (value) => `EGP ${Number(value || 0).toLocaleString()}`;

const UnitBadge = ({ status }) => {
  const classes = {
    Available: 'bg-emerald-50 text-emerald-700',
    Occupied: 'bg-amber-50 text-amber-700',
    Maintenance: 'bg-rose-50 text-rose-700'
  };

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${classes[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>;
};

const BedBathRow = ({ unit }) => (
  <div className="flex items-center gap-4 text-xs text-slate-500">
    <span>{unit.bedrooms || unit.bedroom_count || 0} bed</span>
    <span>{unit.bathrooms || unit.bathroom_count || 0} bath</span>
    <span>{unit.floor || 'Floor'}</span>
  </div>
);

export const AdminUnits = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [projectFilter, setProjectFilter] = useState('All Projects');
  const [bedroomFilter, setBedroomFilter] = useState('All Bedrooms');
  const [showModal, setShowModal] = useState(false);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Units</p>
          <h1 className="mt-2 text-3xl font-bold text-[#283f5e]">{units.length} units total</h1>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">Grid</button>
          <button type="button" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">Table</button>
          <button type="button" onClick={() => setShowModal(true)} className="rounded-full bg-[#283f5e] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1e3047]">
            + Add Unit
          </button>
        </div>
      </div>

      <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1.5fr_repeat(3,1fr)]">
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-500 lg:col-span-1">
          <span>⌕</span>
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

      {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Loading units...</div> : null}
      {error ? <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">{error}</div> : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredUnits.map((unit) => (
          <article key={unit._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{unit.uniqueId}</p>
                <h3 className="mt-2 text-lg font-bold text-slate-800">{unit.name || unit.title}</h3>
              </div>
              <UnitBadge status={unit.status} />
            </div>

            <p className="mt-2 text-sm text-slate-500">{unit.projectName || unit.location}</p>

            <div className="mt-5 space-y-2">
              <BedBathRow unit={unit} />
              <p className="text-xs text-slate-400">{unit.view ? `👁 ${unit.view}` : 'No view note'}</p>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="text-sm font-semibold text-slate-700">
                {unit.commissionStructure?.mode === 'Mode A'
                  ? `Fixed: ${unit.commissionStructure?.modeAValue || 0}%`
                  : unit.commissionStructure?.mode === 'Mode B'
                    ? `Via Us: ${unit.commissionStructure?.modeBValues?.ownerRate || 0}% · Via Owner: ${unit.commissionStructure?.modeBValues?.tenantRate || 0}%`
                    : `Tenant: ${unit.commissionStructure?.modeCValues?.tenantFee || 0}`}
              </p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-base font-bold text-slate-800">{formatPrice(unit.pricePerNight || unit.price)} <span className="text-xs font-normal text-slate-400">/ Night</span></p>
                <button type="button" className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600">Edit</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-8">
          <div className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <button type="button" onClick={() => setShowModal(false)} className="absolute right-5 top-5 text-2xl text-slate-400 hover:text-slate-700">×</button>
            <h2 className="mb-6 text-2xl font-bold text-[#283f5e]">Add Unit</h2>
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
    </div>
  );
};
