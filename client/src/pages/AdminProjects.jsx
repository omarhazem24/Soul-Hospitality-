import React, { useEffect, useMemo, useState } from 'react';
import { createProjectName, fetchProjectCatalog } from '../api/http.js';

export const AdminProjects = () => {
  const [destinations, setDestinations] = useState([]);
  const [projectsByDestination, setProjectsByDestination] = useState({});
  const [selectedDestination, setSelectedDestination] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
  const [projectNameInput, setProjectNameInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const loadCatalog = async () => {
    setLoading(true);

    try {
      const payload = await fetchProjectCatalog();
      const nextDestinations = Array.isArray(payload?.destinations) ? payload.destinations : [];
      const nextProjectsByDestination = payload?.projectsByDestination && typeof payload.projectsByDestination === 'object'
        ? payload.projectsByDestination
        : {};

      setDestinations(nextDestinations);
      setProjectsByDestination(nextProjectsByDestination);

      if (!selectedDestination && nextDestinations.length > 0) {
        setSelectedDestination(nextDestinations[0]);
      } else if (selectedDestination && !nextDestinations.includes(selectedDestination)) {
        setSelectedDestination(nextDestinations[0] || '');
      }
    } catch (loadError) {
      setMessage(loadError.message);
      setDestinations([]);
      setProjectsByDestination({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const selectedProjects = useMemo(() => {
    if (!selectedDestination) {
      return [];
    }

    return Array.isArray(projectsByDestination[selectedDestination])
      ? projectsByDestination[selectedDestination]
      : [];
  }, [projectsByDestination, selectedDestination]);

  const handleCreate = async (event) => {
    event.preventDefault();

    const destination = String(destinationInput || selectedDestination || '').trim();
    const projectName = String(projectNameInput || '').trim();

    if (!destination || !projectName) {
      setMessage('Both destination and project name are required.');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const payload = await createProjectName({ destination, name: projectName });
      const nextDestinations = Array.isArray(payload?.destinations) ? payload.destinations : [];
      const nextProjectsByDestination = payload?.projectsByDestination && typeof payload.projectsByDestination === 'object'
        ? payload.projectsByDestination
        : {};

      setDestinations(nextDestinations);
      setProjectsByDestination(nextProjectsByDestination);
      setSelectedDestination(destination);
      setDestinationInput('');
      setProjectNameInput('');
      setMessage(`Added ${projectName} under ${destination}.`);
    } catch (submitError) {
      setMessage(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Project Mapping</p>
        <h1 className="mt-2 text-3xl font-bold text-[#283f5e]">Destinations & Project Names</h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage destination/project options here. Unit forms will use these options as selectors.
        </p>
      </div>

      <form onSubmit={handleCreate} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Add Mapping</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Destination
            <select
              value={selectedDestination}
              onChange={(event) => setSelectedDestination(event.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#283f5e]"
            >
              <option value="">Select existing destination</option>
              {destinations.map((destination) => (
                <option key={destination} value={destination}>
                  {destination}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            New Destination (Optional)
            <input
              value={destinationInput}
              onChange={(event) => setDestinationInput(event.target.value)}
              placeholder="e.g. Cairo"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#283f5e]"
            />
          </label>

          <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 md:col-span-2">
            Project Name
            <input
              value={projectNameInput}
              onChange={(event) => setProjectNameInput(event.target.value)}
              placeholder="e.g. Zamalek"
              required
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#283f5e]"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-[#283f5e] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1e3047] disabled:opacity-70"
        >
          {submitting ? 'Saving...' : 'Save Mapping'}
        </button>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Current Catalog</h2>
          <button
            type="button"
            onClick={loadCatalog}
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        {loading ? <p className="text-sm text-slate-500">Loading catalog...</p> : null}

        {!loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {destinations.map((destination) => {
              const projects = Array.isArray(projectsByDestination[destination]) ? projectsByDestination[destination] : [];

              return (
                <div key={destination} className="rounded-xl border border-slate-200 p-4">
                  <p className="text-sm font-bold text-[#283f5e]">{destination}</p>
                  {projects.length > 0 ? (
                    <ul className="mt-2 space-y-1 text-sm text-slate-600">
                      {projects.map((projectName) => (
                        <li key={`${destination}-${projectName}`}>- {projectName}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-slate-400">No project names yet.</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : null}

        {!loading && destinations.length === 0 ? (
          <p className="text-sm text-slate-400">No destinations or projects available yet.</p>
        ) : null}
      </div>

      {message ? <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">{message}</div> : null}
    </div>
  );
};
